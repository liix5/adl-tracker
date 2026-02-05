import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Score6Reason } from "@/db/types";
import { Clock, Shield, Wrench } from "lucide-react";

interface Score6ReasonSelectorProps {
  value: Score6Reason[];
  onChange: (value: Score6Reason[]) => void;
  className?: string;
}

const REASON_OPTIONS: Array<{
  value: Score6Reason;
  label: string;
  description: string;
  icon: typeof Wrench;
}> = [
  {
    value: "assistiveDevice",
    label: "Assistive Device",
    description: "Uses equipment to complete task",
    icon: Wrench,
  },
  {
    value: "safetyConcerns",
    label: "Safety Concerns",
    description: "Risk of injury but patient manages",
    icon: Shield,
  },
  {
    value: "extraTime",
    label: "Extra Time",
    description: "Takes longer than reasonable",
    icon: Clock,
  },
];

export function Score6ReasonSelector({
  value,
  onChange,
  className,
}: Score6ReasonSelectorProps) {
  const handleToggle = (reason: Score6Reason) => {
    const newValue = value.includes(reason)
      ? value.filter((r) => r !== reason)
      : [...value, reason];
    onChange(newValue);
  };

  return (
    <div className={className}>
      <div className="mb-3 text-sm font-semibold text-muted-foreground">
        Why Modified Independence?
      </div>
      <div className="space-y-3">
        {REASON_OPTIONS.map((option) => {
          const isChecked = value.includes(option.value);
          const Icon = option.icon;

          return (
            <div
              key={option.value}
              className="flex items-start space-x-3 rounded-lg border-2 p-4 transition-all hover:border-primary/40 hover:shadow-sm"
              onClick={() => handleToggle(option.value)}
            >
              <span onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  id={`reason-${option.value}`}
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(option.value)}
                  className="mt-0.5"
                />
              </span>
              <div className="flex-1 cursor-pointer space-y-1">
                <Label
                  htmlFor={`reason-${option.value}`}
                  className="flex cursor-pointer items-center gap-2 font-semibold"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {value.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Select at least one reason for modified independence
        </p>
      )}
    </div>
  );
}
