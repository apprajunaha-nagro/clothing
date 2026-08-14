import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error Boundary catch:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200 max-w-md w-full space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-stone-900">Application Error</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred while rendering the page."}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full bg-[#C0654B] text-white font-bold py-3 rounded-xl text-xs hover:bg-[#8B4A38] transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
