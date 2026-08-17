import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type BudgetDashboard = NonNullable<RouterOutputs["budget"]["getByMonth"]>;
export type BudgetCategory = BudgetDashboard["categories"][number];
export type BudgetExpense = BudgetCategory["expenses"][number];
