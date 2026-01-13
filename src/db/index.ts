import Dexie, { type Table } from "dexie";
import type { Patient } from "./types";

export class ADLTrackerDB extends Dexie {
  patients!: Table<Patient, string>;

  constructor() {
    super("adl-tracker-db");

    this.version(1).stores({
      patients: "id, fullName, updatedAt, dischargeDate",
    });
  }
}

export const db = new ADLTrackerDB();
