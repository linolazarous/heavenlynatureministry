// src/components/DebugApp.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function DebugApp() {
  return (
    <ErrorBoundary>
      <div>
        <h1>Heavenly Nature Ministry</h1>
        <h2>Juba, South Sudan</h2>
        <p>Website is working correctly!</p>
      </div>
    </ErrorBoundary>
  );
}

export default DebugApp;
