"use client";

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
            <CardTitle>{category.name}</CardTitle>
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
          {formatMoney(category.spentAmount)} of{" "}
          {formatMoney(category.allocatedAmount)}
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
          <ul className="flex flex-col gap-2">
            {category.expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate text-muted-foreground">
                  {formatExpenseDate(new Date(expense.date))}
                  {expense.description ? ` · ${expense.description}` : ""}
                </span>
                <span className="shrink-0 font-medium">
                  {formatMoney(expense.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
