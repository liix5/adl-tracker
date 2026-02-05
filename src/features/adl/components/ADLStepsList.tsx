import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { ADLStep } from "@/data/adl-definitions";
import { calculatePercentage } from "../scoring";
import { CheckCircle2 } from "lucide-react";

interface ADLStepsListProps {
  steps: ADLStep[];
  completedSteps: string[];
  onChange: (completedSteps: string[]) => void;
  className?: string;
}

export function ADLStepsList({
  steps,
  completedSteps,
  onChange,
  className,
}: ADLStepsListProps) {
  const handleToggle = (stepId: string) => {
    const newCompleted = completedSteps.includes(stepId)
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];
    onChange(newCompleted);
  };

  const percentage = calculatePercentage(completedSteps, steps);

  // Group steps by prefix (for dressing with multiple garments)
  const groupedSteps = groupStepsByPrefix(steps);

  return (
    <div className={className}>
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">
            Steps Completed
          </span>
          <span className="text-sm font-bold">
            {completedSteps.length} / {steps.length}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="text-right text-xs text-muted-foreground">
          {percentage}% complete
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedSteps).map(([groupName, groupSteps]) => (
          <div key={groupName} className="space-y-2">
            {groupName !== "default" && (
              <div className="text-sm font-semibold text-foreground">
                {groupName}
              </div>
            )}
            <div className="space-y-2">
              {groupSteps.map((step) => {
                const isChecked = completedSteps.includes(step.id);

                return (
                  <div
                    key={step.id}
                    className="flex items-start space-x-3 rounded-lg border p-3 transition-all hover:border-primary/40 hover:bg-accent/50"
                    onClick={() => handleToggle(step.id)}
                  >
                    <span onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        id={`step-${step.id}`}
                        checked={isChecked}
                        onCheckedChange={() => handleToggle(step.id)}
                        className="mt-0.5"
                      />
                    </span>
                    <div className="flex-1 cursor-pointer">
                      <Label
                        htmlFor={`step-${step.id}`}
                        className="flex cursor-pointer items-start gap-2 font-medium"
                      >
                        {isChecked && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                        )}
                        <span className={isChecked ? "line-through" : ""}>
                          {step.name}
                        </span>
                      </Label>
                      {step.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      )}
                      {step.weight && (
                        <p className="mt-1 text-xs font-medium text-primary">
                          {step.weight}% weight
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {steps.length === 0 && (
        <div className="rounded-lg border-2 border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No steps configured for this ADL
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Group steps by their prefix (e.g., "tshirt-", "bra-")
 * For dressing with multiple garments
 */
function groupStepsByPrefix(steps: ADLStep[]): Record<string, ADLStep[]> {
  const groups: Record<string, ADLStep[]> = {};

  for (const step of steps) {
    // Try to extract prefix from step ID (e.g., "tshirt-arms" -> "tshirt")
    const parts = step.id.split("-");
    const groupName = parts.length > 1 ? capitalize(parts[0]) : "default";

    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(step);
  }

  return groups;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
