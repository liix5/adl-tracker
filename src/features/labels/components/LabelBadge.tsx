import { getLabelColor, isPresetColor } from "../constants";
import type { Label } from "@/db/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LabelBadgeProps {
  label: Label;
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
}

export function LabelBadge({
  label,
  size = "md",
  onClick,
  className,
}: LabelBadgeProps) {
  const color = getLabelColor(label.color);
  const isCustom = !isPresetColor(label.color);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0",
    md: "text-xs px-2 py-0.5",
  };

  // For custom colors, use inline styles
  const customStyle = isCustom
    ? {
        backgroundColor: `${color.hex}20`, // 20 = ~12% opacity
        color: color.hex,
        borderColor: `${color.hex}40`,
      }
    : undefined;

  const badgeContent = (
    <Badge
      className={cn(
        isCustom ? "border" : color.classes,
        onClick && "cursor-pointer transition-opacity hover:opacity-80",
        sizeClasses[size],
        className
      )}
      style={customStyle}
    >
      {label.name}
    </Badge>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick}>
        {badgeContent}
      </button>
    );
  }

  return badgeContent;
}
