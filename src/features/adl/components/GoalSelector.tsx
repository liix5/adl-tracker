import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAssistanceLevelName } from "@/features/adl/scoring";
import type { AssistanceLevel } from "@/db/types";
import { Target, Check, X } from "lucide-react";

interface GoalSelectorProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  currentScore?: number;
  admissionScore?: number;
  className?: string;
}

const SCORE_COLORS: Record<AssistanceLevel, string> = {
  7: "bg-green-500 hover:bg-green-600 border-green-600",
  6: "bg-green-400 hover:bg-green-500 border-green-500",
  5: "bg-yellow-400 hover:bg-yellow-500 border-yellow-500",
  4: "bg-orange-400 hover:bg-orange-500 border-orange-500",
  3: "bg-orange-500 hover:bg-orange-600 border-orange-600",
  2: "bg-red-400 hover:bg-red-500 border-red-500",
  1: "bg-red-500 hover:bg-red-600 border-red-600",
};

export function GoalSelector({
  value,
  onChange,
  currentScore,
  admissionScore,
  className,
}: GoalSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scores: AssistanceLevel[] = [7, 6, 5, 4, 3, 2, 1];

  // If there's already a value or user clicked to edit, show expanded view
  const showExpanded = isExpanded || value !== undefined;

  if (!showExpanded) {
    return (
      <Button
        variant="outline"
        className={cn("w-full gap-2 border-dashed", className)}
        onClick={() => setIsExpanded(true)}
      >
        <Target className="h-4 w-4" />
        Set a Goal
      </Button>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Target className="h-4 w-4 text-primary" />
          Select Target Score
        </div>
        {value !== undefined && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground"
            onClick={() => {
              onChange(undefined);
              setIsExpanded(false);
            }}
          >
            <X className="h-3 w-3" />
            Clear Goal
          </Button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {scores.map((score) => {
          const isSelected = value === score;
          const isBelowAdmission =
            admissionScore !== undefined && score <= admissionScore;
          const isDisabled = isBelowAdmission;

          return (
            <button
              key={score}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(score)}
              className={cn(
                "relative flex h-12 flex-col items-center justify-center rounded-lg border-2 text-white transition-all",
                SCORE_COLORS[score],
                isSelected && "ring-2 ring-primary ring-offset-2",
                isDisabled && "cursor-not-allowed opacity-40",
                !isDisabled && !isSelected && "opacity-80 hover:opacity-100",
              )}
            >
              <span className="text-lg font-bold">{score}</span>
              {isSelected && (
                <div className="absolute -right-1 -top-1 rounded-full bg-primary p-0.5">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected goal description */}
      {value !== undefined && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white",
                SCORE_COLORS[value as AssistanceLevel],
              )}
            >
              {value}
            </div>
            <div>
              <div className="text-sm font-medium">
                {getAssistanceLevelName(value as AssistanceLevel)}
              </div>
              {currentScore !== undefined && value > currentScore && (
                <div className="text-xs text-muted-foreground">
                  {value - currentScore} point{value - currentScore > 1 ? "s" : ""} to
                  reach this goal
                </div>
              )}
              {currentScore !== undefined && value <= currentScore && (
                <div className="text-xs font-medium text-green-600">
                  Goal already achieved!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Level reference */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div>7 = Complete Independence</div>
        <div>6 = Modified Independence</div>
        <div>5 = Setup/Supervision</div>
        <div>4 = Minimal Assist (75%+)</div>
        <div>3 = Moderate Assist (50-74%)</div>
        <div>2 = Maximal Assist (25-49%)</div>
        <div className="col-span-2">1 = Total Assistance (&lt;25%)</div>
      </div>
    </div>
  );
}
