"use client";

import { useQuery } from "@tanstack/react-query";
import { BudgetOverview } from "@/components/budget-overview";
import { CreateBudgetForm } from "@/components/create-budget-form";
import { MonthPicker } from "@/components/month-picker";
import { useMonthStore } from "@/store/month-store";
import { useTRPC } from "@/trpc/client";

export function BudgetScreen() {
  const trpc = useTRPC();
  const month = useMonthStore((state) => state.month);
  const year = useMonthStore((state) => state.year);
  const budgetQuery = useQuery(
    trpc.budget.getByMonth.queryOptions({ month, year }),
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Monthly Spend Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Plan a budget, then split it across spending categories.
          </p>
        </div>
        <MonthPicker />
      </header>

      {budgetQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading budget…</p>
      ) : null}

      {budgetQuery.isError ? (
        <p className="text-sm text-destructive">{budgetQuery.error.message}</p>
      ) : null}

      {budgetQuery.data === null ? <CreateBudgetForm /> : null}

      {budgetQuery.data ? (
        <BudgetOverview
          totalAmount={budgetQuery.data.totalAmount}
          totalSpent={budgetQuery.data.totalSpent}
          remaining={budgetQuery.data.remaining}
          unallocated={budgetQuery.data.unallocated}
        />
      ) : null}
    </main>
  );
}
