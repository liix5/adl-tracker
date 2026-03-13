import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  exportAllData,
  getDataSummary,
  importDataReplace,
  importDataMerge,
  validateImportData,
} from "../api";
import {
  downloadJsonFile,
  shareFile,
  canShareFiles,
  readJsonFile,
  generateFilename,
} from "../utils";
import type { ValidationResult } from "../types";

import {
  Download,
  Upload,
  Share2,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  Users,
  Tag,
  ClipboardList,
  History,
} from "lucide-react";

type DataSyncDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DataSyncDialog({ open, onOpenChange }: DataSyncDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Backup & Sync</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="export" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1 gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-4">
            <ExportTab />
          </TabsContent>

          <TabsContent value="import" className="mt-4">
            <ImportTab onComplete={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ExportTab() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [showShareButton] = React.useState(() => canShareFiles());

  const summary = useLiveQuery(() => getDataSummary(), []);

  async function handleDownload() {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      downloadJsonFile(data, generateFilename());
    } finally {
      setIsExporting(false);
    }
  }

  async function handleShare() {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      await shareFile(data, generateFilename());
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Data Summary */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 text-sm font-medium text-muted-foreground">
          Data to export
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{summary?.patients ?? 0} patients</span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <span>{summary?.patientAdls ?? 0} ADLs</span>
          </div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <span>{summary?.assessments ?? 0} assessments</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span>{summary?.labels ?? 0} labels</span>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Download Backup"}
        </Button>

        {showShareButton && (
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={isExporting}
            className="w-full gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Export creates a JSON file containing all your data. Use this to
        transfer data between devices or create backups.
      </p>
    </div>
  );
}

type ImportTabProps = {
  onComplete: () => void;
};

function ImportTab({ onComplete }: ImportTabProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [validation, setValidation] = React.useState<ValidationResult | null>(
    null,
  );
  const [importMode, setImportMode] = React.useState<"replace" | "merge">(
    "merge",
  );
  const [isImporting, setIsImporting] = React.useState(false);
  const [result, setResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileSelect(selectedFile: File) {
    setFile(selectedFile);
    setResult(null);

    try {
      const data = await readJsonFile(selectedFile);
      const validationResult = validateImportData(data);
      setValidation(validationResult);
    } catch (err) {
      setValidation({
        valid: false,
        error: (err as Error).message,
      });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/json" || droppedFile?.name.endsWith(".json")) {
      handleFileSelect(droppedFile);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleImport() {
    if (!validation?.valid) return;

    setIsImporting(true);
    try {
      const importResult =
        importMode === "replace"
          ? await importDataReplace(validation.data)
          : await importDataMerge(validation.data);

      if (importResult.success) {
        setResult({
          success: true,
          message: `Imported ${importResult.counts.patients} patients, ${importResult.counts.patientAdls} ADLs, ${importResult.counts.assessments} assessments, ${importResult.counts.labels} labels`,
        });
        // Close dialog after short delay on success
        setTimeout(() => onComplete(), 1500);
      } else {
        setResult({
          success: false,
          message: importResult.errors?.join(", ") ?? "Import failed",
        });
      }
    } finally {
      setIsImporting(false);
    }
  }

  function reset() {
    setFile(null);
    setValidation(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Show result state
  if (result) {
    return (
      <div className="space-y-4 text-center py-4">
        {result.success ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <div>
              <div className="font-medium">Import Successful</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.message}
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <div>
              <div className="font-medium">Import Failed</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.message}
              </p>
            </div>
            <Button variant="outline" onClick={reset}>
              Try Again
            </Button>
          </>
        )}
      </div>
    );
  }

  // Show file preview if selected
  if (file && validation) {
    return (
      <div className="space-y-4">
        {/* File info */}
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <FileJson className="h-8 w-8 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{file.name}</div>
            <div className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            Change
          </Button>
        </div>

        {/* Validation result */}
        {validation.valid ? (
          <>
            {/* Data preview */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-3 text-sm font-medium text-muted-foreground">
                Data in file
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{validation.data.data.patients.length} patients</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <span>{validation.data.data.patientAdls.length} ADLs</span>
                </div>
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  <span>
                    {validation.data.data.assessments.length} assessments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span>{validation.data.data.labels.length} labels</span>
                </div>
              </div>
            </div>

            {/* Import mode selector */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Import mode</div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === "merge"}
                  onChange={() => setImportMode("merge")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Merge with existing</div>
                  <div className="text-sm text-muted-foreground">
                    Keep your current data and add/update from backup
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === "replace"}
                  onChange={() => setImportMode("replace")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Replace all</div>
                  <div className="text-sm text-muted-foreground">
                    Delete all current data and restore from backup
                  </div>
                </div>
              </label>
            </div>

            {/* Warning for replace mode */}
            {importMode === "replace" && (
              <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm dark:border-orange-900/50 dark:bg-orange-950/20">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <span className="text-orange-700 dark:text-orange-400">
                  This will delete all existing data and replace it with the
                  backup. This cannot be undone.
                </span>
              </div>
            )}

            {/* Import button */}
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Importing..." : "Import"}
            </Button>
          </>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span className="text-destructive">{validation.error}</span>
          </div>
        )}
      </div>
    );
  }

  // Show upload area
  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary hover:bg-muted/50"
      >
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="font-medium">Drop a backup file here</div>
          <div className="text-sm text-muted-foreground">
            or click to browse
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) handleFileSelect(selectedFile);
          }}
          className="hidden"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Select a JSON backup file exported from FIM Tracker. You can choose to
        merge with existing data or replace everything.
      </p>
    </div>
  );
}
