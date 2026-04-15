import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/chrome-extension'
import { HashRouter } from 'react-router-dom'
import { PopupApp } from './PopupApp'
import { requireEnv } from '../lib/config'
import './popup.css'

const publishableKey = requireEnv('VITE_CLERK_PUBLISHABLE_KEY')
const syncHost = requireEnv('VITE_CLERK_SYNC_HOST')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={publishableKey} syncHost={syncHost}>
      <HashRouter>
        <PopupApp />
      </HashRouter>
    </ClerkProvider>
  </React.StrictMode>,
)
