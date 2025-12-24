import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

/**
 * ULTRATHINK ERROR BOUNDARY
 * Neurodivergent-friendly error handling with clear recovery options
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      attempting: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 SpatialOS Error Caught:', error, errorInfo);
    this.setState({ errorInfo });

    // Track error count for safe mode detection
    try {
      const errorCount = parseInt(localStorage.getItem('boot_error_count') || '0');
      localStorage.setItem('boot_error_count', String(errorCount + 1));
    } catch (e) {
      console.warn('Could not track error count:', e);
    }
  }

  handleReload = () => {
    this.setState({ attempting: true });
    setTimeout(() => window.location.reload(), 500);
  };

  handleFactoryReset = () => {
    if (confirm('⚠️ This will clear all saved data. Continue?')) {
      this.setState({ attempting: true });
      try {
        localStorage.clear();
        setTimeout(() => window.location.reload(), 500);
      } catch (e) {
        // If localStorage is completely broken, just reload
        setTimeout(() => window.location.reload(), 500);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      const isSmallError = this.props.fallback;

      // If a custom fallback provided, use it for component-level errors
      if (isSmallError) {
        return this.props.fallback;
      }

      // Full-screen error for critical failures
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            padding: 40,
            zIndex: 999999,
          }}
        >
          {/* Breathing pulse background */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'breathe 3s ease-in-out infinite',
            }}
          />

          <div
            style={{
              position: 'relative',
              maxWidth: 600,
              background: '#ffffff',
              borderRadius: 24,
              padding: 48,
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '2px solid #fca5a5',
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div
              style={{
                display: 'inline-flex',
                padding: 20,
                background: '#fee2e2',
                borderRadius: '50%',
                marginBottom: 24,
              }}
            >
              <AlertTriangle size={48} color="#dc2626" strokeWidth={2} />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#dc2626',
                marginBottom: 16,
                letterSpacing: '-0.025em',
              }}
            >
              Terra OS Hit a Snag
            </h1>

            {/* Message */}
            <p
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: 1.7,
                marginBottom: 12,
              }}
            >
              Something unexpected happened and the system stopped working.
              <br />
              This is usually temporary and fixes itself with a quick refresh.
            </p>

            {/* Error Details (Collapsible) */}
            {this.state.error && (
              <details
                style={{
                  marginTop: 20,
                  marginBottom: 24,
                  textAlign: 'left',
                  background: '#fef2f2',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #fca5a5',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: '#991b1b',
                    fontSize: 13,
                    userSelect: 'none',
                  }}
                >
                  🔍 Technical Details
                </summary>
                <pre
                  style={{
                    marginTop: 12,
                    fontSize: 11,
                    color: '#7f1d1d',
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack &&
                    '\n\nComponent Stack:' + this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Recovery Actions */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                marginTop: 32,
              }}
            >
              {/* Reload Button */}
              <button
                onClick={this.handleReload}
                disabled={this.state.attempting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  background: this.state.attempting ? '#9ca3af' : '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: this.state.attempting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  opacity: this.state.attempting ? 0.6 : 1,
                }}
                onMouseOver={e => {
                  if (!this.state.attempting) {
                    e.target.style.background = '#b91c1c';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={e => {
                  if (!this.state.attempting) {
                    e.target.style.background = '#dc2626';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <RotateCcw size={16} />
                {this.state.attempting ? 'Reloading...' : 'Reload System'}
              </button>

              {/* Factory Reset Button */}
              <button
                onClick={this.handleFactoryReset}
                disabled={this.state.attempting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  background: '#ffffff',
                  color: '#6b7280',
                  border: '2px solid #d1d5db',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: this.state.attempting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: this.state.attempting ? 0.6 : 1,
                }}
                onMouseOver={e => {
                  if (!this.state.attempting) {
                    e.target.style.borderColor = '#dc2626';
                    e.target.style.color = '#dc2626';
                  }
                }}
                onMouseOut={e => {
                  if (!this.state.attempting) {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.color = '#6b7280';
                  }
                }}
              >
                <Trash2 size={16} />
                Factory Reset
              </button>
            </div>

            {/* Helper Text */}
            <p
              style={{
                marginTop: 24,
                fontSize: 13,
                color: '#9ca3af',
                fontStyle: 'italic',
              }}
            >
              💡 Try reloading first. Factory reset clears all saved data.
            </p>
          </div>

          {/* CSS Animations */}
          <style>{`
            @keyframes breathe {
              0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.3;
              }
              50% {
                transform: translate(-50%, -50%) scale(1.1);
                opacity: 0.5;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lighter error fallback for component-level errors
 */
export const ComponentErrorFallback = ({ componentName = 'Component' }) => (
  <div
    style={{
      padding: 24,
      background: '#fef2f2',
      border: '2px dashed #fca5a5',
      borderRadius: 12,
      textAlign: 'center',
      color: '#991b1b',
    }}
  >
    <AlertTriangle size={32} color="#dc2626" style={{ marginBottom: 8 }} />
    <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ {componentName} Failed to Load</div>
    <div style={{ fontSize: 13, color: '#7f1d1d' }}>
      This component encountered an error. The rest of the system is still working.
    </div>
  </div>
);
