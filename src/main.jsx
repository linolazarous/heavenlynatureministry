import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Error boundary for the entire app initialization
class AppInitializationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AppInitializationError";
  }
}

// Safe Stripe initialization with better error handling
const initializeStripe = () => {
  if (typeof window === "undefined") {
    return; // Skip during SSR
  }

  try {
    // Check if Stripe is already loaded
    if (window.Stripe) {
      console.log("✅ Stripe already initialized");
      return;
    }

    // Check for Stripe key
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey) {
      console.warn("⚠️ Stripe key not found in environment variables");
      return;
    }

    // Load Stripe script
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      try {
        if (window.Stripe) {
          window.stripeInstance = window.Stripe(stripeKey);
          console.log("✅ Stripe initialized successfully");
        } else {
          console.error("❌ Stripe library not available after script load");
        }
      } catch (error) {
        console.error("❌ Error initializing Stripe:", error);
      }
    };

    script.onerror = () => {
      console.error("❌ Failed to load Stripe script");
    };

    document.head.appendChild(script);
  } catch (error) {
    console.error("❌ Error in Stripe initialization:", error);
  }
};

// Fallback UI for initialization errors
const ErrorFallback = ({ error }) => (
  <div 
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "system-ui, sans-serif",
      textAlign: "center",
      backgroundColor: "#f8f9fa",
      color: "#333"
    }}
  >
    <h1 style={{ fontSize: "24px", marginBottom: "16px", color: "#dc2626" }}>
      Application Error
    </h1>
    <p style={{ marginBottom: "16px", fontSize: "16px" }}>
      Sorry, something went wrong while loading the application.
    </p>
    <details style={{ marginBottom: "16px", maxWidth: "600px" }}>
      <summary style={{ cursor: "pointer", marginBottom: "8px" }}>
        Technical Details
      </summary>
      <pre style={{ 
        textAlign: "left", 
        backgroundColor: "#f3f4f6", 
        padding: "12px", 
        borderRadius: "6px",
        fontSize: "14px",
        overflow: "auto"
      }}>
        {error.toString()}
      </pre>
    </details>
    <button
      onClick={() => window.location.reload()}
      style={{
        backgroundColor: "#16a34a",
        color: "white",
        border: "none",
        padding: "12px 24px",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
        transition: "background-color 0.2s"
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = "#15803d"}
      onMouseOut={(e) => e.target.style.backgroundColor = "#16a34a"}
    >
      Reload Application
    </button>
  </div>
);

// Main initialization function
const initializeApp = () => {
  try {
    // Check if root element exists
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new AppInitializationError("Root element 'root' not found in DOM");
    }

    // Initialize Stripe (non-blocking)
    initializeStripe();

    // Render the app
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log("✅ Heavenly Nature Ministry app initialized successfully");

    // Handle potential hydration errors
    return () => {
      try {
        root.unmount();
      } catch (error) {
        console.error("Error during app unmount:", error);
      }
    };

  } catch (error) {
    console.error("❌ App initialization failed:", error);
    
    // Render error fallback
    const rootElement = document.getElementById("root");
    if (rootElement) {
      const errorRoot = ReactDOM.createRoot(rootElement);
      errorRoot.render(<ErrorFallback error={error} />);
    }
    
    throw error;
  }
};

// Performance monitoring
if (typeof window !== "undefined" && "performance" in window) {
  const appStartTime = performance.now();
  
  // Monitor long tasks
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 50) { // 50ms threshold
        console.warn("Long task detected:", entry);
      }
    });
  });
  
  observer.observe({ entryTypes: ["longtask"] });
  
  // Log initial load performance
  window.addEventListener("load", () => {
    const loadTime = performance.now() - appStartTime;
    console.log(`🚀 App loaded in ${loadTime.toFixed(2)}ms`);
  });
}

// Initialize the app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

// Export for testing purposes
export { initializeApp, ErrorFallback };
