export type Patient = {
  id: string;
  fullName: string;

  age?: number;
  room?: string;
  diagnosis?: string;
  precautions?: string; // free text

  dischargeDate?: string; // "YYYY-MM-DD" optional

  notes?: string;

  labelIds?: string[]; // Array of Label IDs for custom categorization

  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};

// Custom labels for patient categorization
export type Label = {
  id: string;
  name: string;
  color: string; // Color ID from LABEL_COLORS (e.g., "red", "blue")
  createdAt: string;
  updatedAt: string;
};

// ADL Types - 11 Motor ADLs
export type ADLType =
  // Self-Care (6)
  | "eating"
  | "grooming"
  | "bathing"
  | "dressingUpper"
  | "dressingLower"
  | "toileting"
  // Transfers (3)
  | "transferBedChair"
  | "transferToilet"
  | "transferBathShower"
  // Locomotion (1)
  | "locomotionWalkWheelchair";

export type AssistanceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Score 6 - Modified Independence reasons
export type Score6Reason = "assistiveDevice" | "safetyConcerns" | "extraTime";

// Score 5 - Setup/Supervision types
export type Score5Type = "standby" | "cueing" | "coaxing" | "setup";

// PatientADL - an ADL being tracked for a patient
export type PatientADL = {
  id: string; // UUID generated client-side
  patientId: string;
  adlType: ADLType;

  // For variable-step ADLs (dressing): which items apply
  selectedOptions?: string[]; // e.g., ['tshirt', 'bra']

  // Admission baseline
  admissionScore: number; // 1-7
  admissionDate: string;
  admissionStepsCompleted: string[]; // step IDs
  admissionAssistanceLevel: AssistanceLevel;
  admissionScore6Reasons?: Score6Reason[]; // if score 6
  admissionScore5Types?: Score5Type[]; // if score 5

  // Current/latest state
  currentScore: number; // 1-7
  currentStepsCompleted: string[];
  currentAssistanceLevel: AssistanceLevel;
  currentScore6Reasons?: Score6Reason[]; // if score 6: why modified independence?
  currentScore5Types?: Score5Type[]; // if score 5: what type of supervision?
  lastAssessmentDate: string;

  // Goal
  goalScore?: number; // 1-7 target

  createdAt: string;
  updatedAt: string;
};

// Assessment - historical record (optional, for tracking progress over time)
export type Assessment = {
  id: string;
  patientAdlId: string;
  score: number;
  stepsCompleted: string[];
  assistanceLevel: AssistanceLevel;
  score6Reasons?: Score6Reason[]; // if score 6
  score5Types?: Score5Type[]; // if score 5
  assessmentDate: string;
  notes?: string;
  createdAt: string;
};
