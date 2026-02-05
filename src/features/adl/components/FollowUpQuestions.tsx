import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ADLType, Score6Reason, Score5Type } from "@/db/types";
import { ADL_FOLLOWUP_QUESTIONS } from "../scoring";
import { Score5TypeSelector } from "./Score5TypeSelector";
import { Score6ReasonSelector } from "./Score6ReasonSelector";
import { CheckCircle2, HelpCircle } from "lucide-react";

interface FollowUpQuestionsProps {
  adlType: ADLType;
  percentage: number;
  needsSupervision: boolean | undefined;
  onNeedsSupervisionChange: (value: boolean) => void;
  needsModifiers: boolean | undefined;
  onNeedsModifiersChange: (value: boolean) => void;
  score5Types: Score5Type[];
  onScore5TypesChange: (value: Score5Type[]) => void;
  score6Reasons: Score6Reason[];
  onScore6ReasonsChange: (value: Score6Reason[]) => void;
}

export function FollowUpQuestions({
  adlType,
  percentage,
  needsSupervision,
  onNeedsSupervisionChange,
  needsModifiers,
  onNeedsModifiersChange,
  score5Types,
  onScore5TypesChange,
  score6Reasons,
  onScore6ReasonsChange,
}: FollowUpQuestionsProps) {
  if (percentage !== 100) return null;

  const followUp = ADL_FOLLOWUP_QUESTIONS[adlType];

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Q1: Supervision / Setup */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
            <div>
              <p className="font-semibold">{followUp.supervisionQuestion}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {followUp.supervisionExamples}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={needsSupervision === true ? "default" : "outline"}
              className="flex-1"
              size="lg"
              onClick={() => onNeedsSupervisionChange(true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={needsSupervision === false ? "default" : "outline"}
              className="flex-1"
              size="lg"
              onClick={() => onNeedsSupervisionChange(false)}
            >
              No
            </Button>
          </div>

          {/* Score 5 sub-selector */}
          {needsSupervision === true && (
            <div className="mt-3">
              <Score5TypeSelector
                value={score5Types}
                onChange={onScore5TypesChange}
              />
            </div>
          )}
        </div>

        {/* Q2: Device / Safety / Time (only if Q1 answered No) */}
        {needsSupervision === false && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div>
                <p className="font-semibold">{followUp.modifierQuestion}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {followUp.modifierExamples}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={needsModifiers === true ? "default" : "outline"}
                className="flex-1"
                size="lg"
                onClick={() => onNeedsModifiersChange(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={needsModifiers === false ? "default" : "outline"}
                className="flex-1"
                size="lg"
                onClick={() => onNeedsModifiersChange(false)}
              >
                No
              </Button>
            </div>

            {/* Score 6 sub-selector */}
            {needsModifiers === true && (
              <div className="mt-3">
                <Score6ReasonSelector
                  value={score6Reasons}
                  onChange={onScore6ReasonsChange}
                />
              </div>
            )}

            {/* Score 7 confirmation */}
            {needsModifiers === false && (
              <div className="flex items-center gap-2 rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Score 7 — Complete Independence
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
