import type { AssistanceLevel, Score6Reason, Score5Type } from "@/db/types";
import type { ADLStep } from "@/data/adl-definitions";
import { getAssistanceLevelName } from "./scoring";

/**
 * Generate a clinical progress note based on ADL assessment data
 */
export function generateProgressNote(params: {
  adlName: string;
  score: AssistanceLevel;
  percentage: number;
  completedSteps: string[];
  totalSteps: ADLStep[];
  score6Reasons?: Score6Reason[];
  score5Types?: Score5Type[];
}): string {
  const {
    adlName,
    score,
    percentage,
    completedSteps,
    totalSteps,
    score6Reasons,
    score5Types,
  } = params;

  // Build the progress note based on score level
  switch (score) {
    case 7:
      return `Patient completes ${adlName.toLowerCase()} independently without assistive devices, safely, and within reasonable time, scoring 7 (Complete Independence) on the FIM scale.`;

    case 6:
      return generateScore6Note(adlName, score6Reasons);

    case 5:
      return generateScore5Note(adlName, score5Types);

    case 4:
    case 3:
    case 2:
      return generatePhysicalAssistanceNote(
        adlName,
        score,
        percentage,
        completedSteps,
        totalSteps,
      );

    case 1:
      return `Patient requires total assistance for ${adlName.toLowerCase()}, scoring 1 on the FIM scale. Patient contributes less than 25% effort.`;

    default:
      return `Patient assessment for ${adlName.toLowerCase()}.`;
  }
}

/**
 * Generate Score 6 (Modified Independence) note
 */
function generateScore6Note(
  adlName: string,
  reasons?: Score6Reason[],
): string {
  if (!reasons || reasons.length === 0) {
    return `Patient completes ${adlName.toLowerCase()} with modified independence, scoring 6 on the FIM scale.`;
  }

  const reasonTexts: Record<Score6Reason, string> = {
    assistiveDevice: "uses an assistive device",
    safetyConcerns: "requires safety awareness",
    extraTime: "takes extra time to complete the task",
  };

  const reasonList = reasons.map((r) => reasonTexts[r]).join(", ");

  return `Patient completes ${adlName.toLowerCase()} with modified independence, scoring 6 on the FIM scale. Patient ${reasonList}.`;
}

/**
 * Generate Score 5 (Supervision/Setup) note
 */
function generateScore5Note(adlName: string, types?: Score5Type[]): string {
  if (!types || types.length === 0) {
    return `Patient requires supervision or setup for ${adlName.toLowerCase()}, scoring 5 on the FIM scale. Helper provides non-physical assistance.`;
  }

  const typeTexts: Record<Score5Type, string> = {
    standby: "standby assistance (watching for safety)",
    cueing: "verbal cueing",
    coaxing: "coaxing and encouragement",
    setup: "setup of items or devices",
  };

  const typeList = types.map((t) => typeTexts[t]).join(", ");

  return `Patient requires ${typeList} for ${adlName.toLowerCase()}, scoring 5 on the FIM scale. Helper provides non-physical assistance only.`;
}

/**
 * Generate physical assistance note (Scores 4, 3, 2)
 */
function generatePhysicalAssistanceNote(
  adlName: string,
  score: 4 | 3 | 2,
  percentage: number,
  completedSteps: string[],
  totalSteps: ADLStep[],
): string {
  const levelName = getAssistanceLevelName(score).toLowerCase();

  // Get completed and incomplete steps
  const completed = totalSteps.filter((step) =>
    completedSteps.includes(step.id),
  );
  const incomplete = totalSteps.filter(
    (step) => !completedSteps.includes(step.id),
  );

  const completedNames = completed.map((s) => s.name.toLowerCase()).join(", ");
  const incompleteNames = incomplete
    .map((s) => s.name.toLowerCase())
    .join(", ");

  let note = `Patient requires ${levelName} (${percentage}% effort) for ${adlName.toLowerCase()}, scoring ${score} on the FIM scale.`;

  // Add step details
  if (completed.length > 0 && incomplete.length > 0) {
    note += ` Patient independently completes ${completed.length} of ${totalSteps.length} steps: ${completedNames}.`;

    if (score === 2) {
      note += ` Helper performs majority of task.`;
    } else {
      note += ` Helper assists with ${incompleteNames}.`;
    }
  } else if (completed.length > 0) {
    note += ` Patient independently completes: ${completedNames}.`;
  } else if (incomplete.length > 0) {
    note += ` Helper assists with all steps.`;
  }

  return note;
}

/**
 * Get a list of Score 6 reason display names
 */
export function getScore6ReasonNames(reasons?: Score6Reason[]): string[] {
  if (!reasons) return [];

  const nameMap: Record<Score6Reason, string> = {
    assistiveDevice: "Assistive Device",
    safetyConcerns: "Safety Concerns",
    extraTime: "Extra Time",
  };

  return reasons.map((r) => nameMap[r]);
}

/**
 * Get a list of Score 5 type display names
 */
export function getScore5TypeNames(types?: Score5Type[]): string[] {
  if (!types) return [];

  const nameMap: Record<Score5Type, string> = {
    standby: "Standby",
    cueing: "Cueing",
    coaxing: "Coaxing",
    setup: "Setup",
  };

  return types.map((t) => nameMap[t]);
}
