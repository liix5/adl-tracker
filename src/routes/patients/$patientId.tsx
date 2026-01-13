import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/patients/$patientId")({
  component: PatientPage,
});

function PatientPage() {
  const { patientId } = Route.useParams();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Patient</h1>
      <p className="text-muted-foreground">ID: {patientId}</p>

      <div className="rounded-xl border bg-card p-6">
        <div className="font-medium">Next:</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>Patient overview card (room/diagnosis/precautions/discharge)</li>
          <li>Goals grouped by ADL + progress (met/total)</li>
          <li>ADL pages (step checklists → score)</li>
        </ul>
      </div>
    </div>
  );
}
