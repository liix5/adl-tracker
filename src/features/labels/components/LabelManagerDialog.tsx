import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { createLabel, updateLabel, deleteLabel } from "../api";
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
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface LabelManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LabelManagerDialog({
  open,
  onOpenChange,
}: LabelManagerDialogProps) {
  const labels = useLiveQuery(() => db.labels.toArray(), []);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editColor, setEditColor] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newColor, setNewColor] = React.useState("blue");

  const startEdit = (label: { id: string; name: string; color: string }) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await updateLabel(editingId, { name: editName, color: editColor });
    cancelEdit();
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = window.confirm(
      `Delete "${name}"? This will remove the label from all patients.`
    );
    if (!ok) return;
    await deleteLabel(id);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createLabel({ name: newName, color: newColor });
    setIsCreating(false);
    setNewName("");
    setNewColor("blue");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Manage Labels</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Existing labels */}
          {labels?.map((label) => {
            const color = getLabelColor(label.color);
            const isEditing = editingId === label.id;
            const isCustom = !isPresetColor(label.color);

            if (isEditing) {
              return (
                <div
                  key={label.id}
                  className="space-y-3 rounded-lg border bg-muted/30 p-3"
                >
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />

                  {/* Color picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Color:
                    </span>
                    <ColorPickerPopover
                      color={editColor}
                      onChange={setEditColor}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="flex-1"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={!editName.trim()}
                      className="flex-1"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={label.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(label)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(label.id, label.name)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {/* Empty state */}
          {(!labels || labels.length === 0) && !isCreating && (
            <div className="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground">
              <p>No labels yet</p>
              <p className="text-sm">
                Create labels to categorize your patients
              </p>
            </div>
          )}

          {/* Create new label */}
          {isCreating ? (
            <div className="space-y-3 rounded-lg border-2 border-primary/50 bg-primary/5 p-3">
              <Input
                placeholder="Label name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />

              {/* Color picker */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Color:</span>
                <ColorPickerPopover color={newColor} onChange={setNewColor} />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewName("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newName.trim()}
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

          {/* Close button */}
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
