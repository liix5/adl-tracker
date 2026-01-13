import { db } from "@/db";
import type { Patient } from "@/db/types";
import { v4 as uuidv4 } from "uuid";

const nowIso = () => new Date().toISOString();

export async function createPatient(input: {
  fullName: string;
  age?: number;
  room?: string;
  diagnosis?: string;
  precautions?: string;
  dischargeDate?: string; // optional
  notes?: string;
}) {
  const id = uuidv4();
  const now = nowIso();

  const dd = input.dischargeDate?.trim() || undefined;

  const patient: Patient = {
    id,
    fullName: input.fullName.trim(),
    age: input.age,
    room: input.room?.trim() || undefined,
    diagnosis: input.diagnosis?.trim() || undefined,
    precautions: input.precautions?.trim() || undefined,
    dischargeDate: dd,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  await db.patients.add(patient);
  return patient;
}

export async function updatePatient(id: string, patch: Partial<Patient>) {
  const nextPatch: Partial<Patient> = { ...patch, updatedAt: nowIso() };
  if ("dischargeDate" in patch) {
    nextPatch.dischargeDate = patch.dischargeDate?.trim() || undefined;
  }
  await db.patients.update(id, nextPatch);
}

export async function deletePatient(id: string) {
  await db.patients.delete(id);
}
