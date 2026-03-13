import type { ExportData } from "./types";

/**
 * Trigger browser download of a JSON file
 */
export function downloadJsonFile(data: ExportData, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Share file using Web Share API (mobile)
 */
export async function shareFile(
  data: ExportData,
  filename: string,
): Promise<boolean> {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const file = new File([blob], filename, { type: "application/json" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "FIM Tracker Backup",
      });
      return true;
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
      return false;
    }
  }
  return false;
}

/**
 * Check if Web Share API with files is available
 */
export function canShareFiles(): boolean {
  if (!navigator.share || !navigator.canShare) return false;
  // Test with a dummy file
  const testFile = new File(["test"], "test.json", { type: "application/json" });
  return navigator.canShare({ files: [testFile] });
}

/**
 * Read JSON file from File input
 */
export async function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Generate a timestamped filename for exports
 */
export function generateFilename(): string {
  const date = new Date().toISOString().split("T")[0];
  return `fim-backup-${date}.json`;
}
