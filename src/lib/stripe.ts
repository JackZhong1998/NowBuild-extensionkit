import { optionalEnv } from './config'
import { createCheckoutSession } from './api'

/**
 * Opens Stripe Checkout in a new tab.
 * Prefer server-created Checkout Sessions (this helper) over putting secret keys in the extension.
 */
export async function startCheckout(params: {
  token: string | null
  priceId: string
}): Promise<void> {
  const paymentLink = optionalEnv('VITE_STRIPE_PAYMENT_LINK_URL')
  if (paymentLink) {
    await chrome.tabs.create({ url: paymentLink })
    return
  }

  const landing = optionalEnv('VITE_PUBLIC_APP_URL')
  if (!landing) {
    throw new Error(
      'Set VITE_PUBLIC_APP_URL (HTTPS landing page for Stripe redirects) or VITE_STRIPE_PAYMENT_LINK_URL.',
    )
  }
  const { url: checkoutUrl } = await createCheckoutSession(params.token, {
    priceId: params.priceId,
    successUrl: `${landing}?stripe=success`,
    cancelUrl: `${landing}?stripe=cancel`,
  })
  await chrome.tabs.create({ url: checkoutUrl })
}

export async function openBillingPortal(customerPortalUrl: string): Promise<void> {
  await chrome.tabs.create({ url: customerPortalUrl })
}
