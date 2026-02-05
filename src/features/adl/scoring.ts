import type { AssistanceLevel, ADLType } from "@/db/types";
import type { ADLDefinition, ADLStep } from "@/data/adl-definitions";

/**
 * Calculate the percentage of steps completed
 */
export function calculatePercentage(
  completedSteps: string[],
  totalSteps: ADLStep[],
): number {
  if (totalSteps.length === 0) return 0;

  // For bathing with weighted steps
  const hasWeights = totalSteps.some((step) => step.weight !== undefined);

  if (hasWeights) {
    const totalWeight = totalSteps.reduce((sum, step) => sum + (step.weight || 0), 0);
    const completedWeight = totalSteps
      .filter((step) => completedSteps.includes(step.id))
      .reduce((sum, step) => sum + (step.weight || 0), 0);

    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  }

  // Regular equal-weight steps
  return Math.round((completedSteps.length / totalSteps.length) * 100);
}

/**
 * Get applicable steps for an ADL (handles configurable steps for dressing)
 */
export function getApplicableSteps(
  adlDefinition: ADLDefinition,
  selectedOptions?: string[],
): ADLStep[] {
  // Fixed steps (most ADLs)
  if (adlDefinition.steps) {
    return adlDefinition.steps;
  }

  // Configurable steps (dressing)
  if (adlDefinition.configurableSteps && selectedOptions) {
    const allSteps: ADLStep[] = [];

    for (const optionId of selectedOptions) {
      const option = adlDefinition.configurableSteps.options.find(
        (opt) => opt.id === optionId,
      );
      if (option) {
        allSteps.push(...option.steps);
      }
    }

    return allSteps;
  }

  return [];
}

/**
 * Get the assistance level name for display
 */
export function getAssistanceLevelName(level: AssistanceLevel): string {
  const names: Record<AssistanceLevel, string> = {
    7: "Complete Independence",
    6: "Modified Independence",
    5: "Supervision/Setup",
    4: "Minimal Assistance",
    3: "Moderate Assistance",
    2: "Maximal Assistance",
    1: "Total Assistance",
  };
  return names[level];
}

/**
 * Get the assistance level description for display
 */
export function getAssistanceLevelDescription(level: AssistanceLevel): string {
  const descriptions: Record<AssistanceLevel, string> = {
    7: "No helper, no device, safe, timely",
    6: "Independent but with modifier(s)",
    5: "Helper provides non-physical assistance",
    4: "Patient does 75%+ of effort",
    3: "Patient does 50-74% of effort",
    2: "Patient does 25-49% of effort",
    1: "Patient does <25%, or 2+ helpers needed",
  };
  return descriptions[level];
}

/**
 * Calculate the FIM score automatically from steps completed and follow-up answers.
 *
 * < 25% steps  → Score 1 (Total Assistance)
 * 25-49%       → Score 2 (Maximal Assistance)
 * 50-74%       → Score 3 (Moderate Assistance)
 * 75-99%       → Score 4 (Minimal Assistance)
 * 100%         → Score 4 until follow-up questions are answered, then 5, 6, or 7
 */
export function calculateScoreFromSteps(params: {
  completedSteps: string[];
  applicableSteps: ADLStep[];
  needsSupervision?: boolean;
  needsModifiers?: boolean;
}): {
  score: AssistanceLevel;
  percentage: number;
  needsFollowUp: boolean;
} {
  const { completedSteps, applicableSteps, needsSupervision, needsModifiers } =
    params;

  const percentage = calculatePercentage(completedSteps, applicableSteps);

  if (percentage < 25) {
    return { score: 1, percentage, needsFollowUp: false };
  }
  if (percentage < 50) {
    return { score: 2, percentage, needsFollowUp: false };
  }
  if (percentage < 75) {
    return { score: 3, percentage, needsFollowUp: false };
  }
  if (percentage < 100) {
    return { score: 4, percentage, needsFollowUp: false };
  }

  // 100% — stays at 4 until follow-up questions are resolved
  if (needsSupervision === undefined) {
    // Follow-up Q1 not yet answered
    return { score: 4, percentage, needsFollowUp: true };
  }
  if (needsSupervision) {
    return { score: 5, percentage, needsFollowUp: false };
  }
  if (needsModifiers === undefined) {
    // Follow-up Q2 not yet answered
    return { score: 4, percentage, needsFollowUp: true };
  }
  if (needsModifiers) {
    return { score: 6, percentage, needsFollowUp: false };
  }

  return { score: 7, percentage, needsFollowUp: false };
}

/**
 * ADL-specific follow-up question text and examples from the FIM manual.
 */
export type ADLFollowUpData = {
  supervisionQuestion: string;
  supervisionExamples: string;
  modifierQuestion: string;
  modifierExamples: string;
};

export const ADL_FOLLOWUP_QUESTIONS: Record<ADLType, ADLFollowUpData> = {
  eating: {
    supervisionQuestion:
      "Does the patient require supervision or setup for eating?",
    supervisionExamples:
      "e.g., cueing to slow down, opening containers, cutting meat, pouring liquids, applying orthosis",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., long straw, spork, built-up handle, rocker knife, modified food consistency, risk of burns/choking, extra time",
  },
  grooming: {
    supervisionQuestion:
      "Does the patient require supervision or setup for grooming?",
    supervisionExamples:
      "e.g., setting out equipment, applying toothpaste, opening containers",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., built-up toothbrush, long-handled comb, risk of cutting self while shaving, extra time",
  },
  bathing: {
    supervisionQuestion:
      "Does the patient require supervision or setup for bathing?",
    supervisionExamples:
      "e.g., standing by for safety, cueing for sequencing, preparing water, setting out equipment",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., long-handled sponge, risk of scalding, extra time",
  },
  dressingUpper: {
    supervisionQuestion:
      "Does the patient require supervision or setup for upper body dressing?",
    supervisionExamples:
      "e.g., setting out clothes, applying orthosis/prosthesis",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., adaptive clothing, button hook, reacher, extra time",
  },
  dressingLower: {
    supervisionQuestion:
      "Does the patient require supervision or setup for lower body dressing?",
    supervisionExamples:
      "e.g., setting out clothes, applying orthosis/prosthesis",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., adaptive clothing, button hook, reacher, sock aid, extra time",
  },
  toileting: {
    supervisionQuestion:
      "Does the patient require supervision or setup for toileting?",
    supervisionExamples:
      "e.g., supervision if impulsive, passing toilet paper, opening packages",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., holds rail for pulling up clothing, safety concerns, extra time",
  },
  transferBedChair: {
    supervisionQuestion:
      "Does the patient require supervision or setup for bed/chair transfers?",
    supervisionExamples:
      "e.g., supervision for safety/hip precautions, setup of slide board, foot rests, brakes",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., slide board, grab bars, leg lifter, special seat, brace/crutches, safety concerns",
  },
  transferToilet: {
    supervisionQuestion:
      "Does the patient require supervision or setup for toilet transfers?",
    supervisionExamples: "e.g., setup of slide board, foot rests",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., mobile commode, slide board, grab bars, over-toilet aid, safety concerns",
  },
  transferBathShower: {
    supervisionQuestion:
      "Does the patient require supervision or setup for bath/shower transfers?",
    supervisionExamples: "e.g., setup of slide board, foot rests",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., slide board, grab bars, special seat, safety concerns",
  },
  locomotionWalkWheelchair: {
    supervisionQuestion:
      "Does the patient require supervision or cueing for walking/wheelchair 50m?",
    supervisionExamples: "e.g., supervision, verbal cueing for 50 metres",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., brace/prosthesis, walking stick, crutches, walking frame, safety concerns, extra time",
  },
  locomotionStairs: {
    supervisionQuestion:
      "Does the patient require supervision for a full flight of stairs?",
    supervisionExamples: "e.g., supervision for a full flight",
    modifierQuestion:
      "Does the patient use a device, have safety concerns, or need extra time?",
    modifierExamples:
      "e.g., handrail, walking stick, portable supports, safety concerns, extra time",
  },
};
