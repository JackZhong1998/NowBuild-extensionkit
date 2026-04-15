# Clerk sync host (required for `@clerk/chrome-extension`)

Clerk’s Chrome extension SDK uses a **sync host** origin to synchronize authentication state between the extension and the web.

## What you deploy here

Deploy the smallest possible HTTPS site on the same origin you set as `VITE_CLERK_SYNC_HOST`.

This repo includes a minimal static template at `sync-host/public/index.html`. Host it on Vercel/Netlify/Cloudflare Pages.

## Clerk Dashboard checklist

- Add your sync host domain to **Allowed origins** for your Clerk application.
- Follow Clerk’s Chrome extension guide for any additional **Authorized redirect URLs**.
