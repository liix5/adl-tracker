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
import { Progress } from "@/components/ui/progress";

import { Plus, BedDouble, Calendar, Trash2, Target } from "lucide-react";

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
          <h1 className="text-3xl font-bold tracking-tight">FIM Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track patient functional independence and ADL progress
          </p>
        </div>

        <AddPatientDialog />
      </div>

      {(patients?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div className="text-xl font-semibold">No patients yet</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first patient to start tracking FIM goals
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
  // Get ADL goals for this patient
  const patientAdls = useLiveQuery(
    async () => {
      return await db.patientAdls
        .where("patientId")
        .equals(patient.id)
        .toArray();
    },
    [patient.id]
  );

  const totalAdls = patientAdls?.length ?? 0;
  const goalsReached =
    patientAdls?.filter(
      (adl) => adl.goalScore && adl.currentScore >= adl.goalScore
    ).length ?? 0;
  const progressPercentage =
    totalAdls > 0 ? Math.round((goalsReached / totalAdls) * 100) : 0;

  // Calculate days until discharge
  const daysUntilDischarge = patient.dischargeDate
    ? calculateDaysUntil(patient.dischargeDate)
    : null;

  return (
    <Link to="/patients/$patientId" params={{ patientId: patient.id }}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold leading-tight group-hover:text-primary">
                {patient.fullName}
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {patient.room && (
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="h-4 w-4" />
                    Room {patient.room}
                  </span>
                )}

                {typeof patient.age === "number" && (
                  <span>• {patient.age} yrs</span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
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

        <CardContent className="space-y-3">
          {patient.diagnosis && (
            <div className="line-clamp-2 text-sm text-muted-foreground">
              {patient.diagnosis}
            </div>
          )}

          {/* Goal Progress */}
          {totalAdls > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  Goals Progress
                </span>
                <span className="font-semibold">
                  {goalsReached}/{totalAdls}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-center text-sm text-muted-foreground">
              No ADLs tracked yet
            </div>
          )}

          {/* Discharge Date */}
          {patient.dischargeDate && (
            <div className="flex items-center justify-between rounded-lg border-l-4 border-primary bg-primary/5 px-3 py-2 text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-4 w-4" />
                Discharge
              </span>
              <span className="font-semibold">
                {daysUntilDischarge !== null ? (
                  daysUntilDischarge === 0 ? (
                    <span className="text-orange-600">Today</span>
                  ) : daysUntilDischarge < 0 ? (
                    <span className="text-red-600">
                      {Math.abs(daysUntilDischarge)} days overdue
                    </span>
                  ) : (
                    <span className="text-primary">
                      {daysUntilDischarge} day{daysUntilDischarge !== 1 ? "s" : ""}
                    </span>
                  )
                ) : (
                  patient.dischargeDate
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function calculateDaysUntil(dateString: string): number | null {
  try {
    const discharge = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    discharge.setHours(0, 0, 0, 0);
    const diffTime = discharge.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
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
