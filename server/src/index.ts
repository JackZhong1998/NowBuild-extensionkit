import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClerkClient, verifyToken } from '@clerk/backend'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function requiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function parseAdminAllowlist(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS ?? ''
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  )
}

const clerkSecretKey = requiredEnv('CLERK_SECRET_KEY')
const supabaseUrl = requiredEnv('SUPABASE_URL')
const supabaseServiceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
const stripeSecretKey = requiredEnv('STRIPE_SECRET_KEY')

const clerk = createClerkClient({ secretKey: clerkSecretKey })
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' })

const adminAllowlist = parseAdminAllowlist()

const app = new Hono()

app.use(
  '*',
  cors({
    origin: (origin) => origin,
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

app.get('/health', (c) => c.json({ ok: true }))

async function getAuthedUserId(authHeader: string | undefined): Promise<string> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('unauthorized')
  }
  const token = authHeader.slice('Bearer '.length)
  const verified = await verifyToken(token, { secretKey: clerkSecretKey })
  if (!verified?.sub) throw new Error('unauthorized')
  return verified.sub
}

app.get('/api/me', async (c) => {
  try {
    const userId = await getAuthedUserId(c.req.header('authorization'))
    const user = await clerk.users.getUser(userId)
    const email = user.primaryEmailAddress?.emailAddress ?? null

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          display_name: user.fullName ?? user.username ?? null,
          avatar_url: user.imageUrl ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select('*')
      .single()

    if (error) throw error
    return c.json(data)
  } catch {
    return c.json({ error: 'unauthorized' }, 401)
  }
})

app.get('/api/admin/users', async (c) => {
  try {
    const userId = await getAuthedUserId(c.req.header('authorization'))
    if (!adminAllowlist.has(userId)) {
      return c.json({ error: 'forbidden' }, 403)
    }

    const users: {
      id: string
      email: string | null
      firstName: string | null
      lastName: string | null
      createdAt: number
    }[] = []

    const page = await clerk.users.getUserList({ limit: 100 })
    for (const u of page.data) {
      users.push({
        id: u.id,
        email: u.primaryEmailAddress?.emailAddress ?? null,
        firstName: u.firstName ?? null,
        lastName: u.lastName ?? null,
        createdAt: u.createdAt,
      })
    }

    return c.json(users)
  } catch {
    return c.json({ error: 'unauthorized' }, 401)
  }
})

app.post('/api/stripe/checkout', async (c) => {
  try {
    const userId = await getAuthedUserId(c.req.header('authorization'))
    const body = (await c.req.json()) as { priceId?: string; successUrl?: string; cancelUrl?: string }
    if (!body.priceId || !body.successUrl || !body.cancelUrl) {
      return c.json({ error: 'invalid_body' }, 400)
    }

    const user = await clerk.users.getUser(userId)
    const email = user.primaryEmailAddress?.emailAddress ?? undefined

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: body.priceId, quantity: 1 }],
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      metadata: { clerk_user_id: userId },
    })

    if (!session.url) return c.json({ error: 'no_session_url' }, 500)
    return c.json({ url: session.url })
  } catch {
    return c.json({ error: 'unauthorized' }, 401)
  }
})

const port = Number(process.env.PORT ?? '8787')
console.info(`[bef-server] listening on http://localhost:${port}`)
serve({ fetch: app.fetch, port })
