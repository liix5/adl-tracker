/// <reference types="vite/client" />

// ============================================================
// Type declarations for vite-plugin-pwa virtual modules
// These allow TypeScript to understand the PWA imports
// ============================================================

declare module "virtual:pwa-register" {
  export interface RegisterSWOptions {
    // Called when the service worker has registered successfully
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    // Called if the service worker registration fails
    onRegisterError?: (error: Error) => void;
    // Called when a new service worker is available and waiting to activate
    // Only relevant when registerType is "prompt"
    onNeedRefresh?: () => void;
    // Called when the app has been fully cached for offline use
    onOfflineReady?: () => void;
  }

  // Registers the service worker and returns an update function
  // The update function can be called to manually check for updates
  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}
