type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-[var(--accent)] text-black hover:opacity-90"
      : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-white/10";

  return (
    <button
      className={`rounded-xl px-4 py-2 font-semibold transition ${styles} ${className}`}
      {...props}
    />
  );
}