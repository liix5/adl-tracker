import { useState, useEffect, useCallback } from "react";

type Platform = "ios" | "android" | "macos" | "windows" | "linux" | "unknown";
type Browser =
  | "chrome"
  | "safari"
  | "firefox"
  | "edge"
  | "samsung"
  | "unknown";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallState {
  canInstall: boolean;
  platform: Platform;
  browser: Browser;
  isStandalone: boolean;
  isSupported: boolean;
  triggerInstall: () => Promise<boolean>;
  dismiss: () => void;
  isDismissed: boolean;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION_DAYS = 7;

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/macintosh|mac os x/.test(ua)) return "macos";
  if (/windows/.test(ua)) return "windows";
  if (/linux/.test(ua)) return "linux";

  return "unknown";
}

function detectBrowser(): Browser {
  const ua = navigator.userAgent.toLowerCase();

  // Order matters - check more specific browsers first
  if (/samsungbrowser/.test(ua)) return "samsung";
  if (/edg\//.test(ua)) return "edge";
  if (/chrome/.test(ua) && !/edg\//.test(ua)) return "chrome";
  if (/safari/.test(ua) && !/chrome/.test(ua)) return "safari";
  if (/firefox/.test(ua)) return "firefox";

  return "unknown";
}

function isStandaloneMode(): boolean {
  // Check if running as installed PWA
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function isDismissedRecently(): boolean {
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return false;

  const dismissedDate = new Date(parseInt(dismissedAt, 10));
  const now = new Date();
  const daysDiff =
    (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysDiff < DISMISS_DURATION_DAYS;
}

function setDismissed(): void {
  localStorage.setItem(DISMISS_KEY, Date.now().toString());
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(() => isDismissedRecently());
  const [isStandalone, setIsStandalone] = useState(() => isStandaloneMode());

  const platform = detectPlatform();
  const browser = detectBrowser();

  // Check if browser supports native install prompt (beforeinstallprompt)
  const supportsNativePrompt =
    browser === "chrome" || browser === "edge" || browser === "samsung";

  // Safari has manual install instructions
  const hasSafariInstructions = browser === "safari";

  // Firefox on Android has menu-based install
  const hasFirefoxAndroidInstall =
    browser === "firefox" && platform === "android";

  // Firefox Desktop does not support PWA install
  const isUnsupported =
    browser === "firefox" && platform !== "android" && platform !== "ios";

  // Determine if install is supported at all
  const isSupported =
    supportsNativePrompt || hasSafariInstructions || hasFirefoxAndroidInstall;

  useEffect(() => {
    // Listen for standalone mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);

    // Listen for beforeinstallprompt event (Chrome/Edge/Samsung)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed();
    setIsDismissed(true);
  }, []);

  // Can install if:
  // - Not already installed as standalone
  // - Browser is supported
  // - Either has native prompt OR has manual instructions (Safari)
  const canInstall =
    !isStandalone &&
    !isUnsupported &&
    (deferredPrompt !== null || hasSafariInstructions || hasFirefoxAndroidInstall);

  return {
    canInstall,
    platform,
    browser,
    isStandalone,
    isSupported,
    triggerInstall,
    dismiss,
    isDismissed,
  };
}
