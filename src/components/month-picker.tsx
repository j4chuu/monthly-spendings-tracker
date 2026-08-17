"use client";

import { getMonthLabel, getYearOptions, MONTH_NAMES } from "@/lib/months";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMonthStore } from "@/store/month-store";

const yearOptions = getYearOptions(new Date().getFullYear());

export function MonthPicker() {
  const month = useMonthStore((state) => state.month);
  const year = useMonthStore((state) => state.year);
  const setMonth = useMonthStore((state) => state.setMonth);
  const setYear = useMonthStore((state) => state.setYear);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={String(month)}
        onValueChange={(value) => setMonth(Number(value))}
      >
        <SelectTrigger className="w-[160px]" aria-label="Month">
          <SelectValue placeholder="Month">{getMonthLabel(month)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTH_NAMES.map((name, index) => (
            <SelectItem key={name} value={String(index + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(year)}
        onValueChange={(value) => setYear(Number(value))}
      >
        <SelectTrigger className="w-[110px]" aria-label="Year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
