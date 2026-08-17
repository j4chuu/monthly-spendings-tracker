"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMonthStore } from "@/store/month-store";
import { useTRPC } from "@/trpc/client";

export function useInvalidateBudget() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const month = useMonthStore((state) => state.month);
  const year = useMonthStore((state) => state.year);

  return () =>
    queryClient.invalidateQueries(
      trpc.budget.getByMonth.queryFilter({ month, year }),
    );
}
