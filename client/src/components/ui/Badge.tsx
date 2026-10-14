type BadgeProps = {
  children: React.ReactNode;
  tone?: "success" | "neutral" | "warning";
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  const toneStyles = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
    neutral: "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}