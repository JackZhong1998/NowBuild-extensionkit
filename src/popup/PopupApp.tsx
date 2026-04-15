import { NavLink, Route, Routes } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/chrome-extension'
import { Home } from './pages/Home'
import { Account } from './pages/Account'
import { Users } from './pages/Users'

export function PopupApp() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>BEF</strong>
          <span className="muted">Clerk · Supabase · Stripe</span>
        </div>
        <div className="row">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Home
        </NavLink>
        <NavLink to="/account" className={({ isActive }) => (isActive ? 'active' : '')}>
          Account
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
          Users
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </div>
  )
}
