import { useAuth, useUser, SignedIn, SignedOut } from '@clerk/chrome-extension'
import { useEffect, useMemo, useState } from 'react'
import { fetchProfile, type Profile } from '../../lib/api'
import { optionalEnv } from '../../lib/config'
import { startCheckout } from '../../lib/stripe'

export function Account() {
  return (
    <>
      <SignedOut>
        <div className="card">
          <h2>Account</h2>
          <p className="muted">Please sign in from the header.</p>
        </div>
      </SignedOut>
      <SignedIn>
        <AccountInner />
      </SignedIn>
    </>
  )
}

function AccountInner() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const priceId = useMemo(() => optionalEnv('VITE_STRIPE_PRICE_ID') ?? '', [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const t = await getToken()
        if (cancelled) return
        setToken(t)
        setProfile(await fetchProfile(t))
        setError(null)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getToken, user?.id])

  return (
    <div className="card">
      <h2>Account</h2>
      {error ? <div className="err">{error}</div> : null}
      <p className="muted">
        Clerk provides identity in the extension. The API upserts a <span className="mono">profiles</span>{' '}
        row in Supabase keyed by your Clerk user id.
      </p>
      <div style={{ height: 10 }} />
      <div className="muted">
        <div>
          <strong>Clerk</strong>
        </div>
        <div className="mono">{user?.id ?? '—'}</div>
        <div>{user?.primaryEmailAddress?.emailAddress ?? '—'}</div>
      </div>
      <div style={{ height: 12 }} />
      <div className="muted">
        <div>
          <strong>Supabase profile</strong>
        </div>
        <pre className="mono" style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>
          {profile ? JSON.stringify(profile, null, 2) : token ? 'Loading…' : '—'}
        </pre>
      </div>
      <div style={{ height: 12 }} />
      <div className="row">
        <button
          type="button"
          disabled={busy || !token}
          onClick={async () => {
            setBusy(true)
            try {
              const t = await getToken()
              setToken(t)
              setProfile(await fetchProfile(t))
              setError(null)
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e))
            } finally {
              setBusy(false)
            }
          }}
        >
          Refresh profile
        </button>
        <button
          type="button"
          className="secondary"
          disabled={busy || !token || !priceId}
          title={!priceId ? 'Set VITE_STRIPE_PRICE_ID in .env' : undefined}
          onClick={async () => {
            setBusy(true)
            try {
              const t = await getToken()
              await startCheckout({ token: t, priceId })
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e))
            } finally {
              setBusy(false)
            }
          }}
        >
          Pay (Stripe)
        </button>
      </div>
      {!priceId ? (
        <p className="muted" style={{ marginTop: 10 }}>
          To enable the Pay button, set <span className="mono">VITE_STRIPE_PRICE_ID</span> or use{' '}
          <span className="mono">VITE_STRIPE_PAYMENT_LINK_URL</span> for a static Payment Link.
        </p>
      ) : null}
    </div>
  )
}
