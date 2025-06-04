import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out JobScout',
    price_monthly: 0,
    prompt_limit: 5,
    features: [
      '5 AI-generated resume contents',
      'Basic resume tailoring',
      'Email support'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For serious job seekers',
    price_monthly: 997, // $9.97 in cents
    price_yearly: 9970, // $99.70 in cents (save 2 months)
    prompt_limit: null, // unlimited
    stripe_price_id_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripe_price_id_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    features: [
      'Unlimited AI-generated content',
      'Advanced resume tailoring',
      'Priority support',
      'Export to multiple formats',
      'Resume templates'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'For recruiters and career coaches',
    price_monthly: 2997, // $29.97 in cents
    price_yearly: 29970, // $299.70 in cents (save 2 months)
    prompt_limit: null, // unlimited
    stripe_price_id_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    stripe_price_id_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Analytics dashboard',
      'White-label options',
      'Custom integrations'
    ]
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// Helper function to format price
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100)
}

// Helper function to create checkout session
export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  customerId?: string
  successUrl: string
  cancelUrl: string
}) {
  return await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })
}

// Helper function to create customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
} 