export const CATEGORY_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
  "#eab308",
  "#ec4899",
] as const;

export function nextCategoryColor(usedColors: string[]): string {
  const unused = CATEGORY_COLORS.find((color) => !usedColors.includes(color));
  return unused ?? CATEGORY_COLORS[usedColors.length % CATEGORY_COLORS.length];
}
