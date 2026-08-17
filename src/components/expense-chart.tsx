"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getExpenseBreakdown } from "@/lib/chart-data";
import { formatMoney } from "@/lib/money";
import type { BudgetCategory } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ExpenseChartProps = {
  categories: BudgetCategory[];
};

export function ExpenseChart({ categories }: ExpenseChartProps) {
  const data = getExpenseBreakdown(categories);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by category</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No expenses to chart yet.
          </p>
        ) : (
          <>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.map((slice) => (
                      <Cell key={slice.name} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value))}
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col gap-2">
              {data.map((slice) => (
                <li
                  key={slice.name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden
                    />
                    <span className="truncate">{slice.name}</span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatMoney(slice.value)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
