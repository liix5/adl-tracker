import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { setPatientLabels, createLabel } from "../api";
import { getLabelColor, isPresetColor } from "../constants";
import { ColorPickerPopover } from "./ColorPickerPopover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Check } from "lucide-react";

interface LabelAssignDialogProps {
  patientId: string;
  patientName: string;
  currentLabelIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LabelAssignDialog({
  patientId,
  patientName,
  currentLabelIds,
  open,
  onOpenChange,
}: LabelAssignDialogProps) {
  const labels = useLiveQuery(() => db.labels.toArray(), []);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(currentLabelIds)
  );
  const [isCreating, setIsCreating] = React.useState(false);
  const [newLabelName, setNewLabelName] = React.useState("");
  const [newLabelColor, setNewLabelColor] = React.useState("blue");

  // Reset selection when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedIds(new Set(currentLabelIds));
      setIsCreating(false);
      setNewLabelName("");
      setNewLabelColor("blue");
    }
  }, [open, currentLabelIds]);

  const toggleLabel = (labelId: string) => {
    const next = new Set(selectedIds);
    if (next.has(labelId)) {
      next.delete(labelId);
    } else {
      next.add(labelId);
    }
    setSelectedIds(next);
  };

  const handleSave = async () => {
    await setPatientLabels(patientId, Array.from(selectedIds));
    onOpenChange(false);
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    const label = await createLabel({
      name: newLabelName,
      color: newLabelColor,
    });
    setSelectedIds((prev) => new Set([...prev, label.id]));
    setIsCreating(false);
    setNewLabelName("");
    setNewLabelColor("blue");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Labels for {patientName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing labels */}
          {labels && labels.length > 0 && (
            <div className="space-y-2">
              {labels.map((label) => {
                const color = getLabelColor(label.color);
                const isSelected = selectedIds.has(label.id);
                const isCustom = !isPresetColor(label.color);

                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Checkbox checked={isSelected} />
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
                        isCustom ? "border" : color.classes
                      }`}
                      style={
                        isCustom
                          ? {
                              backgroundColor: `${color.hex}20`,
                              color: color.hex,
                              borderColor: `${color.hex}40`,
                            }
                          : undefined
                      }
                    >
                      {label.name}
                    </span>
                    <span className="flex-1" />
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Create new label */}
          {isCreating ? (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <Input
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                autoFocus
              />

              {/* Color picker */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Color:</span>
                <ColorPickerPopover
                  color={newLabelColor}
                  onChange={setNewLabelColor}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim()}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Label
            </Button>
          )}

          {/* Save button */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
