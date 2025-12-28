
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render App:", error);
    rootElement.innerHTML = `
      <div style="color: white; padding: 20px; font-family: sans-serif; background: #900; height: 100vh;">
        <h1>Initialization Error</h1>
        <p>The application failed to start. Please check the browser console (F12) for details.</p>
        <pre>${error}</pre>
      </div>
    `;
  }
}
