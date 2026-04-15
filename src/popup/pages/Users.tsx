import { SignedIn, SignedOut, useAuth } from '@clerk/chrome-extension'
import { useEffect, useState } from 'react'
import { fetchAdminUsers } from '../../lib/api'

export function Users() {
  return (
    <>
      <SignedOut>
        <div className="card">
          <h2>Users</h2>
          <p className="muted">Sign in to access the admin user list (if your user id is allowlisted).</p>
        </div>
      </SignedOut>
      <SignedIn>
        <UsersInner />
      </SignedIn>
    </>
  )
}

function UsersInner() {
  const { getToken } = useAuth()
  const [rows, setRows] = useState<
    { id: string; email: string | null; firstName: string | null; lastName: string | null; createdAt: number }[]
  >([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBusy(true)
      try {
        const token = await getToken()
        const data = await fetchAdminUsers(token)
        if (cancelled) return
        setRows(data)
        setError(null)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getToken])

  return (
    <div className="card">
      <h2>User management</h2>
      <p className="muted">
        This page calls <span className="mono">GET /api/admin/users</span>. The server verifies your Clerk session
        and only returns data if your Clerk user id is listed in <span className="mono">ADMIN_USER_IDS</span>.
      </p>
      <div style={{ height: 10 }} />
      {error ? <div className="err">{error}</div> : null}
      {busy ? <p className="muted">Loading…</p> : null}
      {!busy && !error ? (
        <table className="table">
          <thead>
            <tr>
              <th>User id</th>
              <th>Email</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="mono">{u.id}</td>
                <td>{u.email ?? '—'}</td>
                <td>
                  {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}
