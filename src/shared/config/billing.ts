export const billingConfig = {
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  subscriptionPriceId: process.env.SUBSCRIPTION_PRICE_ID ?? "",
  publicSubscriptionPriceId:
    process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID ?? "",
} as const;