import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/db";
import type { Patient, Label } from "@/db/types";
import { createPatient, deletePatient } from "@/features/patients/api";
import { getLabelColor, isPresetColor } from "@/features/labels/constants";
import { LabelBadge } from "@/features/labels/components/LabelBadge";
import { LabelAssignDialog } from "@/features/labels/components/LabelAssignDialog";
import { LabelManagerDialog } from "@/features/labels/components/LabelManagerDialog";

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
import { Label as FormLabel } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

import {
  Plus,
  BedDouble,
  Calendar,
  Trash2,
  Target,
  Search,
  Settings,
  Tag,
  X,
  Pencil,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: PatientsHome,
});

function PatientsHome() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLabelId, setSelectedLabelId] = React.useState<string | null>(
    null,
  );
  const [labelManagerOpen, setLabelManagerOpen] = React.useState(false);

  const patients = useLiveQuery(async () => {
    const all = await db.patients.toArray();
    all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return all;
  }, []);

  const labels = useLiveQuery(() => db.labels.toArray(), []);

  // Filter patients by search and label
  const filteredPatients = React.useMemo(() => {
    if (!patients) return [];

    let result = patients;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query) ||
          p.room?.toLowerCase().includes(query) ||
          p.diagnosis?.toLowerCase().includes(query),
      );
    }

    // Filter by label
    if (selectedLabelId) {
      result = result.filter((p) => p.labelIds?.includes(selectedLabelId));
    }

    return result;
  }, [patients, searchQuery, selectedLabelId]);

  // Count patients per label
  const labelCounts = React.useMemo(() => {
    if (!patients || !labels) return {};
    const counts: Record<string, number> = {};
    labels.forEach((label) => {
      counts[label.id] = patients.filter((p) =>
        p.labelIds?.includes(label.id),
      ).length;
    });
    return counts;
  }, [patients, labels]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FIM Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track patient functional independence and ADL progress
          </p>
        </div>

        <AddPatientDialog />
      </div>

      {/* Search and Filters */}
      {(patients?.length ?? 0) > 0 && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Label Filters */}
          <div className="flex items-center gap-2 overflow-x-auto  p-4 pb-1">
            {/* All button */}
            <Button
              variant={selectedLabelId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabelId(null)}
              className="shrink-0"
            >
              All
              <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">
                {patients?.length ?? 0}
              </span>
            </Button>

            {/* Label filter chips */}
            {labels?.map((label) => {
              const color = getLabelColor(label.color);
              const isSelected = selectedLabelId === label.id;
              const count = labelCounts[label.id] ?? 0;
              const isCustom = !isPresetColor(label.color);

              // Custom colors use inline styles
              const customStyle = isCustom
                ? {
                    backgroundColor: `${color.hex}20`,
                    color: color.hex,
                    borderColor: isSelected ? color.hex : `${color.hex}40`,
                  }
                : undefined;

              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() =>
                    setSelectedLabelId(isSelected ? null : label.id)
                  }
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    isCustom
                      ? `border ${isSelected ? "ring-2 ring-offset-2" : "opacity-70 hover:opacity-100"}`
                      : isSelected
                        ? `${color.classes} ring-2 ring-offset-2 ring-current`
                        : `${color.classes} opacity-70 hover:opacity-100`
                  }`}
                  style={
                    isCustom
                      ? {
                          ...customStyle,
                          ...(isSelected
                            ? { ["--tw-ring-color" as string]: color.hex }
                            : {}),
                        }
                      : undefined
                  }
                >
                  {label.name}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      isSelected
                        ? "bg-black/10 dark:bg-white/10"
                        : "bg-black/5 dark:bg-white/5"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Manage labels button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLabelManagerOpen(true)}
              className="shrink-0 gap-1.5 text-muted-foreground"
            >
              <Settings className="h-4 w-4" />
              Labels
            </Button>
          </div>
        </div>
      )}

      {/* Patients Grid */}
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
      ) : filteredPatients.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-xl font-semibold">No matching patients</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setSelectedLabelId(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((p) => (
            <PatientCard key={p.id} patient={p} labels={labels ?? []} />
          ))}
        </div>
      )}

      {/* Label Manager Dialog */}
      <LabelManagerDialog
        open={labelManagerOpen}
        onOpenChange={setLabelManagerOpen}
      />
    </div>
  );
}

function PatientCard({
  patient,
  labels,
}: {
  patient: Patient;
  labels: Label[];
}) {
  const [labelDialogOpen, setLabelDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Get ADL goals for this patient
  const patientAdls = useLiveQuery(async () => {
    return await db.patientAdls.where("patientId").equals(patient.id).toArray();
  }, [patient.id]);

  const totalAdls = patientAdls?.length ?? 0;
  const goalsReached =
    patientAdls?.filter(
      (adl) => adl.goalScore && adl.currentScore >= adl.goalScore,
    ).length ?? 0;
  const progressPercentage =
    totalAdls > 0 ? Math.round((goalsReached / totalAdls) * 100) : 0;

  // Calculate days until discharge
  const daysUntilDischarge = patient.dischargeDate
    ? calculateDaysUntil(patient.dischargeDate)
    : null;

  // Get patient's labels
  const patientLabels = labels.filter((l) => patient.labelIds?.includes(l.id));

  return (
    <>
      <Link to="/patients/$patientId" params={{ patientId: patient.id }}>
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* Labels row - tappable to edit */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLabelDialogOpen(true);
                  }}
                  className="mb-1.5 flex flex-wrap items-center gap-1.5 rounded-md transition-colors hover:bg-muted/50 -ml-1 px-1 py-0.5"
                  aria-label={
                    patientLabels.length > 0 ? "Edit labels" : "Add label"
                  }
                >
                  {patientLabels.length > 0 ? (
                    <>
                      {patientLabels.map((label) => (
                        <LabelBadge key={label.id} label={label} size="sm" />
                      ))}
                      <span className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground">
                        <Pencil className="h-3 w-3" />
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      Add label
                    </span>
                  )}
                </button>

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
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
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
                        {daysUntilDischarge} day
                        {daysUntilDischarge !== 1 ? "s" : ""}
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

      {/* Label Assignment Dialog */}
      <LabelAssignDialog
        patientId={patient.id}
        patientName={patient.fullName}
        currentLabelIds={patient.labelIds ?? []}
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className=" gap-3">
          <DialogHeader className="t">
            <DialogTitle className=" text-2xl">
              Delete {patient.fullName}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete this patient and all their ADL tracking
            data. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await deletePatient(patient.id);
                  setDeleteDialogOpen(false);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
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
            <FormLabel htmlFor="fullName">Full name *</FormLabel>
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
              <FormLabel htmlFor="age">Age</FormLabel>
              <Input
                id="age"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 58"
              />
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="room">Room</FormLabel>
              <Input
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g., 7B-12"
              />
            </div>
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="dischargeDate">Discharge date</FormLabel>
            <Input
              id="dischargeDate"
              type="date"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="diagnosis">Diagnosis</FormLabel>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Short diagnosis line"
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="precautions">Precautions</FormLabel>
            <Textarea
              id="precautions"
              value={precautions}
              onChange={(e) => setPrecautions(e.target.value)}
              placeholder="Free text (e.g., fall risk, NWB, spinal precautions...)"
              className="min-h-[84px]"
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="notes">Notes</FormLabel>
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
