import Dexie, { type Table } from "dexie";
import type { Patient, PatientADL, Assessment } from "./types";

export class ADLTrackerDB extends Dexie {
  patients!: Table<Patient, string>;
  patientAdls!: Table<PatientADL, string>;
  assessments!: Table<Assessment, string>;

  constructor() {
    super("adl-tracker-db");

    this.version(1).stores({
      patients: "id, fullName, updatedAt, dischargeDate",
      patientAdls: "id, patientId, adlType, lastAssessmentDate",
      assessments: "id, patientAdlId, assessmentDate",
    });
  }
}

export const db = new ADLTrackerDB();
