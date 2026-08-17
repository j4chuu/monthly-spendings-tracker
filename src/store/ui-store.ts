import { create } from "zustand";

type UiState = {
  budgetDialogOpen: boolean;
  categoryDialogOpen: boolean;
  editingCategoryId: string | null;
  expenseDialogCategoryId: string | null;
  editingExpenseId: string | null;
  openBudgetDialog: () => void;
  closeBudgetDialog: () => void;
  openCategoryDialog: () => void;
  openEditCategoryDialog: (categoryId: string) => void;
  closeCategoryDialog: () => void;
  openExpenseDialog: (categoryId: string) => void;
  openEditExpenseDialog: (categoryId: string, expenseId: string) => void;
  closeExpenseDialog: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  budgetDialogOpen: false,
  categoryDialogOpen: false,
  editingCategoryId: null,
  expenseDialogCategoryId: null,
  editingExpenseId: null,
  openBudgetDialog: () => set({ budgetDialogOpen: true }),
  closeBudgetDialog: () => set({ budgetDialogOpen: false }),
  openCategoryDialog: () =>
    set({ categoryDialogOpen: true, editingCategoryId: null }),
  openEditCategoryDialog: (categoryId) =>
    set({ categoryDialogOpen: true, editingCategoryId: categoryId }),
  closeCategoryDialog: () =>
    set({ categoryDialogOpen: false, editingCategoryId: null }),
  openExpenseDialog: (categoryId) =>
    set({ expenseDialogCategoryId: categoryId, editingExpenseId: null }),
  openEditExpenseDialog: (categoryId, expenseId) =>
    set({ expenseDialogCategoryId: categoryId, editingExpenseId: expenseId }),
  closeExpenseDialog: () =>
    set({ expenseDialogCategoryId: null, editingExpenseId: null }),
}));
