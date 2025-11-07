import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // ✅ Global styles (Tailwind or custom CSS)

// ✅ Initialize Stripe safely (client-side only)
if (typeof window !== "undefined" && !window.Stripe) {
  const script = document.createElement("script");
  script.src = "https://js.stripe.com/v3/";
  script.async = true;
  script.onload = () => {
    if (import.meta.env.VITE_STRIPE_KEY) {
      window.Stripe = Stripe(import.meta.env.VITE_STRIPE_KEY);
      console.log("✅ Stripe initialized successfully.");
    } else {
      console.warn("⚠️ Missing VITE_STRIPE_KEY in environment variables.");
    }
  };
  document.head.appendChild(script);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
