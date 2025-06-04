import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createRouteClient } from '../../../lib/supabase-server'
import { stripe } from '../../../lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createRouteClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(supabase, event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionChange(supabase: any, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id

  // Get user by Stripe customer ID
  const { data: existingUser } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!existingUser) {
    console.error('No user found for Stripe customer:', customerId)
    return
  }

  const userId = existingUser.user_id

  // Determine plan from subscription
  const priceId = subscription.items.data[0]?.price.id
  let planId = 'free'
  
  if (priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID) {
    planId = 'pro'
  } else if (priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID) {
    planId = 'premium'
  }

  // Update or create subscription
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: planId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: subscription.status === 'active' ? 'active' : 'inactive',
      current_period_start: subscription.items.data[0]?.current_period_start 
        ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString()
        : null,
      current_period_end: subscription.items.data[0]?.current_period_end
        ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
        : null,
    }, {
      onConflict: 'user_id,status',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id

  // Update subscription status to canceled
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) {
    console.error('Error canceling subscription:', error)
  }

  // Create new free subscription for the user
  const { data: canceledSub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (canceledSub) {
    await supabase
      .from('user_subscriptions')
      .insert({
        user_id: canceledSub.user_id,
        plan_id: 'free',
        status: 'active'
      })
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  // Access subscription property from invoice
  const subscriptionId = (invoice as any).subscription

  if (subscriptionId) {
    // Update subscription status to active
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription after payment:', error)
    }
  }
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  // Access subscription property from invoice
  const subscriptionId = (invoice as any).subscription

  if (subscriptionId) {
    // Update subscription status to past_due
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription after failed payment:', error)
    }
  }
} 