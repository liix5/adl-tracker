import type { Patient, PatientADL, Assessment, Label } from "@/db/types";

export type ExportData = {
  version: number;
  exportedAt: string;
  appVersion: string;
  data: {
    labels: Label[];
    patients: Patient[];
    patientAdls: PatientADL[];
    assessments: Assessment[];
  };
};

export type ImportResult = {
  success: boolean;
  counts: {
    labels: number;
    patients: number;
    patientAdls: number;
    assessments: number;
  };
  errors?: string[];
};

export type ValidationError = {
  valid: false;
  error: string;
};

export type ValidationSuccess = {
  valid: true;
  data: ExportData;
};

export type ValidationResult = ValidationError | ValidationSuccess;
