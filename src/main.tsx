import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import i18n from "./i18n"; // Initialize i18n

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration.scope);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              console.log('New content available, refresh to update.');
            }
          });
        }
      });
      
      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_SESSIONS') {
          // Trigger sync from app - handled by OfflineIndicator
          window.dispatchEvent(new CustomEvent('sw-sync-sessions'));
        }
      });
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  });
}

// Wait for i18n to be ready before rendering
const renderApp = () => {
  createRoot(document.getElementById("root")!).render(<App />);
};

// i18n is already initialized synchronously with bundled resources
// but we ensure it's ready
if (i18n.isInitialized) {
  renderApp();
} else {
  i18n.on('initialized', renderApp);
}
