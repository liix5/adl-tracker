import * as React from "react";
import { cn } from "@/lib/utils";
import type { ADLType } from "@/db/types";
import type { ADLDefinition } from "@/data/adl-definitions";
import { getCategoryName } from "@/data/adl-definitions";
import {
  Utensils,
  Sparkles,
  Droplets,
  Shirt,
  Footprints,
  Bath,
  BedDouble,
  Accessibility,
  Waves,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";

// Map ADL types to icons
const ADL_ICONS: Record<ADLType, LucideIcon> = {
  eating: Utensils,
  grooming: Sparkles,
  bathing: Droplets,
  dressingUpper: Shirt,
  dressingLower: Footprints,
  toileting: Bath,
  transferBedChair: BedDouble,
  transferToilet: Accessibility,
  transferBathShower: Waves,
  locomotionWalkWheelchair: PersonStanding,
};

// Short names for compact display
const ADL_SHORT_NAMES: Record<ADLType, string> = {
  eating: "Eating",
  grooming: "Grooming",
  bathing: "Bathing",
  dressingUpper: "Upper Body",
  dressingLower: "Lower Body",
  toileting: "Toileting",
  transferBedChair: "Bed/Chair",
  transferToilet: "Toilet",
  transferBathShower: "Tub/Shower",
  locomotionWalkWheelchair: "Walk/WC",
};

interface ADLCardSelectorProps {
  availableAdls: ADLDefinition[];
  selectedAdlType: ADLType | "";
  onSelect: (adlType: ADLType) => void;
}

export function ADLCardSelector({
  availableAdls,
  selectedAdlType,
  onSelect,
}: ADLCardSelectorProps) {
  // Group available ADLs by category
  const groupedAdls = React.useMemo(() => {
    const groups: Record<string, ADLDefinition[]> = {
      selfCare: [],
      transfers: [],
      locomotion: [],
    };

    availableAdls.forEach((adl) => {
      groups[adl.category].push(adl);
    });

    return groups;
  }, [availableAdls]);

  const categories = ["selfCare", "transfers", "locomotion"] as const;

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const adls = groupedAdls[category];
        if (adls.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {getCategoryName(category)}
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {adls.map((adl) => {
                const Icon = ADL_ICONS[adl.type];
                const isSelected = selectedAdlType === adl.type;

                return (
                  <button
                    key={adl.type}
                    type="button"
                    onClick={() => onSelect(adl.type)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all",
                      "hover:border-primary/50 hover:bg-accent",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-center text-xs font-medium leading-tight",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {ADL_SHORT_NAMES[adl.type]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
