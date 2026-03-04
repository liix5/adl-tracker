import { db } from "@/db";
import type { Label } from "@/db/types";
import { v4 as uuidv4 } from "uuid";

const nowIso = () => new Date().toISOString();

export async function createLabel(input: { name: string; color: string }) {
  const id = uuidv4();
  const now = nowIso();

  const label: Label = {
    id,
    name: input.name.trim(),
    color: input.color,
    createdAt: now,
    updatedAt: now,
  };

  await db.labels.add(label);
  return label;
}

export async function updateLabel(
  id: string,
  patch: { name?: string; color?: string }
) {
  const updates: Partial<Label> = { updatedAt: nowIso() };
  if (patch.name !== undefined) updates.name = patch.name.trim();
  if (patch.color !== undefined) updates.color = patch.color;

  await db.labels.update(id, updates);
}

export async function deleteLabel(id: string) {
  // Remove label from all patients that have it
  const patientsWithLabel = await db.patients
    .filter((p) => p.labelIds?.includes(id) ?? false)
    .toArray();

  await Promise.all(
    patientsWithLabel.map((p) =>
      db.patients.update(p.id, {
        labelIds: p.labelIds?.filter((lid) => lid !== id) ?? [],
        updatedAt: nowIso(),
      })
    )
  );

  // Delete the label
  await db.labels.delete(id);
}

export async function addLabelToPatient(patientId: string, labelId: string) {
  const patient = await db.patients.get(patientId);
  if (!patient) return;

  const currentLabels = patient.labelIds ?? [];
  if (currentLabels.includes(labelId)) return;

  await db.patients.update(patientId, {
    labelIds: [...currentLabels, labelId],
    updatedAt: nowIso(),
  });
}

export async function removeLabelFromPatient(
  patientId: string,
  labelId: string
) {
  const patient = await db.patients.get(patientId);
  if (!patient) return;

  await db.patients.update(patientId, {
    labelIds: (patient.labelIds ?? []).filter((lid) => lid !== labelId),
    updatedAt: nowIso(),
  });
}

export async function setPatientLabels(patientId: string, labelIds: string[]) {
  await db.patients.update(patientId, {
    labelIds,
    updatedAt: nowIso(),
  });
}
