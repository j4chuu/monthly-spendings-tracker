import { create } from "zustand";

type MonthState = {
  month: number;
  year: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
};

const now = new Date();

export const useMonthStore = create<MonthState>((set) => ({
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
}));
