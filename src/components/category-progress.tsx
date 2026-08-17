type CategoryProgressProps = {
  spentAmount: number;
  allocatedAmount: number;
  color: string;
};

export function CategoryProgress({
  spentAmount,
  allocatedAmount,
  color,
}: CategoryProgressProps) {
  const percent =
    allocatedAmount <= 0
      ? 0
      : Math.min(100, (spentAmount / allocatedAmount) * 100);
  const usedPercent =
    allocatedAmount <= 0
      ? 0
      : Math.round((spentAmount / allocatedAmount) * 100);
  const overspent = spentAmount > allocatedAmount;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <p
        className={
          overspent
            ? "text-xs text-destructive"
            : "text-xs text-muted-foreground"
        }
      >
        {usedPercent}% used
        {overspent ? " · overspent" : ""}
      </p>
    </div>
  );
}
