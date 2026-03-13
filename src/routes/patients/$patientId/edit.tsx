import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import * as React from "react";
import { db } from "@/db";
import { updatePatient, deletePatient } from "@/features/patients/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export const Route = createFileRoute("/patients/$patientId/edit")({
  component: EditPatientPage,
});

function EditPatientPage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  console.log("EditPatientPage", patientId, "iam open ");

  const patient = useLiveQuery(async () => {
    return await db.patients.get(patientId);
  }, [patientId]);

  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [fullName, setFullName] = React.useState("");
  const [age, setAge] = React.useState<string>("");
  const [room, setRoom] = React.useState("");
  const [diagnosis, setDiagnosis] = React.useState("");
  const [precautions, setPrecautions] = React.useState("");
  const [dischargeDate, setDischargeDate] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Initialize form from patient data
  // We intentionally only depend on patient?.id to avoid resetting the form on every patient update
  React.useEffect(() => {
    if (patient) {
      setFullName(patient.fullName);
      setAge(patient.age?.toString() ?? "");
      setRoom(patient.room ?? "");
      setDiagnosis(patient.diagnosis ?? "");
      setPrecautions(patient.precautions ?? "");
      setDischargeDate(patient.dischargeDate ?? "");
      setNotes(patient.notes ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.id]);

  if (!patient) {
    return (
      <div className="space-y-4">
        <Link to="/patients/$patientId" params={{ patientId }}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Patient not found
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = fullName.trim();
    if (!name) return;

    const ageNum =
      age.trim() === "" ? undefined : Math.max(0, Math.min(120, Number(age)));

    setIsSaving(true);
    try {
      await updatePatient(patientId, {
        fullName: name,
        age: Number.isFinite(ageNum as number) ? ageNum : undefined,
        room: room.trim() || undefined,
        diagnosis: diagnosis.trim() || undefined,
        precautions: precautions.trim() || undefined,
        dischargeDate: dischargeDate.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // Navigate back to patient detail
      navigate({
        to: "/patients/$patientId",
        params: { patientId },
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deletePatient(patientId);
      navigate({ to: "/" });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/patients/$patientId" params={{ patientId }}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update patient information
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Patient Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Ahmed Alqahtani"
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

            <div className="flex items-center justify-end gap-2 pt-4">
              <Link to="/patients/$patientId" params={{ patientId }}>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSaving || !fullName.trim()}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <h2 className="text-lg font-semibold text-destructive">
            Danger Zone
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete this patient</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this patient and all their ADL data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Patient
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {patient.fullName}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this patient and all their ADL
                    tracking data including assessment history. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant={"destructive"}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
