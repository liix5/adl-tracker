import { db } from "@/db";
import type {
  PatientADL,
  Assessment,
  ADLType,
  AssistanceLevel,
  Score6Reason,
  Score5Type,
} from "@/db/types";
import { v4 as uuidv4 } from "uuid";

const nowIso = () => new Date().toISOString();

/**
 * Create a new PatientADL record (add ADL to patient's tracking)
 */
export async function createPatientADL(input: {
  patientId: string;
  adlType: ADLType;
  selectedOptions?: string[]; // For dressing ADLs
  admissionScore: number;
  admissionStepsCompleted: string[];
  admissionAssistanceLevel: AssistanceLevel;
  admissionScore6Reasons?: Score6Reason[];
  admissionScore5Types?: Score5Type[];
  goalScore?: number;
}): Promise<PatientADL> {
  const id = uuidv4();
  const now = nowIso();

  const patientAdl: PatientADL = {
    id,
    patientId: input.patientId,
    adlType: input.adlType,
    selectedOptions: input.selectedOptions,

    // Admission baseline
    admissionScore: input.admissionScore,
    admissionDate: now,
    admissionStepsCompleted: input.admissionStepsCompleted,
    admissionAssistanceLevel: input.admissionAssistanceLevel,
    admissionScore6Reasons: input.admissionScore6Reasons,
    admissionScore5Types: input.admissionScore5Types,

    // Current state (starts same as admission)
    currentScore: input.admissionScore,
    currentStepsCompleted: input.admissionStepsCompleted,
    currentAssistanceLevel: input.admissionAssistanceLevel,
    currentScore6Reasons: input.admissionScore6Reasons,
    currentScore5Types: input.admissionScore5Types,
    lastAssessmentDate: now,

    // Goal
    goalScore: input.goalScore,

    createdAt: now,
    updatedAt: now,
  };

  await db.patientAdls.add(patientAdl);

  // Create initial assessment record
  await createAssessment({
    patientAdlId: id,
    score: input.admissionScore,
    stepsCompleted: input.admissionStepsCompleted,
    assistanceLevel: input.admissionAssistanceLevel,
    score6Reasons: input.admissionScore6Reasons,
    score5Types: input.admissionScore5Types,
    assessmentDate: now,
    notes: "Initial admission baseline",
  });

  return patientAdl;
}

/**
 * Update a PatientADL's current assessment
 */
export async function updatePatientADLAssessment(
  id: string,
  update: {
    currentScore: number;
    currentStepsCompleted: string[];
    currentAssistanceLevel: AssistanceLevel;
    currentScore6Reasons?: Score6Reason[];
    currentScore5Types?: Score5Type[];
    notes?: string;
  },
): Promise<void> {
  const now = nowIso();

  await db.patientAdls.update(id, {
    currentScore: update.currentScore,
    currentStepsCompleted: update.currentStepsCompleted,
    currentAssistanceLevel: update.currentAssistanceLevel,
    currentScore6Reasons: update.currentScore6Reasons,
    currentScore5Types: update.currentScore5Types,
    lastAssessmentDate: now,
    updatedAt: now,
  });

  // Create historical assessment record
  const patientAdl = await db.patientAdls.get(id);
  if (patientAdl) {
    await createAssessment({
      patientAdlId: id,
      score: update.currentScore,
      stepsCompleted: update.currentStepsCompleted,
      assistanceLevel: update.currentAssistanceLevel,
      score6Reasons: update.currentScore6Reasons,
      score5Types: update.currentScore5Types,
      assessmentDate: now,
      notes: update.notes,
    });
  }
}

/**
 * Update PatientADL goal score
 */
export async function updatePatientADLGoal(
  id: string,
  goalScore?: number,
): Promise<void> {
  await db.patientAdls.update(id, {
    goalScore,
    updatedAt: nowIso(),
  });
}

/**
 * Update PatientADL selected options (for dressing)
 */
export async function updatePatientADLOptions(
  id: string,
  selectedOptions: string[],
): Promise<void> {
  await db.patientAdls.update(id, {
    selectedOptions,
    updatedAt: nowIso(),
  });
}

/**
 * Delete a PatientADL and all its assessments
 */
export async function deletePatientADL(id: string): Promise<void> {
  // Delete all associated assessments first
  const assessments = await db.assessments
    .where("patientAdlId")
    .equals(id)
    .toArray();
  await db.assessments.bulkDelete(assessments.map((a) => a.id));

  // Delete the PatientADL
  await db.patientAdls.delete(id);
}

/**
 * Get all PatientADLs for a patient
 */
export async function getPatientADLs(patientId: string): Promise<PatientADL[]> {
  return await db.patientAdls.where("patientId").equals(patientId).toArray();
}

/**
 * Get a single PatientADL by ID
 */
export async function getPatientADL(id: string): Promise<PatientADL | undefined> {
  return await db.patientAdls.get(id);
}

/**
 * Check if a patient already has a specific ADL type tracked
 */
export async function hasPatientADL(
  patientId: string,
  adlType: ADLType,
): Promise<boolean> {
  const existing = await db.patientAdls
    .where("[patientId+adlType]")
    .equals([patientId, adlType])
    .first();
  return !!existing;
}

// =============================================================================
// ASSESSMENT FUNCTIONS
// =============================================================================

/**
 * Create an assessment record
 */
export async function createAssessment(input: {
  patientAdlId: string;
  score: number;
  stepsCompleted: string[];
  assistanceLevel: AssistanceLevel;
  score6Reasons?: Score6Reason[];
  score5Types?: Score5Type[];
  assessmentDate: string;
  notes?: string;
}): Promise<Assessment> {
  const id = uuidv4();
  const now = nowIso();

  const assessment: Assessment = {
    id,
    patientAdlId: input.patientAdlId,
    score: input.score,
    stepsCompleted: input.stepsCompleted,
    assistanceLevel: input.assistanceLevel,
    score6Reasons: input.score6Reasons,
    score5Types: input.score5Types,
    assessmentDate: input.assessmentDate,
    notes: input.notes,
    createdAt: now,
  };

  await db.assessments.add(assessment);
  return assessment;
}

/**
 * Get all assessments for a PatientADL (for history/progress tracking)
 */
export async function getAssessments(
  patientAdlId: string,
): Promise<Assessment[]> {
  return await db.assessments
    .where("patientAdlId")
    .equals(patientAdlId)
    .sortBy("assessmentDate");
}

/**
 * Get the most recent assessment for a PatientADL
 */
export async function getLatestAssessment(
  patientAdlId: string,
): Promise<Assessment | undefined> {
  const assessments = await db.assessments
    .where("patientAdlId")
    .equals(patientAdlId)
    .reverse()
    .sortBy("assessmentDate");

  return assessments[0];
}

/**
 * Delete an assessment
 */
export async function deleteAssessment(id: string): Promise<void> {
  await db.assessments.delete(id);
}
