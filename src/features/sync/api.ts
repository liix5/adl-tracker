import { db } from "@/db";
import type {
  ExportData,
  ImportResult,
  ValidationResult,
} from "./types";

const CURRENT_VERSION = 1;
const APP_VERSION = "1.0.0";

/**
 * Export all data as JSON
 */
export async function exportAllData(): Promise<ExportData> {
  const [labels, patients, patientAdls, assessments] = await Promise.all([
    db.labels.toArray(),
    db.patients.toArray(),
    db.patientAdls.toArray(),
    db.assessments.toArray(),
  ]);

  return {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    data: {
      labels,
      patients,
      patientAdls,
      assessments,
    },
  };
}

/**
 * Get data summary counts
 */
export async function getDataSummary(): Promise<{
  labels: number;
  patients: number;
  patientAdls: number;
  assessments: number;
}> {
  const [labels, patients, patientAdls, assessments] = await Promise.all([
    db.labels.count(),
    db.patients.count(),
    db.patientAdls.count(),
    db.assessments.count(),
  ]);

  return { labels, patients, patientAdls, assessments };
}

/**
 * Import with replace (wipe existing, import fresh)
 */
export async function importDataReplace(
  data: ExportData,
): Promise<ImportResult> {
  try {
    await db.transaction(
      "rw",
      [db.labels, db.patients, db.patientAdls, db.assessments],
      async () => {
        // Clear all existing data
        await db.labels.clear();
        await db.patients.clear();
        await db.patientAdls.clear();
        await db.assessments.clear();

        // Import all data
        if (data.data.labels.length > 0) {
          await db.labels.bulkAdd(data.data.labels);
        }
        if (data.data.patients.length > 0) {
          await db.patients.bulkAdd(data.data.patients);
        }
        if (data.data.patientAdls.length > 0) {
          await db.patientAdls.bulkAdd(data.data.patientAdls);
        }
        if (data.data.assessments.length > 0) {
          await db.assessments.bulkAdd(data.data.assessments);
        }
      },
    );

    return {
      success: true,
      counts: {
        labels: data.data.labels.length,
        patients: data.data.patients.length,
        patientAdls: data.data.patientAdls.length,
        assessments: data.data.assessments.length,
      },
    };
  } catch (err) {
    return {
      success: false,
      counts: { labels: 0, patients: 0, patientAdls: 0, assessments: 0 },
      errors: [(err as Error).message],
    };
  }
}

/**
 * Import with merge (keep existing, add/update by ID)
 */
export async function importDataMerge(data: ExportData): Promise<ImportResult> {
  const counts = { labels: 0, patients: 0, patientAdls: 0, assessments: 0 };
  const errors: string[] = [];

  try {
    await db.transaction(
      "rw",
      [db.labels, db.patients, db.patientAdls, db.assessments],
      async () => {
        // Merge labels
        for (const label of data.data.labels) {
          const existing = await db.labels.get(label.id);
          if (existing) {
            // Update if import is newer
            if (label.updatedAt > existing.updatedAt) {
              await db.labels.put(label);
              counts.labels++;
            }
          } else {
            await db.labels.add(label);
            counts.labels++;
          }
        }

        // Merge patients
        for (const patient of data.data.patients) {
          const existing = await db.patients.get(patient.id);
          if (existing) {
            // Update if import is newer
            if (patient.updatedAt > existing.updatedAt) {
              await db.patients.put(patient);
              counts.patients++;
            }
          } else {
            await db.patients.add(patient);
            counts.patients++;
          }
        }

        // Merge patientAdls
        for (const adl of data.data.patientAdls) {
          const existing = await db.patientAdls.get(adl.id);
          if (existing) {
            // Update if import is newer
            if (adl.updatedAt > existing.updatedAt) {
              await db.patientAdls.put(adl);
              counts.patientAdls++;
            }
          } else {
            await db.patientAdls.add(adl);
            counts.patientAdls++;
          }
        }

        // Merge assessments (no updatedAt, use createdAt)
        for (const assessment of data.data.assessments) {
          const existing = await db.assessments.get(assessment.id);
          if (!existing) {
            await db.assessments.add(assessment);
            counts.assessments++;
          }
        }
      },
    );

    return {
      success: true,
      counts,
    };
  } catch (err) {
    errors.push((err as Error).message);
    return {
      success: false,
      counts,
      errors,
    };
  }
}

/**
 * Validate import data structure
 */
export function validateImportData(data: unknown): ValidationResult {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid file format: not an object" };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== "number") {
    return { valid: false, error: "Missing or invalid version number" };
  }

  if (obj.version > CURRENT_VERSION) {
    return {
      valid: false,
      error: `File version ${obj.version} is newer than supported version ${CURRENT_VERSION}`,
    };
  }

  if (!obj.data || typeof obj.data !== "object") {
    return { valid: false, error: "Missing data object" };
  }

  const dataObj = obj.data as Record<string, unknown>;

  if (!Array.isArray(dataObj.labels)) {
    return { valid: false, error: "Missing or invalid labels array" };
  }
  if (!Array.isArray(dataObj.patients)) {
    return { valid: false, error: "Missing or invalid patients array" };
  }
  if (!Array.isArray(dataObj.patientAdls)) {
    return { valid: false, error: "Missing or invalid patientAdls array" };
  }
  if (!Array.isArray(dataObj.assessments)) {
    return { valid: false, error: "Missing or invalid assessments array" };
  }

  // Validate required fields on patients
  for (const patient of dataObj.patients) {
    if (
      typeof patient !== "object" ||
      !patient ||
      typeof (patient as Record<string, unknown>).id !== "string" ||
      typeof (patient as Record<string, unknown>).fullName !== "string"
    ) {
      return { valid: false, error: "Invalid patient data structure" };
    }
  }

  return { valid: true, data: obj as ExportData };
}
