"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateBudget } from "@/hooks/use-invalidate-budget";
import { formatMoney } from "@/lib/money";
import { updateBudgetSchema } from "@/lib/schemas/budget";
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

type EditBudgetDialogProps = {
  budgetId: string;
  totalAmount: number;
  totalAllocated: number;
};

export function EditBudgetDialog({
  budgetId,
  totalAmount,
  totalAllocated,
}: EditBudgetDialogProps) {
  const trpc = useTRPC();
  const invalidateBudget = useInvalidateBudget();
  const open = useUiStore((state) => state.budgetDialogOpen);
  const closeBudgetDialog = useUiStore((state) => state.closeBudgetDialog);
  const [amount, setAmount] = useState(String(totalAmount));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(String(totalAmount));
      setError(null);
    }
  }, [open, totalAmount]);

  const updateBudget = useMutation(
    trpc.budget.update.mutationOptions({
      onSuccess: async () => {
        closeBudgetDialog();
        await invalidateBudget();
      },
      onError: (mutationError) => {
        setError(mutationError.message);
      },
    }),
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      closeBudgetDialog();
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = updateBudgetSchema.safeParse({
      id: budgetId,
      totalAmount: Number(amount),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid amount");
      return;
    }

    updateBudget.mutate(parsed.data);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit budget</DialogTitle>
            <DialogDescription>
              Categories currently use {formatMoney(totalAllocated)}. The total
              cannot go below that.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-total-amount">Total amount (PLN)</Label>
            <Input
              id="edit-total-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={updateBudget.isPending}>
              {updateBudget.isPending ? "Saving…" : "Save budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
