import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '../../../lib/supabase-server'
import { createCheckoutSession } from '../../../lib/stripe'
import { z } from 'zod'

const CheckoutRequestSchema = z.object({
  priceId: z.string(),
  billingCycle: z.enum(['monthly', 'yearly']),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validationResult = CheckoutRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { priceId } = validationResult.data

    // Get or create Stripe customer
    let customerId: string | undefined

    // Check if user already has a subscription with Stripe customer ID
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id
    }

    // Create checkout session
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL
    const session = await createCheckoutSession({
      priceId,
      customerId,
      successUrl: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`,
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 