import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // ✅ Use unified global stylesheet

// ✅ Initialize Stripe safely and asynchronously
if (!window.Stripe) {
  const script = document.createElement('script')
  script.src = 'https://js.stripe.com/v3/'
  script.async = true
  script.onload = () => {
    if (import.meta.env.VITE_STRIPE_KEY) {
      window.Stripe = Stripe(import.meta.env.VITE_STRIPE_KEY)
    }
  }
  document.head.appendChild(script)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
