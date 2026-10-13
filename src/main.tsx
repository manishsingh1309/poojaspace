import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DriveProvider } from './context/DriveContext';
import { UploadProvider } from './context/UploadContext';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Auto-refresh when new version is available
      console.log('Poojaspace update available');
    },
    onOfflineReady() {
      console.log('Poojaspace is ready for offline use');
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DriveProvider>
          <UploadProvider>
            <App />
          </UploadProvider>
        </DriveProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

