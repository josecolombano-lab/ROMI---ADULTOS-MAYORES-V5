import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Ha ocurrido un error inesperado.";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.error.includes("Missing or insufficient permissions")) {
            errorMessage = "No tienes permiso para acceder a esta información.";
          } else if (parsed.error) {
            errorMessage = parsed.error;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#001F3F] text-[#FFFDD0] flex flex-col items-center justify-center p-6">
          <div className="bg-red-500/20 border-2 border-red-500 p-8 rounded-3xl max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">¡Ups! Algo salió mal</h1>
            <p className="text-lg mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FFD580] text-[#001F3F] font-bold py-3 px-6 rounded-xl w-full"
            >
              Volver a cargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
