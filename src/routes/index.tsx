import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/db";
import type { Patient } from "@/db/types";
import { createPatient, deletePatient } from "@/features/patients/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Plus, BedDouble, Calendar, Trash2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: PatientsHome,
});

function PatientsHome() {
  const patients = useLiveQuery(async () => {
    const all = await db.patients.toArray();
    all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return all;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Tap a patient to view goals and ADL tracking.
          </p>
        </div>

        <AddPatientDialog />
      </div>

      {(patients?.length ?? 0) === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <div className="text-xl font-semibold">No patients yet</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first patient to start tracking goals.
          </p>
          <div className="mt-6">
            <AddPatientDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients!.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Card className="group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to="/patients/$patientId"
              params={{ patientId: patient.id }}
              className="block truncate text-lg font-semibold leading-tight hover:underline"
            >
              {patient.fullName}
            </Link>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {patient.room ? (
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="h-4 w-4" />
                  {patient.room}
                </span>
              ) : null}

              {typeof patient.age === "number" ? (
                <span>{patient.age} yrs</span>
              ) : null}

              {patient.dischargeDate ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {patient.dischargeDate}
                </span>
              ) : null}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={async () => {
              const ok = window.confirm(
                `Delete ${patient.fullName}? This cannot be undone.`
              );
              if (!ok) return;
              await deletePatient(patient.id);
            }}
            aria-label="Delete patient"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {patient.diagnosis ? (
          <div className="line-clamp-2 text-sm text-muted-foreground">
            {patient.diagnosis}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No diagnosis added
          </div>
        )}

        {/* Placeholder — next step we replace this with Goals progress */}
        <div className="mt-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Goals:</span>{" "}
          <span className="font-medium">—</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AddPatientDialog() {
  const [open, setOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [fullName, setFullName] = React.useState("");
  const [dischargeDate, setDischargeDate] = React.useState("");
  const [age, setAge] = React.useState<string>("");
  const [room, setRoom] = React.useState("");
  const [diagnosis, setDiagnosis] = React.useState("");
  const [precautions, setPrecautions] = React.useState("");
  const [notes, setNotes] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = fullName.trim();
    if (!name) return;

    const ageNum =
      age.trim() === "" ? undefined : Math.max(0, Math.min(120, Number(age)));

    setIsSaving(true);
    try {
      await createPatient({
        fullName: name,
        age: Number.isFinite(ageNum as number) ? ageNum : undefined,
        room,
        diagnosis,
        precautions,
        notes,
        dischargeDate,
      });

      setFullName("");
      setAge("");
      setRoom("");
      setDiagnosis("");
      setPrecautions("");
      setNotes("");
      setDischargeDate("");

      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New patient
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add patient</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Ahmed Alqahtani"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 58"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g., 7B-12"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dischargeDate">Discharge date</Label>
            <Input
              id="dischargeDate"
              type="date"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Short diagnosis line"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precautions">Precautions</Label>
            <Textarea
              id="precautions"
              value={precautions}
              onChange={(e) => setPrecautions(e.target.value)}
              placeholder="Free text (e.g., fall risk, NWB, spinal precautions...)"
              className="min-h-[84px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional quick notes"
              className="min-h-[84px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !fullName.trim()}>
              {isSaving ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
