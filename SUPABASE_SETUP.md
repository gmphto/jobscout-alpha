# JobScout Setup Guide

This guide walks you through setting up JobScout with Supabase authentication, database, OpenAI integration, and Stripe billing.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- An OpenAI API key
- A Stripe account (for subscriptions)
- Google OAuth credentials (for authentication)

## 1. Clone and Install

```bash
git clone <your-repo>
cd JobScoutv1
npm install
```

## 2. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization and create project
4. Wait for project to be ready

### Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Providers**
2. Enable **Google** provider
3. Configure Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials > Create Credentials > OAuth 2.0 Client ID**
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3001/auth/callback` (for development)
   - Copy Client ID and Client Secret to Supabase Google provider settings

### Setup Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query and paste the contents of `supabase-schema.sql`
3. Run the query to create all tables, policies, and functions
4. Create another query and paste the contents of `subscription-schema.sql`
5. Run the subscription schema to set up billing and usage tracking

## 3. Stripe Setup

### Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification if required

### Get API Keys

1. In Stripe Dashboard, go to **Developers > API Keys**
2. Copy your **Publishable key** and **Secret key**

### Create Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Create products for each subscription tier:

**Pro Plan:**
- Create product named "JobScout Pro"
- Add monthly price: $9.97
- Add yearly price: $99.70 (save 2 months)
- Copy the price IDs

**Premium Plan:**
- Create product named "JobScout Premium"  
- Add monthly price: $29.97
- Add yearly price: $299.70 (save 2 months)
- Copy the price IDs

### Setup Webhooks

1. Go to **Developers > Webhooks**
2. Add endpoint: `https://yourdomain.com/api/subscriptions/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret

## 4. OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add billing information (required for API access)

## 5. Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe Price IDs (from step 3)
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Finding Your Supabase Keys

1. Go to **Project Settings > API**
2. Copy the Project URL and anon/public key
3. Copy the service_role key (keep this secret!)

## 6. Development

```bash
npm run dev
```

Visit `http://localhost:3001`

## 7. Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Update Stripe webhook endpoint URL to production domain
6. Update Google OAuth redirect URIs to include production domain

### Environment Variables for Production

Update these variables for production:

```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
# Use live Stripe keys instead of test keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-publishable-key
STRIPE_SECRET_KEY=sk_live_your-live-secret-key
```

## Usage Limits & Billing

### Free Tier
- 5 AI-generated resume contents per month
- Basic features
- Email support

### Pro Plan ($9.97/month)
- Unlimited AI-generated content
- Advanced features
- Priority support
- $99.70/year (save 2 months)

### Premium Plan ($29.97/month)
- Everything in Pro
- Team collaboration
- Analytics dashboard
- White-label options
- $299.70/year (save 2 months)

## Cost Considerations

### OpenAI Costs
- GPT-4o-mini: ~$0.15 per 1K input tokens, ~$0.60 per 1K output tokens
- Each resume generation uses approximately 1K-2K tokens
- Estimated cost: $0.001-0.002 per generation

### Stripe Fees
- 2.9% + 30¢ per transaction
- No monthly fees for standard processing

## Troubleshooting

### Authentication Issues
- Verify Google OAuth redirect URIs match exactly
- Check Supabase provider settings
- Ensure environment variables are correct

### Database Issues
- Run both schema files in correct order
- Check RLS policies are enabled
- Verify triggers and functions are created

### Stripe Issues
- Verify webhook endpoint is accessible
- Check webhook secret matches
- Ensure price IDs are correct
- Test with Stripe test mode first

### API Issues
- Verify OpenAI API key has billing enabled
- Check Supabase service role key permissions
- Monitor API usage and costs

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Test each integration separately
4. Check Supabase logs and Stripe webhook logs
5. Review OpenAI usage dashboard

For additional help, check the documentation:
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs) 