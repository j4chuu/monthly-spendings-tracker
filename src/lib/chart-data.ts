export type ExpenseSlice = {
  name: string;
  value: number;
  color: string;
};

export function getExpenseBreakdown(
  categories: Array<{ name: string; color: string; spentAmount: number }>,
): ExpenseSlice[] {
  return categories
    .filter((category) => category.spentAmount > 0)
    .map((category) => ({
      name: category.name,
      value: category.spentAmount,
      color: category.color,
    }));
}
