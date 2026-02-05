import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Score5Type } from "@/db/types";
import { Eye, MessageSquare, Sparkles, Settings2 } from "lucide-react";

interface Score5TypeSelectorProps {
  value: Score5Type[];
  onChange: (value: Score5Type[]) => void;
  className?: string;
}

const TYPE_OPTIONS: Array<{
  value: Score5Type;
  label: string;
  description: string;
  icon: typeof Eye;
}> = [
  {
    value: "standby",
    label: "Standby",
    description: "Oversee execution of task",
    icon: Eye,
  },
  {
    value: "cueing",
    label: "Cueing",
    description: "Prompt or hint on what to do",
    icon: MessageSquare,
  },
  {
    value: "coaxing",
    label: "Coaxing",
    description: "Encourage to participate/complete",
    icon: Sparkles,
  },
  {
    value: "setup",
    label: "Setup",
    description: "Arrange items or apply devices",
    icon: Settings2,
  },
];

export function Score5TypeSelector({
  value,
  onChange,
  className,
}: Score5TypeSelectorProps) {
  const handleToggle = (type: Score5Type) => {
    const newValue = value.includes(type)
      ? value.filter((t) => t !== type)
      : [...value, type];
    onChange(newValue);
  };

  return (
    <div className={className}>
      <div className="mb-3 text-sm font-semibold text-muted-foreground">
        Type of Supervision/Setup
      </div>
      <div className="space-y-3">
        {TYPE_OPTIONS.map((option) => {
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
                  id={`type-${option.value}`}
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(option.value)}
                  className="mt-0.5"
                />
              </span>
              <div className="flex-1 cursor-pointer space-y-1">
                <Label
                  htmlFor={`type-${option.value}`}
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
          Select at least one type of supervision or setup
        </p>
      )}
    </div>
  );
}
