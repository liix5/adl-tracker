export const LABEL_COLORS = [
  {
    id: "red",
    hex: "#ef4444",
    name: "Red",
    classes: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  {
    id: "orange",
    hex: "#f97316",
    name: "Orange",
    classes: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  {
    id: "yellow",
    hex: "#eab308",
    name: "Yellow",
    classes: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  },
  {
    id: "green",
    hex: "#22c55e",
    name: "Green",
    classes: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  {
    id: "blue",
    hex: "#3b82f6",
    name: "Blue",
    classes: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    id: "purple",
    hex: "#a855f7",
    name: "Purple",
    classes: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  },
  {
    id: "pink",
    hex: "#ec4899",
    name: "Pink",
    classes: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  },
  {
    id: "gray",
    hex: "#6b7280",
    name: "Gray",
    classes: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
] as const;

export type LabelColorId = (typeof LABEL_COLORS)[number]["id"];

// Check if a color is a preset or custom hex
export function isPresetColor(colorId: string): boolean {
  return LABEL_COLORS.some((c) => c.id === colorId);
}

// Get color info - works for both preset IDs and custom hex values
export function getLabelColor(colorId: string): {
  id: string;
  hex: string;
  name: string;
  classes: string;
} {
  // Check if it's a preset color
  const preset = LABEL_COLORS.find((c) => c.id === colorId);
  if (preset) return preset;

  // It's a custom hex color - generate dynamic classes
  // We use inline styles for custom colors, so classes are minimal
  return {
    id: colorId,
    hex: colorId, // The ID is the hex value itself
    name: "Custom",
    classes: "", // Will use inline styles instead
  };
}

// Generate contrasting text color for custom backgrounds
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1f2937" : "#ffffff";
}
