import React from 'react';
import { isChunkLoadError, reloadOnceForStaleChunks } from '../utils/chunkReload';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, recovering: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // A lazy chunk from a previous deploy no longer exists — one fresh
    // load picks up the current files. Show a brief updating state
    // while that happens instead of the error card.
    if (isChunkLoadError(error) && reloadOnceForStaleChunks()) {
      this.setState({ recovering: true });
      return;
    }
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.recovering) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#475569', padding: '24px', textAlign: 'center' }}>
          <p>Updating to the latest version of the site…</p>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '24px' }}>
          <div style={{ maxWidth: '520px', width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '36px 32px', textAlign: 'center', boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Something went wrong</h1>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, margin: '0 0 24px' }}>
              This page hit a snag while loading. It usually clears with a fresh reload — especially right after the site has been updated.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => window.location.reload()} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '999px', padding: '11px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Reload the page</button>
              <a href="/" style={{ color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '999px', padding: '11px 24px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Back to homepage</a>
            </div>
            <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
              <summary style={{ cursor: 'pointer' }}>Technical details</summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
