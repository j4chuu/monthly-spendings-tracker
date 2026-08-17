"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateBudget } from "@/hooks/use-invalidate-budget";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { formatMoney, toCents } from "@/lib/money";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/schemas/category";
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

type CategoryDialogProps = {
  budgetId: string;
  unallocated: number;
  defaultColor: string;
  categories: BudgetCategory[];
};

export function AddCategoryDialog({
  budgetId,
  unallocated,
  defaultColor,
  categories,
}: CategoryDialogProps) {
  const trpc = useTRPC();
  const invalidateBudget = useInvalidateBudget();
  const open = useUiStore((state) => state.categoryDialogOpen);
  const editingCategoryId = useUiStore((state) => state.editingCategoryId);
  const closeCategoryDialog = useUiStore((state) => state.closeCategoryDialog);
  const editingCategory = categories.find(
    (category) => category.id === editingCategoryId,
  );
  const isEditing = Boolean(editingCategory);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [error, setError] = useState<string | null>(null);

  const maxAllocate = editingCategory
    ? unallocated + editingCategory.allocatedAmount
    : unallocated;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingCategory) {
      setName(editingCategory.name);
      setAmount(String(editingCategory.allocatedAmount));
      setColor(editingCategory.color);
    } else {
      setName("");
      setAmount("");
      setColor(defaultColor);
    }
    setError(null);
  }, [open, editingCategory, defaultColor]);

  const createCategory = useMutation(
    trpc.category.create.mutationOptions({
      onSuccess: async () => {
        closeCategoryDialog();
        await invalidateBudget();
      },
      onError: (mutationError) => {
        setError(mutationError.message);
      },
    }),
  );

  const updateCategory = useMutation(
    trpc.category.update.mutationOptions({
      onSuccess: async () => {
        closeCategoryDialog();
        await invalidateBudget();
      },
      onError: (mutationError) => {
        setError(mutationError.message);
      },
    }),
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      closeCategoryDialog();
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isEditing && editingCategory) {
      const parsed = updateCategorySchema.safeParse({
        id: editingCategory.id,
        name,
        allocatedAmount: Number(amount),
        color,
      });

      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Invalid category");
        return;
      }

      if (toCents(parsed.data.allocatedAmount) > toCents(maxAllocate)) {
        setError(
          `Amount cannot exceed ${formatMoney(maxAllocate)} left to allocate`,
        );
        return;
      }

      updateCategory.mutate(parsed.data);
      return;
    }

    const parsed = createCategorySchema.safeParse({
      budgetId,
      name,
      allocatedAmount: Number(amount),
      color,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid category");
      return;
    }

    if (toCents(parsed.data.allocatedAmount) > toCents(unallocated)) {
      setError(
        `Amount cannot exceed ${formatMoney(unallocated)} left to allocate`,
      );
      return;
    }

    createCategory.mutate(parsed.data);
  }

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit category" : "Add category"}
            </DialogTitle>
            <DialogDescription>
              {formatMoney(maxAllocate)} left to allocate from this budget.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Groceries"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category-amount">Allocated amount (PLN)</Label>
            <Input
              id="category-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="800"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Select color ${option}`}
                  aria-pressed={color === option}
                  className="size-6 rounded-full ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  style={{
                    backgroundColor: option,
                    boxShadow:
                      color === option
                        ? "0 0 0 2px var(--foreground)"
                        : undefined,
                  }}
                  onClick={() => setColor(option)}
                />
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving…"
                : isEditing
                  ? "Save category"
                  : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
