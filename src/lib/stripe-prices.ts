
// Replace with your actual Stripe Price IDs
export const STRIPE_PRICES = {
    subscription: process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID || '',
    lifetime: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID || '',
}
