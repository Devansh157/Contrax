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
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('contractgo_user');
    localStorage.removeItem('contractgo_token');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginBottom: '1rem' }}>
            Something went wrong
          </h2>
          <p style={{ maxWidth: '600px', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            An unexpected error occurred while rendering the interface:
          </p>
          <pre style={{
            backgroundColor: '#1e293b',
            padding: '1rem',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.85rem',
            maxWidth: '800px',
            overflowX: 'auto',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            {this.state.error?.toString()}
          </pre>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Session & Relogin
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
