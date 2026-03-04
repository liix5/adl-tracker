import * as React from "react";
import { parseColor, type Color } from "react-aria-components";
import {
  ColorPicker,
  ColorArea,
  ColorThumb,
  ColorSlider,
  SliderTrack,
} from "@/components/ui/color";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pipette } from "lucide-react";
import { LABEL_COLORS } from "../constants";

interface ColorPickerPopoverProps {
  color: string; // hex or preset ID
  onChange: (color: string) => void;
  presetOnly?: boolean;
}

export function ColorPickerPopover({
  color,
  onChange,
  presetOnly = false,
}: ColorPickerPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [showCustomPicker, setShowCustomPicker] = React.useState(false);

  // Determine if current color is a preset or custom hex
  const isPreset = LABEL_COLORS.some((c) => c.id === color);
  const currentHex = isPreset
    ? LABEL_COLORS.find((c) => c.id === color)?.hex ?? "#3b82f6"
    : color;

  const [customColor, setCustomColor] = React.useState<Color>(() =>
    parseColor(currentHex)
  );
  const [hexInput, setHexInput] = React.useState(currentHex);

  // Update local state when prop changes
  React.useEffect(() => {
    const hex = isPreset
      ? LABEL_COLORS.find((c) => c.id === color)?.hex ?? "#3b82f6"
      : color;
    setCustomColor(parseColor(hex));
    setHexInput(hex);
  }, [color, isPreset]);

  const handlePresetSelect = (presetId: string) => {
    onChange(presetId);
    setShowCustomPicker(false);
    setOpen(false);
  };

  const handleCustomColorChange = (newColor: Color) => {
    setCustomColor(newColor);
    const hex = newColor.toString("hex");
    setHexInput(hex);
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      try {
        setCustomColor(parseColor(value));
      } catch {
        // Invalid color, ignore
      }
    }
  };

  const handleApplyCustomColor = () => {
    const hex = customColor.toString("hex");
    onChange(hex);
    setOpen(false);
    setShowCustomPicker(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors hover:bg-accent"
        >
          <span
            className="h-5 w-5 rounded-full border"
            style={{ backgroundColor: currentHex }}
          />
          <span className="text-muted-foreground">
            {isPreset
              ? LABEL_COLORS.find((c) => c.id === color)?.name
              : "Custom"}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3" align="start">
        {!showCustomPicker ? (
          <div className="space-y-3">
            {/* Preset colors grid */}
            <div className="grid grid-cols-4 gap-2">
              {LABEL_COLORS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    color === preset.id
                      ? "ring-2 ring-primary ring-offset-2"
                      : ""
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  aria-label={preset.name}
                  title={preset.name}
                />
              ))}
            </div>

            {/* Custom color option */}
            {!presetOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomPicker(true)}
                className="w-full gap-2"
              >
                <Pipette className="h-4 w-4" />
                Custom Color
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Color picker */}
            <ColorPicker value={customColor} onChange={handleCustomColorChange}>
              <ColorArea
                colorSpace="hsb"
                xChannel="saturation"
                yChannel="brightness"
                className="!h-32 !w-full"
              >
                <ColorThumb />
              </ColorArea>

              <ColorSlider colorSpace="hsb" channel="hue">
                <SliderTrack className="!w-full">
                  <ColorThumb />
                </SliderTrack>
              </ColorSlider>
            </ColorPicker>

            {/* Hex input */}
            <div className="flex items-center gap-2">
              <span
                className="h-8 w-8 shrink-0 rounded-md border"
                style={{ backgroundColor: customColor.toString("hex") }}
              />
              <Input
                value={hexInput}
                onChange={(e) => handleHexInputChange(e.target.value)}
                placeholder="#000000"
                className="h-8 font-mono text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomPicker(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleApplyCustomColor}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
