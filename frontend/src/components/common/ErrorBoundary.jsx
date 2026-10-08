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
    console.error('Portal Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gov-sand-50 flex items-center justify-center p-6 font-serif">
          <div className="max-w-lg w-full bg-white border-2 border-gov-maroon shadow-gov-md p-8 text-center rounded-sm">
            <div className="w-12 h-12 bg-red-100 text-gov-maroon rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gov-navy mb-2">Display Notice</h2>
            <p className="text-sm text-gov-text-secondary mb-4 leading-relaxed">
              An unexpected render notice was encountered on this portal view. Your session and data remain completely secure.
            </p>
            {this.state.error && (
              <div className="bg-gov-sand-100 p-3 rounded text-left text-xs font-mono text-red-800 mb-6 overflow-x-auto border border-gov-border">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gov-maroon text-white text-xs font-semibold rounded-sm hover:bg-gov-maroon-dark transition-colors shadow-sm"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/admin';
                }}
                className="px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded-sm hover:bg-gov-navy-dark transition-colors shadow-sm"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
