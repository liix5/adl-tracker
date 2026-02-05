import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import * as React from "react";
import { db } from "@/db";
import type {
  Score6Reason,
  Score5Type,
  ADLType,
} from "@/db/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Save, AlertCircle, Pencil } from "lucide-react";
import { getADLDefinition } from "@/data/adl-definitions";
import { ScoreDisplay } from "@/features/adl/components/ScoreDisplay";
import { FollowUpQuestions } from "@/features/adl/components/FollowUpQuestions";
import { ADLStepsList } from "@/features/adl/components/ADLStepsList";
import { GoalProgress } from "@/features/adl/components/GoalProgress";
import { ADLConfigPanel } from "@/features/adl/components/ADLConfigPanel";
import { ProgressNote } from "@/features/adl/components/ProgressNote";
import { getApplicableSteps, calculateScoreFromSteps } from "@/features/adl/scoring";
import { generateProgressNote } from "@/features/adl/progress-note";
import { updatePatientADLAssessment } from "@/features/adl/api";

export const Route = createFileRoute("/patients/$patientId/adls/$adlType")({
  component: ADLAssessmentPage,
});

function ADLAssessmentPage() {
  const { patientId, adlType } = Route.useParams();

  const patient = useLiveQuery(async () => {
    return await db.patients.get(patientId);
  }, [patientId]);

  const patientAdl = useLiveQuery(async () => {
    const adls = await db.patientAdls
      .where("patientId")
      .equals(patientId)
      .toArray();
    return adls.find((a) => a.adlType === adlType);
  }, [patientId, adlType]);

  const adlDefinition = getADLDefinition(adlType as ADLType);

  // Edit mode toggle
  const [isEditing, setIsEditing] = React.useState(false);

  // Local state for current assessment (used in edit mode)
  const [completedSteps, setCompletedSteps] = React.useState<string[]>([]);
  const [score6Reasons, setScore6Reasons] = React.useState<Score6Reason[]>([]);
  const [score5Types, setScore5Types] = React.useState<Score5Type[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [needsSupervision, setNeedsSupervision] = React.useState<boolean | undefined>(undefined);
  const [needsModifiers, setNeedsModifiers] = React.useState<boolean | undefined>(undefined);

  // Initialize state from patientAdl
  React.useEffect(() => {
    if (patientAdl) {
      setCompletedSteps(patientAdl.currentStepsCompleted);
      setScore6Reasons(patientAdl.currentScore6Reasons ?? []);
      setScore5Types(patientAdl.currentScore5Types ?? []);
      setSelectedOptions(patientAdl.selectedOptions ?? []);

      // Derive follow-up answers from saved score (only for scores 5, 6, 7)
      if (patientAdl.currentAssistanceLevel === 5) {
        setNeedsSupervision(true);
        setNeedsModifiers(undefined);
      } else if (patientAdl.currentAssistanceLevel === 6) {
        setNeedsSupervision(false);
        setNeedsModifiers(true);
      } else if (patientAdl.currentAssistanceLevel === 7) {
        setNeedsSupervision(false);
        setNeedsModifiers(false);
      } else {
        // Scores 1-4 don't have follow-up answers
        setNeedsSupervision(undefined);
        setNeedsModifiers(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientAdl?.id]);

  // Compute derived values before early returns so hooks stay unconditional
  const applicableSteps = getApplicableSteps(adlDefinition, selectedOptions);

  const { score: editScore, percentage } = calculateScoreFromSteps({
    completedSteps,
    applicableSteps,
    needsSupervision,
    needsModifiers,
  });

  // Reset follow-up answers when percentage drops below 100
  const prevPercentageRef = React.useRef(percentage);
  React.useEffect(() => {
    const droppedBelow100 = prevPercentageRef.current === 100 && percentage < 100;

    if (droppedBelow100) {
      setNeedsSupervision(undefined);
      setNeedsModifiers(undefined);
      setScore5Types([]);
      setScore6Reasons([]);
    }

    prevPercentageRef.current = percentage;
  }, [percentage]);

  if (!patient || !patientAdl) {
    return (
      <div className="space-y-4">
        <Link
          to="/patients/$patientId"
          params={{ patientId }}
        >
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          {!patient ? "Patient not found" : "ADL not found"}
        </div>
      </div>
    );
  }

  // In view mode, use the saved score; in edit mode, use the derived score
  const displayScore = isEditing
    ? editScore
    : patientAdl.currentAssistanceLevel;

  const savedApplicableSteps = getApplicableSteps(adlDefinition, patientAdl.selectedOptions ?? []);
  const savedPercentage = isEditing
    ? percentage
    : Math.round(
        savedApplicableSteps.length > 0
          ? (patientAdl.currentStepsCompleted.length / savedApplicableSteps.length) * 100
          : 0,
      );

  const progressNote = generateProgressNote({
    adlName: adlDefinition.name,
    score: displayScore,
    percentage: savedPercentage,
    completedSteps: isEditing ? completedSteps : patientAdl.currentStepsCompleted,
    totalSteps: isEditing ? applicableSteps : savedApplicableSteps,
    score6Reasons: displayScore === 6 ? (isEditing ? score6Reasons : patientAdl.currentScore6Reasons) : undefined,
    score5Types: displayScore === 5 ? (isEditing ? score5Types : patientAdl.currentScore5Types) : undefined,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePatientADLAssessment(patientAdl.id, {
        currentScore: editScore,
        currentStepsCompleted: completedSteps,
        currentAssistanceLevel: editScore,
        currentScore6Reasons: editScore === 6 ? score6Reasons : undefined,
        currentScore5Types: editScore === 5 ? score5Types : undefined,
      });

      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset local state back to saved values
    setCompletedSteps(patientAdl.currentStepsCompleted);
    setScore6Reasons(patientAdl.currentScore6Reasons ?? []);
    setScore5Types(patientAdl.currentScore5Types ?? []);
    setSelectedOptions(patientAdl.selectedOptions ?? []);
    setNeedsSupervision(undefined);
    setNeedsModifiers(undefined);
    setIsEditing(false);
  };

  return (
    <div className={`space-y-6 ${isEditing ? "pb-20" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/patients/$patientId"
          params={{ patientId }}
        >
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to {patient.fullName}
          </Button>
        </Link>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {adlDefinition.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {adlDefinition.description}
        </p>
      </div>

      {/* Current Score Display */}
      <ScoreDisplay score={displayScore} />

      {/* Edit mode: Steps, follow-ups, config */}
      {isEditing ? (
        <>
          {/* Garment Configuration (for dressing ADLs) */}
          {adlDefinition.configurableSteps && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Configuration</h2>
              </CardHeader>
              <CardContent>
                <ADLConfigPanel
                  options={adlDefinition.configurableSteps.options}
                  selectedOptions={selectedOptions}
                  onChange={setSelectedOptions}
                  adlType={adlType as ADLType}
                />
              </CardContent>
            </Card>
          )}

          {/* Steps Completed */}
          {applicableSteps.length > 0 ? (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Steps Completed</h2>
                <p className="text-sm text-muted-foreground">
                  Check off each step the patient completes independently
                </p>
              </CardHeader>
              <CardContent>
                <ADLStepsList
                  steps={applicableSteps}
                  completedSteps={completedSteps}
                  onChange={setCompletedSteps}
                />
              </CardContent>
            </Card>
          ) : (
            adlDefinition.configurableSteps && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                    <p>
                      Please configure which garments the patient is wearing above to
                      see the applicable steps.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* Follow-up Questions (only at 100%, directly under steps) */}
          <FollowUpQuestions
            adlType={adlType as ADLType}
            percentage={percentage}
            needsSupervision={needsSupervision}
            onNeedsSupervisionChange={setNeedsSupervision}
            needsModifiers={needsModifiers}
            onNeedsModifiersChange={setNeedsModifiers}
            score5Types={score5Types}
            onScore5TypesChange={setScore5Types}
            score6Reasons={score6Reasons}
            onScore6ReasonsChange={setScore6Reasons}
          />
        </>
      ) : (
        /* View mode: Update button */
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 text-base"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-5 w-5" />
          Update ADL Score
        </Button>
      )}

      {/* Goal Progress */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Goal Progress</h2>
        </CardHeader>
        <CardContent>
          <GoalProgress
            admissionScore={patientAdl.admissionScore}
            currentScore={displayScore}
            goalScore={patientAdl.goalScore}
          />
        </CardContent>
      </Card>

      {/* Progress Note */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Clinical Progress Note</h2>
        </CardHeader>
        <CardContent>
          <ProgressNote note={progressNote} />
        </CardContent>
      </Card>

      {/* Fixed Save/Cancel Buttons (edit mode only) */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 shadow-lg">
          <div className="mx-auto flex max-w-4xl gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 text-base"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1 gap-2 text-base"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-5 w-5" />
              {isSaving ? "Saving..." : "Save Score"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
