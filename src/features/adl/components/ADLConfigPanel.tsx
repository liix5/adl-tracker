import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ConfigOption } from "@/data/adl-definitions";
import type { ADLType } from "@/db/types";
import { ArrowRightLeft, Shirt, Sparkles } from "lucide-react";

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
  // Check ADL type categories
  const isDressing = adlType === "dressingUpper" || adlType === "dressingLower";
  const isTransfer =
    adlType === "transferBedChair" ||
    adlType === "transferToilet" ||
    adlType === "transferBathShower";

  // Transfers use single-select (radio), others use multi-select (checkbox)
  const isSingleSelect = isTransfer;

  const handleToggle = (optionId: string) => {
    if (isSingleSelect) {
      // Single select: replace selection
      onChange([optionId]);
    } else {
      // Multi select: toggle
      const newSelected = selectedOptions.includes(optionId)
        ? selectedOptions.filter((id) => id !== optionId)
        : [...selectedOptions, optionId];
      onChange(newSelected);
    }
  };

  const totalSteps = options
    .filter((opt) => selectedOptions.includes(opt.id))
    .reduce((sum, opt) => sum + opt.steps.length, 0);

  // Dynamic text based on ADL type
  const getConfigText = () => {
    if (isDressing) {
      return {
        icon: Shirt,
        header: "Select Garments Worn",
        sub: "Choose which items the patient is wearing today",
        summary: "garment",
        empty: "Select at least one garment to begin assessment",
      };
    }
    if (isTransfer) {
      return {
        icon: ArrowRightLeft,
        header: "Select Transfer Mode",
        sub: "Choose how the patient transfers",
        summary: "mode",
        empty: "Select a transfer mode to begin assessment",
      };
    }
    // Grooming (default)
    return {
      icon: Sparkles,
      header: "Select Grooming Activities",
      sub: "Choose which grooming activities apply to this patient",
      summary: "activity",
      empty: "Select grooming tasks the patient performs",
    };
  };

  const configText = getConfigText();
  const Icon = configText.icon;

  // Format summary text with correct pluralization
  const getSummaryText = () => {
    const count = selectedOptions.length;
    if (isTransfer) {
      return `${configText.summary} selected`;
    }
    if (isDressing) {
      return `${count} ${configText.summary}${count !== 1 ? "s" : ""} selected`;
    }
    // Grooming: activity -> activities
    return `${count} ${count !== 1 ? "activities" : "activity"} selected`;
  };

  return (
    <div className={className}>
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {configText.header}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{configText.sub}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <div
              key={option.id}
              className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:shadow-sm"
              }`}
              onClick={() => handleToggle(option.id)}
            >
              <span onClick={(e) => e.stopPropagation()}>
                {isSingleSelect ? (
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                ) : (
                  <Checkbox
                    id={`option-${option.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(option.id)}
                    className="mt-0.5"
                  />
                )}
              </span>
              <div className="flex-1">
                <Label
                  htmlFor={`option-${option.id}`}
                  className="cursor-pointer font-semibold"
                >
                  {option.name}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.steps.length} step
                  {option.steps.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOptions.length > 0 ? (
        <div className="mt-4 rounded-lg bg-primary/10 p-3 text-center">
          <p className="text-sm font-semibold text-primary">
            {getSummaryText()} • {totalSteps} total steps
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border-2 border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">{configText.empty}</p>
        </div>
      )}
    </div>
  );
}
