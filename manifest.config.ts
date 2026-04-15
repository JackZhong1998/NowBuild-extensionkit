import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'NowBuild Extension Kit',
  description:
    'NowBuild starter: Clerk + Supabase (BFF) + Stripe. Replace keys and ship your product.',
  version: '0.1.0',
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'NowBuild Extension Kit',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  permissions: ['storage', 'alarms'],
  host_permissions: [
    'http://localhost:8787/*',
    'https://*.supabase.co/*',
    'https://*.clerk.accounts.dev/*',
    'https://*.clerk.com/*',
    'https://api.stripe.com/*',
    'https://checkout.stripe.com/*',
    'https://billing.stripe.com/*',
  ],
  content_security_policy: {
    extension_pages:
      "script-src 'self'; object-src 'self'; connect-src 'self' http://localhost:8787 https://*.supabase.co https://*.clerk.accounts.dev https://*.clerk.com https://api.stripe.com https://checkout.stripe.com https://billing.stripe.com wss://*.supabase.co",
  },
})
