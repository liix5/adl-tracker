import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScoreBadge } from "@/features/adl/components/ScoreDisplay";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Plus,
  BedDouble,
  Calendar,
  AlertTriangle,
  Edit,
  Activity,
} from "lucide-react";
import { ADL_DEFINITIONS } from "@/data/adl-definitions";
import type { ADLType, PatientADL, AssistanceLevel } from "@/db/types";

export const Route = createFileRoute("/patients/$patientId/")({
  component: PatientDetailPage,
});

function PatientDetailPage() {
  const { patientId } = Route.useParams();

  const patient = useLiveQuery(async () => {
    return await db.patients.get(patientId);
  }, [patientId]);

  const patientAdls = useLiveQuery(async () => {
    return await db.patientAdls.where("patientId").equals(patientId).toArray();
  }, [patientId]);

  if (!patient) {
    return (
      <div className="space-y-4">
        <Link to="/">
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

  const daysUntilDischarge = patient.dischargeDate
    ? calculateDaysUntil(patient.dischargeDate)
    : null;

  // Group ADLs by category
  const adlsByCategory = {
    selfCare: patientAdls?.filter((padl) => {
      const def = ADL_DEFINITIONS.find((d) => d.type === padl.adlType);
      return def?.category === "selfCare";
    }),
    transfers: patientAdls?.filter((padl) => {
      const def = ADL_DEFINITIONS.find((d) => d.type === padl.adlType);
      return def?.category === "transfers";
    }),
    locomotion: patientAdls?.filter((padl) => {
      const def = ADL_DEFINITIONS.find((d) => d.type === padl.adlType);
      return def?.category === "locomotion";
    }),
  };

  // Get available ADLs that haven't been added yet
  const trackedTypes = new Set(patientAdls?.map((a) => a.adlType) ?? []);
  const availableAdls = ADL_DEFINITIONS.filter(
    (def) => !trackedTypes.has(def.type)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {patient.fullName}
                </h1>
                <Link
                  to="/patients/$patientId/edit"
                  params={{ patientId: patient.id }}
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {patient.room && (
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="h-4 w-4" />
                    Room {patient.room}
                  </span>
                )}
                {typeof patient.age === "number" && (
                  <span>• {patient.age} years old</span>
                )}
              </div>

              {patient.diagnosis && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Diagnosis:</span>{" "}
                  {patient.diagnosis}
                </div>
              )}

              {patient.precautions && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border-l-4 border-orange-500 bg-orange-50 px-3 py-2 text-sm dark:bg-orange-950/30">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                  <div>
                    <span className="font-semibold">Precautions:</span>{" "}
                    {patient.precautions}
                  </div>
                </div>
              )}

              {patient.dischargeDate && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Discharge:</span>
                  <span>{patient.dischargeDate}</span>
                  {daysUntilDischarge !== null && (
                    <span
                      className={
                        daysUntilDischarge < 0
                          ? "font-semibold text-red-600"
                          : daysUntilDischarge === 0
                            ? "font-semibold text-orange-600"
                            : "font-semibold text-primary"
                      }
                    >
                      ({daysUntilDischarge === 0
                        ? "Today"
                        : daysUntilDischarge < 0
                          ? `${Math.abs(daysUntilDischarge)} days overdue`
                          : `${daysUntilDischarge} day${daysUntilDischarge !== 1 ? "s" : ""}`}
                      )
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ADLs by Category */}
      <div className="space-y-6">
        {(adlsByCategory.selfCare?.length ?? 0) > 0 && (
          <ADLCategorySection
            title="Self-Care"
            adls={adlsByCategory.selfCare!}
            patientId={patientId}
          />
        )}

        {(adlsByCategory.transfers?.length ?? 0) > 0 && (
          <ADLCategorySection
            title="Transfers"
            adls={adlsByCategory.transfers!}
            patientId={patientId}
          />
        )}

        {(adlsByCategory.locomotion?.length ?? 0) > 0 && (
          <ADLCategorySection
            title="Locomotion"
            adls={adlsByCategory.locomotion!}
            patientId={patientId}
          />
        )}

        {/* Single Add ADL button */}
        {availableAdls.length > 0 && (
          <AddADLButton
            patientId={patientId}
            isEmpty={(patientAdls?.length ?? 0) === 0}
          />
        )}
      </div>
    </div>
  );
}

function ADLCategorySection({
  title,
  adls,
  patientId,
}: {
  title: string;
  adls: PatientADL[];
  patientId: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {adls.map((adl) => {
          const def = ADL_DEFINITIONS.find((d) => d.type === adl.adlType);
          if (!def) return null;

          const improvement = adl.currentScore - adl.admissionScore;
          const hasGoal = adl.goalScore !== undefined;
          const goalReached = hasGoal && adl.currentScore >= adl.goalScore!;
          const goalProgress = hasGoal
            ? Math.min(
                Math.round(
                  ((adl.currentScore - adl.admissionScore) /
                    (adl.goalScore! - adl.admissionScore)) *
                    100
                ),
                100
              )
            : 0;

          return (
            <Link
              key={adl.id}
              to="/patients/$patientId/adls/$adlType"
              params={{ patientId, adlType: adl.adlType as ADLType }}
            >
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{def.name}</h3>
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={adl.currentScore as AssistanceLevel} />
                      {hasGoal && !goalReached && (
                        <div className="text-xs text-muted-foreground">
                          → {adl.goalScore}
                        </div>
                      )}
                      {goalReached && (
                        <div className="text-xl">🎉</div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Admission: {adl.admissionScore}</span>
                    <span>•</span>
                    <span
                      className={
                        improvement > 0
                          ? "font-semibold text-green-600"
                          : improvement < 0
                            ? "font-semibold text-red-600"
                            : "font-semibold"
                      }
                    >
                      {improvement > 0 ? "+" : ""}
                      {improvement}
                    </span>
                  </div>

                  {hasGoal && (
                    <div className="space-y-1">
                      <Progress value={goalProgress} className="h-1.5" />
                      <div className="text-xs text-muted-foreground">
                        {goalReached
                          ? "Goal achieved!"
                          : `${goalProgress}% to goal`}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AddADLButton({
  patientId,
  isEmpty,
}: {
  patientId: string;
  isEmpty: boolean;
}) {
  if (isEmpty) {
    // Prominent empty state when no ADLs are tracked
    return (
      <Link to="/patients/$patientId/adls/new" params={{ patientId }}>
        <Card className="cursor-pointer border-2 border-dashed p-8 text-center transition-all hover:border-primary hover:bg-accent">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-primary/10 p-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Add Your First ADL</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start tracking activities of daily living for this patient
              </p>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Regular button when some ADLs exist
  return (
    <Link to="/patients/$patientId/adls/new" params={{ patientId }}>
      <Card className="flex min-h-[80px] cursor-pointer items-center justify-center border-2 border-dashed transition-all hover:border-primary hover:bg-accent">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add ADL</span>
        </div>
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
