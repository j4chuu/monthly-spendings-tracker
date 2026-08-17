"use client";

import { nextCategoryColor } from "@/lib/category-colors";
import { formatMoney } from "@/lib/money";
import type { BudgetDashboard } from "@/lib/types";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { CategoryCard } from "@/components/category-card";
import { ExpenseChart } from "@/components/expense-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUiStore } from "@/store/ui-store";

type BudgetOverviewProps = {
  budget: BudgetDashboard;
};

export function BudgetOverview({ budget }: BudgetOverviewProps) {
  const openCategoryDialog = useUiStore((state) => state.openCategoryDialog);
  const canAddCategory = budget.unallocated > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Budget" value={formatMoney(budget.totalAmount)} />
        <SummaryCard label="Spent" value={formatMoney(budget.totalSpent)} />
        <SummaryCard
          label="Remaining"
          value={formatMoney(budget.remaining)}
          tone={budget.remaining < 0 ? "danger" : "default"}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {formatMoney(budget.unallocated)} left to allocate into categories.
      </p>

      <ExpenseChart categories={budget.categories} />

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Categories</h2>
        <Button
          type="button"
          onClick={openCategoryDialog}
          disabled={!canAddCategory}
        >
          Add category
        </Button>
      </div>

      {budget.categories.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No categories yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Split the budget into categories like groceries, rent, or transport.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {budget.categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}

      <AddCategoryDialog
        budgetId={budget.id}
        unallocated={budget.unallocated}
        defaultColor={nextCategoryColor(
          budget.categories.map((category) => category.color),
        )}
      />
      <AddExpenseDialog categories={budget.categories} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={
            tone === "danger"
              ? "text-2xl font-semibold tracking-tight text-destructive"
              : "text-2xl font-semibold tracking-tight"
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
