// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function initializeStripe() {
  if (typeof window === "undefined") return;

  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!stripeKey) {
    console.warn("⚠️ Stripe key missing (VITE_STRIPE_PUBLISHABLE_KEY). Skipping init.");
    return;
  }

  if (window.Stripe) {
    console.log("✅ Stripe already initialized");
    return;
  }

  const script = document.createElement("script");
  script.src = "https://js.stripe.com/v3/";
  script.async = true;
  script.onload = () => {
    if (window.Stripe) {
      window.stripeInstance = window.Stripe(stripeKey);
      console.log("✅ Stripe initialized successfully");
    } else {
      console.error("❌ Stripe loaded but unavailable");
    }
  };
  script.onerror = () => console.error("❌ Failed to load Stripe script");
  document.head.appendChild(script);
}

function ErrorFallback({ error }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        color: "#333",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#dc2626" }}>Application Error</h1>
      <p>Something went wrong while loading Heavenly Nature Ministry.</p>
      <pre
        style={{
          background: "#f3f4f6",
          padding: "10px",
          borderRadius: "6px",
          fontSize: "13px",
          overflow: "auto",
          maxWidth: "600px",
        }}
      >
        {error?.toString()}
      </pre>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "16px",
          backgroundColor: "#16a34a",
          color: "white",
          border: "none",
          padding: "10px 24px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Reload Application
      </button>
    </div>
  );
}

function initializeApp() {
  try {
    const rootEl = document.getElementById("root");
    if (!rootEl) throw new Error("Root element not found");

    initializeStripe();

    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log("✅ Heavenly Nature Ministry app initialized successfully");
  } catch (error) {
    console.error("❌ App initialization failed:", error);
    const rootEl = document.getElementById("root");
    if (rootEl) {
      const fallbackRoot = ReactDOM.createRoot(rootEl);
      fallbackRoot.render(<ErrorFallback error={error} />);
    }
  }
}

// ✅ Capture any unhandled async or render errors
window.addEventListener("error", (event) => {
  console.error("🌋 Global error caught:", event.error);
});
window.addEventListener("unhandledrejection", (event) => {
  console.error("🌋 Unhandled Promise rejection:", event.reason);
});

// Run after DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
