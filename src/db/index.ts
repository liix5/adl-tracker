import Dexie, { type Table } from "dexie";
import type { Patient, PatientADL, Assessment, Label } from "./types";

export class ADLTrackerDB extends Dexie {
  patients!: Table<Patient, string>;
  patientAdls!: Table<PatientADL, string>;
  assessments!: Table<Assessment, string>;
  labels!: Table<Label, string>;

  constructor() {
    super("adl-tracker-db");

    this.version(1).stores({
      patients: "id, fullName, updatedAt, dischargeDate",
      patientAdls: "id, patientId, adlType, lastAssessmentDate",
      assessments: "id, patientAdlId, assessmentDate",
    });

    // Version 2: Add labels table and labelIds multi-entry index
    this.version(2).stores({
      patients: "id, fullName, updatedAt, dischargeDate, *labelIds",
      patientAdls: "id, patientId, adlType, lastAssessmentDate",
      assessments: "id, patientAdlId, assessmentDate",
      labels: "id, name, color",
    });
  }
}

export const db = new ADLTrackerDB();
