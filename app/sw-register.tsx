'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker in both development and production
      // In development, it will work if served over HTTPS or localhost
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
          });
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('New service worker available');
                }
              });
            }
          });
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      };
      
      // Register after page load
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}

