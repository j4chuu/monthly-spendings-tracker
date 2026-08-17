"use client";

import { PencilIcon } from "lucide-react";
import { formatExpenseDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { BudgetCategory } from "@/lib/types";
import { CategoryProgress } from "@/components/category-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUiStore } from "@/store/ui-store";

type CategoryCardProps = {
  category: BudgetCategory;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const openExpenseDialog = useUiStore((state) => state.openExpenseDialog);
  const openEditCategoryDialog = useUiStore(
    (state) => state.openEditCategoryDialog,
  );
  const openEditExpenseDialog = useUiStore(
    (state) => state.openEditExpenseDialog,
  );
  const leftover = Number(
    (category.allocatedAmount - category.spentAmount).toFixed(2),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
            <CardTitle className="truncate">{category.name}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Edit ${category.name}`}
              onClick={() => openEditCategoryDialog(category.id)}
            >
              <PencilIcon />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openExpenseDialog(category.id)}
          >
            Add expense
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatMoney(category.spentAmount)} spent of{" "}
          {formatMoney(category.allocatedAmount)} planned
        </p>
        <p
          className={
            leftover < 0
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {leftover < 0
            ? `${formatMoney(Math.abs(leftover))} over the plan`
            : `${formatMoney(leftover)} left in this category`}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CategoryProgress
          spentAmount={category.spentAmount}
          allocatedAmount={category.allocatedAmount}
          color={category.color}
        />
        {category.expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {category.expenses.map((expense) => (
              <li key={expense.id}>
                <button
                  type="button"
                  className="flex w-full items-baseline justify-between gap-3 rounded-md px-1 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() =>
                    openEditExpenseDialog(category.id, expense.id)
                  }
                >
                  <span className="min-w-0 truncate text-muted-foreground">
                    {formatExpenseDate(new Date(expense.date))}
                    {expense.description ? ` · ${expense.description}` : ""}
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatMoney(expense.amount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
