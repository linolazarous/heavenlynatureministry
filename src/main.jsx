// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/* -----------------------------
   Stripe Loader
-------------------------------- */
function loadStripe() {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) return console.warn("Stripe key missing.");

  const script = document.createElement("script");
  script.src = "https://js.stripe.com/v3/";
  script.async = true;
  script.onload = () => {
    window.stripeInstance = window.Stripe?.(key);
  };
  document.head.appendChild(script);
}

/* -----------------------------
   Global Error Fallback
-------------------------------- */
const GlobalError = ({ error }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-100 p-6">
    <h1 className="text-2xl font-bold text-red-600">Application Error</h1>
    <p className="text-gray-700 mt-3">{String(error)}</p>
    <button
      onClick={() => location.reload()}
      className="mt-5 bg-green-600 text-white px-5 py-2 rounded-lg"
    >
      Reload
    </button>
  </div>
);

/* -----------------------------
   Initialize Application
-------------------------------- */
function init() {
  try {
    loadStripe();

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    const fallbackRoot = ReactDOM.createRoot(document.getElementById("root"));
    fallbackRoot.render(<GlobalError error={err} />);
  }
}

init();
