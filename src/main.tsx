import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { registerSW } from "virtual:pwa-register";
import { routeTree } from "./routeTree.gen";

import "./index.css";

// ============================================================
// Service Worker Registration
// The service worker enables offline support and caching
// "virtual:pwa-register" is a virtual module provided by vite-plugin-pwa
// ============================================================
registerSW({
  // With "autoUpdate" in vite.config.ts, the app updates automatically
  // when a new version is detected. The page will reload silently.
  // No user prompt needed - updates happen seamlessly in the background.

  // Called when the app has been cached and is ready for offline use
  // This happens after the first visit when all assets are cached
  onOfflineReady() {
    console.log("App ready for offline use");
  },
});

const router = createRouter({ routeTree });

// (Type safety for router)
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
