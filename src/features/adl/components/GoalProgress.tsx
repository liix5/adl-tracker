import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AssistanceLevel } from "@/db/types";
import { ScoreBadge } from "./ScoreDisplay";
import { ArrowRight, Target, TrendingUp } from "lucide-react";

interface GoalProgressProps {
  admissionScore: number;
  currentScore: number;
  goalScore?: number;
  className?: string;
}

export function GoalProgress({
  admissionScore,
  currentScore,
  goalScore,
  className,
}: GoalProgressProps) {
  const hasGoal = goalScore !== undefined;
  const progressPercentage = hasGoal
    ? calculateProgressPercentage(admissionScore, currentScore, goalScore)
    : 0;

  const improvement = currentScore - admissionScore;
  const isImproving = improvement > 0;
  const isStable = improvement === 0;
  const isDeclining = improvement < 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Score Timeline */}
      <div className="flex items-center justify-between gap-4">
        {/* Admission */}
        <div className="flex flex-col items-center gap-2">
          <ScoreBadge score={admissionScore as AssistanceLevel} />
          <div className="text-center">
            <div className="text-xs font-medium text-muted-foreground">
              Admission
            </div>
          </div>
        </div>

        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />

        {/* Current */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <ScoreBadge
              score={currentScore as AssistanceLevel}
              className="ring-2 ring-primary ring-offset-2"
            />
            {isImproving && (
              <div className="absolute -right-1 -top-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-primary">Current</div>
            {improvement !== 0 && (
              <div
                className={cn(
                  "text-xs font-semibold",
                  isImproving && "text-green-600",
                  isDeclining && "text-red-600",
                )}
              >
                {improvement > 0 ? "+" : ""}
                {improvement}
              </div>
            )}
          </div>
        </div>

        {hasGoal && (
          <>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />

            {/* Goal */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <ScoreBadge
                  score={goalScore as AssistanceLevel}
                  className="opacity-70"
                />
                <div className="absolute -right-1 -top-1">
                  <Target className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  Goal
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Progress Bar (if goal is set) */}
      {hasGoal && (
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {progressPercentage}% to goal
            </span>
            {currentScore >= goalScore ? (
              <span className="font-semibold text-green-600">
                🎉 Goal Achieved!
              </span>
            ) : (
              <span className="text-muted-foreground">
                {goalScore - currentScore} points remaining
              </span>
            )}
          </div>
        </div>
      )}

      {/* Status Message */}
      <div
        className={cn(
          "rounded-lg border-l-4 p-3 text-sm",
          isImproving &&
            "border-green-500 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-100",
          isStable &&
            "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100",
          isDeclining &&
            "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-100",
        )}
      >
        {isImproving && (
          <p className="font-medium">
            Patient has improved by {improvement} point{improvement > 1 ? "s" : ""}{" "}
            since admission.
          </p>
        )}
        {isStable && (
          <p className="font-medium">
            Patient's score is stable at {currentScore} since admission.
          </p>
        )}
        {isDeclining && (
          <p className="font-medium">
            Patient's score has declined by {Math.abs(improvement)} point
            {Math.abs(improvement) > 1 ? "s" : ""} since admission.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Calculate progress percentage from admission to goal
 */
function calculateProgressPercentage(
  admission: number,
  current: number,
  goal: number,
): number {
  if (goal <= admission) return 100; // Already at or above goal

  const totalRange = goal - admission;
  const currentProgress = current - admission;
  const percentage = (currentProgress / totalRange) * 100;

  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
}
