import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import * as React from "react";
import { db } from "@/db";
import type { ADLType, Score6Reason, Score5Type } from "@/db/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { ADL_DEFINITIONS } from "@/data/adl-definitions";
import { FollowUpQuestions } from "@/features/adl/components/FollowUpQuestions";
import { ADLStepsList } from "@/features/adl/components/ADLStepsList";
import { ADLConfigPanel } from "@/features/adl/components/ADLConfigPanel";
import { GoalSelector } from "@/features/adl/components/GoalSelector";
import { ADLCardSelector } from "@/features/adl/components/ADLCardSelector";
import { StickyScoreDisplay } from "@/features/adl/components/StickyScoreDisplay";
import { createPatientADL } from "@/features/adl/api";
import {
  getApplicableSteps,
  calculateScoreFromSteps,
} from "@/features/adl/scoring";

export const Route = createFileRoute("/patients/$patientId/adls/new")({
  component: AddADLPage,
});

function AddADLPage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();

  const patient = useLiveQuery(async () => {
    return await db.patients.get(patientId);
  }, [patientId]);

  const existingAdls = useLiveQuery(async () => {
    return await db.patientAdls.where("patientId").equals(patientId).toArray();
  }, [patientId]);

  const [selectedAdlType, setSelectedAdlType] = React.useState<ADLType | "">(
    "",
  );
  const [completedSteps, setCompletedSteps] = React.useState<string[]>([]);
  const [score6Reasons, setScore6Reasons] = React.useState<Score6Reason[]>([]);
  const [score5Types, setScore5Types] = React.useState<Score5Type[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [goalScore, setGoalScore] = React.useState<number | undefined>(
    undefined,
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [needsSupervision, setNeedsSupervision] = React.useState<
    boolean | undefined
  >(undefined);
  const [needsModifiers, setNeedsModifiers] = React.useState<
    boolean | undefined
  >(undefined);

  // Compute derived values before early returns so hooks stay unconditional
  const selectedAdlDefinition = selectedAdlType
    ? ADL_DEFINITIONS.find((d) => d.type === selectedAdlType)
    : null;

  const applicableSteps = selectedAdlDefinition
    ? getApplicableSteps(selectedAdlDefinition, selectedOptions)
    : [];

  const { score: assistanceLevel, percentage } = calculateScoreFromSteps({
    completedSteps,
    applicableSteps,
    needsSupervision,
    needsModifiers,
  });

  // Reset follow-up answers when percentage drops below 100 or ADL type changes
  const prevAdlTypeRef = React.useRef(selectedAdlType);
  const prevPercentageRef = React.useRef(percentage);
  React.useEffect(() => {
    const adlChanged = prevAdlTypeRef.current !== selectedAdlType;
    const droppedBelow100 =
      prevPercentageRef.current === 100 && percentage < 100;

    if (adlChanged || droppedBelow100) {
      setNeedsSupervision(undefined);
      setNeedsModifiers(undefined);
      setScore5Types([]);
      setScore6Reasons([]);
    }

    prevAdlTypeRef.current = selectedAdlType;
    prevPercentageRef.current = percentage;
  }, [selectedAdlType, percentage]);

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

  // Filter out already tracked ADLs
  const trackedTypes = new Set(existingAdls?.map((a) => a.adlType) ?? []);
  const availableAdls = ADL_DEFINITIONS.filter(
    (def) => !trackedTypes.has(def.type),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdlType) return;

    setIsSaving(true);
    try {
      await createPatientADL({
        patientId,
        adlType: selectedAdlType as ADLType,
        selectedOptions:
          selectedOptions.length > 0 ? selectedOptions : undefined,
        admissionScore: assistanceLevel,
        admissionStepsCompleted: completedSteps,
        admissionAssistanceLevel: assistanceLevel,
        admissionScore6Reasons:
          assistanceLevel === 6 ? score6Reasons : undefined,
        admissionScore5Types: assistanceLevel === 5 ? score5Types : undefined,
        goalScore: goalScore,
      });

      // Navigate to the new ADL assessment page
      navigate({
        to: "/patients/$patientId/adls/$adlType",
        params: { patientId, adlType: selectedAdlType as ADLType },
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (availableAdls.length === 0) {
    return (
      <div className="space-y-6">
        <Link to="/patients/$patientId" params={{ patientId }}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              All ADLs are already being tracked for this patient.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link to="/patients/$patientId" params={{ patientId }}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to {patient.fullName}
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add ADL</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select an ADL and record the admission baseline assessment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ADL Selection */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Select ADL</h2>
            <p className="text-sm text-muted-foreground">
              {availableAdls.length} available to track
            </p>
          </CardHeader>
          <CardContent>
            <ADLCardSelector
              availableAdls={availableAdls}
              selectedAdlType={selectedAdlType}
              onSelect={(adlType) => {
                setSelectedAdlType(adlType);
                setCompletedSteps([]);
                setSelectedOptions([]);
              }}
            />

            {selectedAdlDefinition && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {selectedAdlDefinition.description}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedAdlDefinition && (
          <>
            {/* Sticky Score Display */}
            {applicableSteps.length > 0 && (
              <StickyScoreDisplay
                score={assistanceLevel}
                percentage={percentage}
              />
            )}

            {/* Configuration (for dressing/grooming) */}
            {selectedAdlDefinition.configurableSteps && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Configuration</h2>
                </CardHeader>
                <CardContent>
                  <ADLConfigPanel
                    options={selectedAdlDefinition.configurableSteps.options}
                    selectedOptions={selectedOptions}
                    onChange={setSelectedOptions}
                    adlType={selectedAdlType as ADLType}
                  />
                </CardContent>
              </Card>
            )}

            {/* Steps Completed (primary input) */}
            {applicableSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Steps Completed</h2>
                      <p className="text-sm text-muted-foreground">
                        Check off steps the patient can complete independently
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCompletedSteps([])}
                        disabled={completedSteps.length === 0}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCompletedSteps(applicableSteps.map((s) => s.id))
                        }
                        disabled={
                          completedSteps.length === applicableSteps.length
                        }
                      >
                        All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ADLStepsList
                    steps={applicableSteps}
                    completedSteps={completedSteps}
                    onChange={setCompletedSteps}
                  />
                </CardContent>
              </Card>
            )}

            {/* Follow-up Questions (only at 100%, directly under steps) */}
            {selectedAdlType && (
              <FollowUpQuestions
                adlType={selectedAdlType as ADLType}
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
            )}

            {/* Goal */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Goal</h2>
                <p className="text-sm text-muted-foreground">
                  Set a target FIM score for discharge (optional)
                </p>
              </CardHeader>
              <CardContent>
                <GoalSelector
                  value={goalScore}
                  onChange={setGoalScore}
                  currentScore={assistanceLevel}
                  admissionScore={assistanceLevel}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Submit Button */}
        <div className="fixed bottom-0 z-20 left-0 right-0 border-t bg-background p-4 shadow-lg">
          <div className="mx-auto max-w-4xl">
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 text-base"
              disabled={!selectedAdlType || isSaving}
            >
              <Plus className="h-5 w-5" />
              {isSaving ? "Adding..." : "Add ADL"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
