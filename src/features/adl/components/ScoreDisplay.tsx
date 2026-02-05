import { cn } from "@/lib/utils";
import { getAssistanceLevelName } from "../scoring";
import type { AssistanceLevel } from "@/db/types";

interface ScoreDisplayProps {
  score: AssistanceLevel;
  className?: string;
  showDescription?: boolean;
}

export function ScoreDisplay({
  score,
  className,
  showDescription = true,
}: ScoreDisplayProps) {
  const levelName = getAssistanceLevelName(score);

  // Color coding based on FIM score
  const colorClass = getScoreColorClass(score);

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-8 text-center shadow-sm transition-all hover:shadow-md",
        colorClass,
        className,
      )}
    >
      <div className="text-6xl font-bold tracking-tight">{score}</div>
      {showDescription && (
        <div className="mt-3 text-base font-semibold tracking-wide">
          {levelName}
        </div>
      )}
    </div>
  );
}

/**
 * Get color class for score display
 * Red (1-2), Yellow (3-4), Green (5-7)
 */
function getScoreColorClass(score: AssistanceLevel): string {
  if (score <= 2) {
    return "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100";
  }
  if (score <= 4) {
    return "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100";
  }
  return "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100";
}

interface ScoreBadgeProps {
  score: AssistanceLevel;
  className?: string;
}

/**
 * Compact badge version for displaying scores in lists
 */
export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const colorClass = getScoreColorClass(score);

  return (
    <div
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-sm",
        colorClass,
        className,
      )}
    >
      {score}
    </div>
  );
}
