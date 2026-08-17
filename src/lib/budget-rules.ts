import { toCents } from "@/lib/money";

export function canAllocate(params: {
  budgetTotal: number;
  currentlyAllocated: number;
  additionalAmount: number;
}): boolean {
  return (
    toCents(params.currentlyAllocated) + toCents(params.additionalAmount) <=
    toCents(params.budgetTotal)
  );
}
