import * as React from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { InstallPromptDialog } from "./InstallPromptDialog";

export function InstallButton() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { canInstall, isStandalone } = usePWAInstall();

  // Don't render if already installed or can't install
  if (isStandalone || !canInstall) return null;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg"
        aria-label="Install app"
      >
        <Download className="h-5 w-5" />
      </Button>

      <InstallPromptDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
