import { optionalEnv } from './config'

const base = () => optionalEnv('VITE_API_BASE_URL') ?? 'http://localhost:8787'

export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  stripe_customer_id: string | null
  updated_at: string | null
}

export async function fetchProfile(token: string | null): Promise<Profile | null> {
  if (!token) return null
  const res = await fetch(`${base()}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) return null
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Profile request failed (${res.status}): ${text}`)
  }
  return (await res.json()) as Profile
}

export async function fetchAdminUsers(
  token: string | null,
): Promise<{ id: string; email: string | null; firstName: string | null; lastName: string | null; createdAt: number }[]> {
  if (!token) throw new Error('Not signed in')
  const res = await fetch(`${base()}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 403) {
    throw new Error('Admin access required (set ADMIN_USER_IDS on the server).')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Admin users request failed (${res.status}): ${text}`)
  }
  return (await res.json()) as {
    id: string
    email: string | null
    firstName: string | null
    lastName: string | null
    createdAt: number
  }[]
}

export async function createCheckoutSession(
  token: string | null,
  body: { priceId: string; successUrl: string; cancelUrl: string },
): Promise<{ url: string }> {
  if (!token) throw new Error('Not signed in')
  const res = await fetch(`${base()}/api/stripe/checkout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Stripe checkout failed (${res.status}): ${text}`)
  }
  return (await res.json()) as { url: string }
}
