import { SignedIn, SignedOut } from '@clerk/chrome-extension'
import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="card">
      <h2>Home</h2>
      <p className="muted">
        This is an open-source Chrome MV3 starter. Authenticate with Clerk, persist profile data
        through the included API (Supabase service role stays on the server), and take payments
        with Stripe Checkout.
      </p>
      <div style={{ height: 10 }} />
      <SignedOut>
        <p className="muted">Sign in to load your profile and enable admin tools.</p>
      </SignedOut>
      <SignedIn>
        <div className="row">
          <span className="pill">
            <span className="dot" />
            Signed in
          </span>
          <Link to="/account">Open account</Link>
        </div>
      </SignedIn>
    </div>
  )
}
