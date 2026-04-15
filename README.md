# NowBuild Extension Kit

**GitHub:** [github.com/JackZhong1998/NowBuild-extensionkit](https://github.com/JackZhong1998/NowBuild-extensionkit)

An **MIT-licensed** starter for **Chrome Manifest V3** extensions that combines:

- **Clerk** authentication (`@clerk/chrome-extension`)
- **Supabase** persistence via a tiny **Node API** (service role key stays server-side)
- **Stripe** Checkout creation on the server (or a static Payment Link from the extension)
- A small **popup UI** with **Home**, **Account**, and an **admin Users** page pattern

中文文档见：[`docs/README.zh-CN.md`](docs/README.zh-CN.md)

## Why a server (BFF)?

Browser extensions cannot safely embed **Supabase service role** keys or **Stripe secret** keys.

This repo keeps those secrets in `server/` and exposes narrow endpoints:

- `GET /api/me` — verifies Clerk session, upserts `profiles` row in Supabase
- `GET /api/admin/users` — Clerk user list for allowlisted admin ids
- `POST /api/stripe/checkout` — creates a Stripe Checkout Session

You can replace `server/` with Cloudflare Workers, FastAPI, or anything else—keep the same API contract if you want to reuse the extension code.

## Repository layout

```
├── src/                 # Extension source (Vite + React + CRXJS)
├── server/              # Node + Hono API (local dev + easy deploy)
├── supabase/migrations/ # SQL for `profiles`
├── sync-host/           # Static site notes/template for Clerk sync host
├── docs/                # Extra documentation (Chinese README)
└── dist/                # Built extension (after `npm run build`)
```

## Quick start

### 1) Install

```bash
npm install
cd server && npm install && cd ..
```

### 2) Configure Supabase

Create a project, run the SQL in `supabase/migrations/0001_profiles.sql`, then copy:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

### 3) Configure Clerk + sync host

Clerk’s Chrome extension SDK requires an HTTPS **sync host**. Deploy `sync-host/public/` (or Clerk’s recommended template) and set:

- `VITE_CLERK_SYNC_HOST` (extension)
- `VITE_CLERK_PUBLISHABLE_KEY` (extension)
- `CLERK_SECRET_KEY` (server)

Also add the sync host domain to your Clerk app’s allowed origins / redirect settings (follow Clerk’s current Chrome extension guide).

### 4) Configure Stripe (optional)

Server:

- `STRIPE_SECRET_KEY`

Extension (optional helpers):

- `VITE_STRIPE_PRICE_ID` enables the demo **Pay** button (server creates Checkout Session)
- or `VITE_STRIPE_PAYMENT_LINK_URL` to open a static Payment Link instead

You should also set `VITE_PUBLIC_APP_URL` to a real **HTTPS** page used as Stripe `success_url` / `cancel_url`.

### 5) Run locally

Terminal A (API):

```bash
cd server
cp .env.example .env
# fill env vars
npm run dev
```

Terminal B (extension):

```bash
cp .env.example .env
# fill env vars
npm run dev
```

Load the unpacked extension from `dist/`:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `dist/`

> Note: after code changes, rebuild (`npm run build`) or keep `npm run dev` running depending on your workflow.

### 6) Admin user management page

Set comma-separated Clerk user ids:

- `ADMIN_USER_IDS=user_...,user_...`

Only those users can load `GET /api/admin/users` from the **Users** tab.

## Security notes (read before shipping)

- Never commit `.env` files.
- Never ship **Supabase service role** or **Stripe secret** keys inside the extension.
- Treat `ADMIN_USER_IDS` as a **stopgap**; for real products, model roles in your database or use Clerk organizations + server-side authorization.

## Scripts

- `npm run dev` — dev build for the extension
- `npm run build` — production build to `dist/`
- `cd server && npm run dev` — local API on `8787` by default

## License

MIT — see [`LICENSE`](LICENSE).
