import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),

    // ============================================================
    // PWA Configuration (vite-plugin-pwa)
    // This makes the app installable and enables offline support
    // ============================================================
    VitePWA({
      // "autoUpdate" = Updates silently in the background
      // Other options: "prompt" (asks user before updating)
      registerType: "autoUpdate",

      // Additional static assets to cache (beyond what workbox auto-detects)
      includeAssets: ["apple-touch-icon.png"],

      // ----------------------------------------
      // Web App Manifest (manifest.json)
      // This tells browsers how to display the app when installed
      // ----------------------------------------
      manifest: {
        // Full app name (shown on splash screen)
        name: "ADL Tracker",
        // Short name (shown under app icon on home screen, max ~12 chars)
        short_name: "ADL Tracker",
        // App description for app stores and install prompts
        description:
          "Track patient Activities of Daily Living using the FIM scale",
        // Theme color: affects browser UI (address bar, task switcher)
        theme_color: "#0f172a",
        // Background color: shown on splash screen while app loads
        background_color: "#0f172a",
        // Display mode: "standalone" = looks like a native app (no browser UI)
        // Other options: "fullscreen", "minimal-ui", "browser"
        display: "standalone",
        // Lock to portrait mode (good for mobile-first apps)
        orientation: "portrait",
        // Scope: which URLs the PWA controls (/ = entire site)
        scope: "/",
        // Start URL: where the app opens when launched from home screen
        start_url: "/",

        // App icons for different contexts
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            // Used for: Android home screen, Windows start menu
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            // Used for: Splash screens, app stores
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            // "maskable" = icon can be cropped to different shapes
            // (circles on some Android launchers, rounded squares on others)
            purpose: "maskable",
          },
        ],
      },

      // ----------------------------------------
      // Workbox Configuration (Service Worker)
      // Controls how the app caches files for offline use
      // ----------------------------------------
      workbox: {
        // Files to pre-cache during install (app shell)
        // These are available offline immediately after first visit
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

        // Runtime caching: cache external resources as they're requested
        runtimeCaching: [
          {
            // Cache Google Fonts (if used)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            // "CacheFirst" = serve from cache, only fetch if not cached
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
