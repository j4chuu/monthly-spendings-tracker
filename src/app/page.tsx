import { HealthCheck } from "@/components/health-check";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Monthly Spend Tracker
      </h1>
      <HealthCheck />
    </main>
  );
}
