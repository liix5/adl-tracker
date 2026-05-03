import { cn } from "@/lib/utils";
import { getAssistanceLevelName } from "../scoring";
import type { AssistanceLevel } from "@/db/types";

interface StickyScoreDisplayProps {
  score: AssistanceLevel;
  percentage: number;
  className?: string;
}

/**
 * Compact sticky score display that stays visible while scrolling
 */
export function StickyScoreDisplay({
  score,
  percentage,
  className,
}: StickyScoreDisplayProps) {
  const levelName = getAssistanceLevelName(score);
  const colorClass = getScoreColorClass(score);

  return (
    <div
      className={cn(
        "sticky top-0 z-10 -mx-4 px-4 py-3 backdrop-blur-md",
        "border-b bg-background/80",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Score circle */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold shadow-sm",
              colorClass
            )}
          >
            {score}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {levelName}
            </span>
            <span className="text-xs text-muted-foreground">FIM Score</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted sm:w-32">
            <div
              className={cn(
                "h-full transition-all duration-300",
                score >= 5
                  ? "bg-green-500"
                  : score >= 3
                    ? "bg-yellow-500"
                    : "bg-red-500"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="min-w-[3ch] text-right text-xs font-medium text-muted-foreground">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Get color class for score display
 * Red (1-2), Yellow (3-4), Green (5-7)
 */
function getScoreColorClass(score: AssistanceLevel): string {
  if (score <= 2) {
    return "border-2 border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100";
  }
  if (score <= 4) {
    return "border-2 border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100";
  }
  return "border-2 border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100";
}
