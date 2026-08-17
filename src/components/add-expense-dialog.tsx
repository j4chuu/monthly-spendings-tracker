"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateBudget } from "@/hooks/use-invalidate-budget";
import { toDateInputValue } from "@/lib/dates";
import { createExpenseSchema } from "@/lib/schemas/expense";
import type { BudgetCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUiStore } from "@/store/ui-store";
import { useTRPC } from "@/trpc/client";

type AddExpenseDialogProps = {
  categories: BudgetCategory[];
};

export function AddExpenseDialog({ categories }: AddExpenseDialogProps) {
  const trpc = useTRPC();
  const invalidateBudget = useInvalidateBudget();
  const categoryId = useUiStore((state) => state.expenseDialogCategoryId);
  const closeExpenseDialog = useUiStore((state) => state.closeExpenseDialog);
  const category = categories.find((item) => item.id === categoryId);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [error, setError] = useState<string | null>(null);

  const createExpense = useMutation(
    trpc.expense.create.mutationOptions({
      onSuccess: async () => {
        resetForm();
        closeExpenseDialog();
        await invalidateBudget();
      },
      onError: (mutationError) => {
        setError(mutationError.message);
      },
    }),
  );

  function resetForm() {
    setAmount("");
    setDescription("");
    setDate(toDateInputValue(new Date()));
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
      closeExpenseDialog();
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      return;
    }

    const parsed = createExpenseSchema.safeParse({
      categoryId,
      amount: Number(amount),
      description,
      date,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid expense");
      return;
    }

    createExpense.mutate(parsed.data);
  }

  return (
    <Dialog open={Boolean(categoryId)} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add expense</DialogTitle>
            <DialogDescription>
              {category
                ? `Logged against ${category.name}.`
                : "Choose a category first."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-amount">Amount (PLN)</Label>
            <Input
              id="expense-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="42.50"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-description">Description (optional)</Label>
            <Input
              id="expense-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Lunch"
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-date">Date</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={createExpense.isPending || !categoryId}>
              {createExpense.isPending ? "Adding…" : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
