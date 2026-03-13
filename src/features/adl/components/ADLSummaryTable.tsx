import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ClipboardList } from "lucide-react";
import { ADL_DEFINITIONS } from "@/data/adl-definitions";
import { getAssistanceLevelName } from "@/features/adl/scoring";
import type { PatientADL, AssistanceLevel } from "@/db/types";

interface ADLSummaryTableProps {
  patientAdls: PatientADL[];
  patientName: string;
}

export function ADLSummaryTable({
  patientAdls,
  patientName,
}: ADLSummaryTableProps) {
  const [copied, setCopied] = useState(false);

  if (patientAdls.length === 0) {
    return null;
  }

  // Sort ADLs by category order (selfCare, transfers, locomotion)
  const categoryOrder = { selfCare: 0, transfers: 1, locomotion: 2 };
  const sortedAdls = [...patientAdls].sort((a, b) => {
    const defA = ADL_DEFINITIONS.find((d) => d.type === a.adlType);
    const defB = ADL_DEFINITIONS.find((d) => d.type === b.adlType);
    const orderA = defA ? categoryOrder[defA.category] : 999;
    const orderB = defB ? categoryOrder[defB.category] : 999;
    return orderA - orderB;
  });

  const generateHtmlTable = () => {
    const cellStyle =
      "border: 1px solid black; padding: 8px; text-align: left;";
    const headerStyle =
      "border: 1px solid black; padding: 8px; text-align: left; font-weight: bold; background-color: #f3f4f6;";

    let rows = "";
    for (const adl of sortedAdls) {
      const def = ADL_DEFINITIONS.find((d) => d.type === adl.adlType);
      if (!def) continue;

      const admissionLevel = getAssistanceLevelName(
        adl.admissionAssistanceLevel,
      );
      const currentLevel = getAssistanceLevelName(adl.currentAssistanceLevel);
      const change = adl.currentScore - adl.admissionScore;
      const changeText = change > 0 ? `+${change}` : `${change}`;
      const changeColor =
        change > 0 ? "color: green;" : change < 0 ? "color: red;" : "";

      rows += `<tr>
        <td style="${cellStyle}">${def.name}</td>
        <td style="${cellStyle}">${adl.admissionScore} - ${admissionLevel}</td>
        <td style="${cellStyle}">${adl.currentScore} - ${currentLevel}</td>
        <td style="${cellStyle} text-align: center; ${changeColor}">${changeText}</td>
      </tr>`;
    }

    return `
      <p><strong>ADL Summary - ${patientName}</strong></p>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="${headerStyle}">ADL</th>
            <th style="${headerStyle}">Admission</th>
            <th style="${headerStyle}">Discharge/Current</th>
            <th style="${headerStyle} text-align: center;">Change</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  };

  const handleCopy = async () => {
    const html = generateHtmlTable();
    const blob = new Blob([html], { type: "text/html" });
    const clipboardItem = new ClipboardItem({ "text/html": blob });
    await navigator.clipboard.write([clipboardItem]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">ADL Summary</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 text-left font-semibold">ADL</th>
                <th className="px-4 py-2 text-left font-semibold">Admission</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Discharge/Current
                </th>
                <th className="py-2 pl-4 text-center font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              {sortedAdls.map((adl) => {
                const def = ADL_DEFINITIONS.find((d) => d.type === adl.adlType);
                if (!def) return null;

                const change = adl.currentScore - adl.admissionScore;

                return (
                  <tr key={adl.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-medium">{def.name}</td>
                    <td className="px-4 py-2">
                      <span className="font-medium">{adl.admissionScore}</span>
                      <span className="text-muted-foreground">
                        {" - "}
                        {getAssistanceLevelName(
                          adl.admissionAssistanceLevel as AssistanceLevel,
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-medium">{adl.currentScore}</span>
                      <span className="text-muted-foreground">
                        {" - "}
                        {getAssistanceLevelName(
                          adl.currentAssistanceLevel as AssistanceLevel,
                        )}
                      </span>
                    </td>
                    <td
                      className={`py-2 pl-4 text-center font-semibold ${
                        change > 0
                          ? "text-green-600"
                          : change < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {change > 0 ? "+" : ""}
                      {change}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
