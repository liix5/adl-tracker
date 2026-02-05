import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import * as React from "react";
import { db } from "@/db";
import type { ADLType, Score6Reason, Score5Type } from "@/db/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";
import { ADL_DEFINITIONS, getADLsByCategory } from "@/data/adl-definitions";
import { ScoreDisplay } from "@/features/adl/components/ScoreDisplay";
import { FollowUpQuestions } from "@/features/adl/components/FollowUpQuestions";
import { ADLStepsList } from "@/features/adl/components/ADLStepsList";
import { ADLConfigPanel } from "@/features/adl/components/ADLConfigPanel";
import { createPatientADL } from "@/features/adl/api";
import { getApplicableSteps, calculateScoreFromSteps } from "@/features/adl/scoring";

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

  const [selectedAdlType, setSelectedAdlType] = React.useState<ADLType | "">("");
  const [completedSteps, setCompletedSteps] = React.useState<string[]>([]);
  const [score6Reasons, setScore6Reasons] = React.useState<Score6Reason[]>([]);
  const [score5Types, setScore5Types] = React.useState<Score5Type[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [goalScore, setGoalScore] = React.useState<string>("none");
  const [isSaving, setIsSaving] = React.useState(false);
  const [needsSupervision, setNeedsSupervision] = React.useState<boolean | undefined>(undefined);
  const [needsModifiers, setNeedsModifiers] = React.useState<boolean | undefined>(undefined);

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
    const droppedBelow100 = prevPercentageRef.current === 100 && percentage < 100;

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
    (def) => !trackedTypes.has(def.type)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdlType) return;

    setIsSaving(true);
    try {
      await createPatientADL({
        patientId,
        adlType: selectedAdlType as ADLType,
        selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
        admissionScore: assistanceLevel,
        admissionStepsCompleted: completedSteps,
        admissionAssistanceLevel: assistanceLevel,
        admissionScore6Reasons: assistanceLevel === 6 ? score6Reasons : undefined,
        admissionScore5Types: assistanceLevel === 5 ? score5Types : undefined,
        goalScore: goalScore && goalScore !== "none" ? Number(goalScore) : undefined,
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
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="adlType">ADL Type *</Label>
              <Select
                value={selectedAdlType}
                onValueChange={(value) => {
                  setSelectedAdlType(value as ADLType);
                  setCompletedSteps([]);
                  setSelectedOptions([]);
                }}
              >
                <SelectTrigger id="adlType">
                  <SelectValue placeholder="Choose an ADL to track" />
                </SelectTrigger>
                <SelectContent>
                  {["selfCare", "transfers", "locomotion"].map((category) => {
                    const categoryAdls = getADLsByCategory(
                      category as "selfCare" | "transfers" | "locomotion"
                    ).filter((def) => availableAdls.some((a) => a.type === def.type));

                    if (categoryAdls.length === 0) return null;

                    return (
                      <React.Fragment key={category}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {category === "selfCare"
                            ? "Self-Care"
                            : category === "transfers"
                              ? "Transfers"
                              : "Locomotion"}
                        </div>
                        {categoryAdls.map((def) => (
                          <SelectItem key={def.type} value={def.type}>
                            {def.name}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedAdlDefinition && (
              <div className="mt-3 text-sm text-muted-foreground">
                {selectedAdlDefinition.description}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedAdlDefinition && (
          <>
            {/* Configuration (for dressing) */}
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
                  <h2 className="text-lg font-semibold">Steps Completed</h2>
                  <p className="text-sm text-muted-foreground">
                    Check off steps the patient can complete independently
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

            {/* Calculated Score Display */}
            {applicableSteps.length > 0 && (
              <ScoreDisplay score={assistanceLevel} />
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
                <div className="space-y-2">
                  <Label htmlFor="goalScore">Target Score</Label>
                  <Select value={goalScore} onValueChange={setGoalScore}>
                    <SelectTrigger id="goalScore">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No goal set</SelectItem>
                      {[7, 6, 5, 4, 3, 2, 1].map((score) => (
                        <SelectItem key={score} value={score.toString()}>
                          {score}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 shadow-lg">
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
