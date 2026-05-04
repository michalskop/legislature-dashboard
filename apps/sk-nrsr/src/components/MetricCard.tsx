interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  description?: string;
  className?: string;
}

export function MetricCard({ label, value, subValue, description, className = "" }: MetricCardProps) {
  return (
    <div className={`bg-surface-2 rounded-badge p-4 flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      {subValue && <span className="text-sm text-muted-foreground">{subValue}</span>}
      {description && <span className="text-xs text-muted-foreground mt-1">{description}</span>}
    </div>
  );
}
