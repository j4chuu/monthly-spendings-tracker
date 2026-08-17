"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function HealthCheck() {
  const trpc = useTRPC();
  const health = useQuery(trpc.health.queryOptions());

  if (health.isPending) {
    return <p className="text-zinc-500">Connecting…</p>;
  }

  if (health.isError) {
    return (
      <p className="text-red-600">tRPC error: {health.error.message}</p>
    );
  }

  return (
    <p className="text-zinc-700">
      tRPC OK · session{" "}
      <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm">
        {health.data.sessionId}
      </code>
    </p>
  );
}
