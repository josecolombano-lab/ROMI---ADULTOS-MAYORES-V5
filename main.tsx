import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './ErrorBoundary';

console.log("ROMI: Iniciando aplicación...");
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("No se pudo encontrar el elemento 'root' en el HTML.");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log("ROMI: React montado exitosamente.");
} catch (error) {
  console.error("ROMI: Error fatal al iniciar React:", error);
  // Trigger window.onerror manually if needed
  if (window.onerror) {
    window.onerror(
      error instanceof Error ? error.message : String(error), 
      "index.tsx", 
      0, 
      0, 
      error instanceof Error ? error : undefined
    );
  }
}
