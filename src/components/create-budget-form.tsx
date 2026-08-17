"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBudgetSchema } from "@/lib/schemas/budget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMonthLabel } from "@/lib/months";
import { useMonthStore } from "@/store/month-store";
import { useTRPC } from "@/trpc/client";

export function CreateBudgetForm() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const month = useMonthStore((state) => state.month);
  const year = useMonthStore((state) => state.year);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createBudget = useMutation(
    trpc.budget.create.mutationOptions({
      onSuccess: async () => {
        setError(null);
        setAmount("");
        await queryClient.invalidateQueries(
          trpc.budget.getByMonth.queryFilter({ month, year }),
        );
      },
      onError: (mutationError) => {
        setError(mutationError.message);
      },
    }),
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = createBudgetSchema.safeParse({
      month,
      year,
      totalAmount: Number(amount),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid amount");
      return;
    }

    createBudget.mutate(parsed.data);
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Create budget</CardTitle>
        <CardDescription>
          No budget yet for {getMonthLabel(month)} {year}. Set the total amount
          to start tracking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="total-amount">Total amount (PLN)</Label>
            <Input
              id="total-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="4000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={createBudget.isPending}>
            {createBudget.isPending ? "Creating…" : "Create budget"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
