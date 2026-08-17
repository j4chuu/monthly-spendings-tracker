import { create } from "zustand";

type UiState = {
  categoryDialogOpen: boolean;
  expenseDialogCategoryId: string | null;
  openCategoryDialog: () => void;
  closeCategoryDialog: () => void;
  openExpenseDialog: (categoryId: string) => void;
  closeExpenseDialog: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  categoryDialogOpen: false,
  expenseDialogCategoryId: null,
  openCategoryDialog: () => set({ categoryDialogOpen: true }),
  closeCategoryDialog: () => set({ categoryDialogOpen: false }),
  openExpenseDialog: (categoryId) => set({ expenseDialogCategoryId: categoryId }),
  closeExpenseDialog: () => set({ expenseDialogCategoryId: null }),
}));
