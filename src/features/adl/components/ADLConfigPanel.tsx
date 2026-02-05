import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ConfigOption } from "@/data/adl-definitions";
import type { ADLType } from "@/db/types";
import { Shirt, Sparkles } from "lucide-react";
import * as React from "react";

interface ADLConfigPanelProps {
  options: ConfigOption[];
  selectedOptions: string[];
  onChange: (selectedOptions: string[]) => void;
  adlType: ADLType;
  className?: string;
}

export function ADLConfigPanel({
  options,
  selectedOptions,
  onChange,
  adlType,
  className,
}: ADLConfigPanelProps) {
  // Auto-select required options on mount
  React.useEffect(() => {
    const requiredOptions = options.filter((opt) =>
      opt.id.includes("core-grooming"),
    );
    const requiredIds = requiredOptions.map((opt) => opt.id);

    if (requiredIds.length > 0) {
      const hasAllRequired = requiredIds.every((id) =>
        selectedOptions.includes(id),
      );
      if (!hasAllRequired) {
        onChange([...new Set([...selectedOptions, ...requiredIds])]);
      }
    }
  }, [options, selectedOptions, onChange]);

  const handleToggle = (optionId: string) => {
    // Prevent deselecting required options
    const isRequired = optionId.includes("core-grooming");
    if (isRequired) return;

    const newSelected = selectedOptions.includes(optionId)
      ? selectedOptions.filter((id) => id !== optionId)
      : [...selectedOptions, optionId];
    onChange(newSelected);
  };

  const totalSteps = options
    .filter((opt) => selectedOptions.includes(opt.id))
    .reduce((sum, opt) => sum + opt.steps.length, 0);

  // Dynamic text based on ADL type
  const isDressing =
    adlType === "dressingUpper" || adlType === "dressingLower";
  const isGrooming = adlType === "grooming";

  const headerIcon = isDressing ? Shirt : Sparkles;
  const headerText = isDressing
    ? "Select Garments Worn"
    : "Select Grooming Activities";
  const subText = isDressing
    ? "Choose which items the patient is wearing today"
    : "Choose which grooming activities apply to this patient";
  const summaryText = isDressing ? "garment" : "activity";
  const emptyText = isDressing
    ? "Select at least one garment to begin assessment"
    : "Core grooming tasks are always included";

  const Icon = headerIcon;

  return (
    <div className={className}>
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {headerText}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{subText}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const isRequired = option.id.includes("core-grooming");

          return (
            <div
              key={option.id}
              className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                isRequired
                  ? "border-primary/30 bg-primary/5"
                  : "hover:border-primary/40 hover:shadow-sm"
              }`}
              onClick={() => handleToggle(option.id)}
            >
              <span onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  id={`option-${option.id}`}
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(option.id)}
                  disabled={isRequired}
                  className="mt-0.5"
                />
              </span>
              <div className="flex-1 cursor-pointer">
                <Label
                  htmlFor={`option-${option.id}`}
                  className={`cursor-pointer font-semibold ${
                    isRequired ? "text-primary" : ""
                  }`}
                >
                  {option.name}
                  {isRequired && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Required)
                    </span>
                  )}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.steps.length} step{option.steps.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOptions.length > 0 ? (
        <div className="mt-4 rounded-lg bg-primary/10 p-3 text-center">
          <p className="text-sm font-semibold text-primary">
            {selectedOptions.length} {summaryText}
            {selectedOptions.length !== 1 ? (isDressing ? "s" : "ies") : (isGrooming ? "y" : "")}{" "}
            selected • {totalSteps} total steps
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border-2 border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      )}
    </div>
  );
}
