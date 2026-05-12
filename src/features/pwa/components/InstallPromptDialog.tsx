import * as React from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Wifi,
  Rocket,
  Share,
  PlusSquare,
  MoreVertical,
} from "lucide-react";

const AUTO_SHOW_DELAY = 30000; // 30 seconds

interface InstallPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallPromptDialog({
  open,
  onOpenChange,
}: InstallPromptDialogProps) {
  const { platform, browser, triggerInstall, dismiss } = usePWAInstall();

  const handleInstall = async () => {
    const success = await triggerInstall();
    if (success) {
      onOpenChange(false);
    }
  };

  const handleDismiss = () => {
    dismiss();
    onOpenChange(false);
  };

  const handleGotIt = () => {
    dismiss();
    onOpenChange(false);
  };

  // Check if native install is available (Chrome/Edge/Samsung)
  const hasNativeInstall =
    browser === "chrome" || browser === "edge" || browser === "samsung";

  // Safari iOS instructions
  if (browser === "safari" && platform === "ios") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Add to Home Screen</DialogTitle>
            <DialogDescription>
              To install ADL Tracker on your device:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-medium">1</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Tap the</span>
                <Share className="h-5 w-5 text-primary" />
                <span className="font-medium">Share</span>
                <span>button</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-medium">2</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Scroll and tap</span>
                <PlusSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">"Add to Home Screen"</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-medium">3</span>
              </div>
              <div>
                <span>Tap </span>
                <span className="font-medium">"Add"</span>
                <span> in the top right</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleGotIt} className="w-full">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Safari macOS instructions
  if (browser === "safari" && platform === "macos") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Add to Dock</DialogTitle>
            <DialogDescription>
              To install ADL Tracker on your Mac:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-medium">1</span>
              </div>
              <div>
                <span>Click </span>
                <span className="font-medium">File</span>
                <span> in the menu bar</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-medium">2</span>
              </div>
              <div>
                <span>Click </span>
                <span className="font-medium">"Add to Dock"</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-medium">3</span>
              </div>
              <div>
                <span>Click </span>
                <span className="font-medium">"Add"</span>
                <span> to confirm</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleGotIt} className="w-full">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Firefox Android instructions
  if (browser === "firefox" && platform === "android") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Install App</DialogTitle>
            <DialogDescription>
              To install ADL Tracker on your device:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-medium">1</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Tap the</span>
                <MoreVertical className="h-5 w-5 text-primary" />
                <span className="font-medium">menu</span>
                <span>button</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-medium">2</span>
              </div>
              <div>
                <span>Tap </span>
                <span className="font-medium">"Install"</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleGotIt} className="w-full">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Native install prompt (Chrome/Edge/Samsung)
  if (hasNativeInstall) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Install ADL Tracker</DialogTitle>
            <DialogDescription>
              Get the full app experience:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Wifi className="h-4 w-4" />
              </div>
              <span>Works offline</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Rocket className="h-4 w-4" />
              </div>
              <span>Quick access from home screen</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Download className="h-4 w-4" />
              </div>
              <span>No app store needed</span>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" onClick={handleDismiss} className="flex-1">
              Not now
            </Button>
            <Button onClick={handleInstall} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Install App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Fallback - should not normally render
  return null;
}

// Auto-show logic component
export function InstallPromptAutoShow() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { canInstall, isDismissed, isStandalone } = usePWAInstall();

  React.useEffect(() => {
    // Don't show if already installed, dismissed, or can't install
    if (isStandalone || isDismissed || !canInstall) return;

    const timer = setTimeout(() => {
      setDialogOpen(true);
    }, AUTO_SHOW_DELAY);

    return () => clearTimeout(timer);
  }, [canInstall, isDismissed, isStandalone]);

  if (!canInstall) return null;

  return (
    <InstallPromptDialog open={dialogOpen} onOpenChange={setDialogOpen} />
  );
}
