import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy, Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressNoteProps {
  note: string;
  className?: string;
}

export function ProgressNote({ note, className }: ProgressNoteProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Progress Note
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="relative rounded-lg border-2 bg-muted/30 p-4">
        <p className="select-all text-sm leading-relaxed text-foreground">
          {note}
        </p>

        {/* Subtle gradient overlay for visual polish */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-transparent via-transparent to-primary/5" />
      </div>

      <p className="text-xs text-muted-foreground">
        This clinical note updates in real-time based on your assessment. Click
        "Copy" to paste into your EMR system.
      </p>
    </div>
  );
}
