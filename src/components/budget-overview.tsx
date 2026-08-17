"use client";

import { formatMoney } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BudgetOverviewProps = {
  totalAmount: number;
  totalSpent: number;
  remaining: number;
  unallocated: number;
};

export function BudgetOverview({
  totalAmount,
  totalSpent,
  remaining,
  unallocated,
}: BudgetOverviewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Budget" value={formatMoney(totalAmount)} />
        <SummaryCard label="Spent" value={formatMoney(totalSpent)} />
        <SummaryCard
          label="Remaining"
          value={formatMoney(remaining)}
          tone={remaining < 0 ? "danger" : "default"}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {formatMoney(unallocated)} left to allocate into categories.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        </CardContent>
      </Card>
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
