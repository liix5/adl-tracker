import { getLabelColor } from "../constants";
import { cn } from "@/lib/utils";

interface LabelDotProps {
  colorId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LabelDot({ colorId, size = "md", className }: LabelDotProps) {
  const color = getLabelColor(colorId);

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn("inline-block shrink-0 rounded-full", sizeClasses[size], className)}
      style={{ backgroundColor: color.hex }}
      aria-label={color.name}
    />
  );
}
