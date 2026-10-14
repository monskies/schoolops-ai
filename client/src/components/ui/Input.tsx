type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] placeholder:text-[var(--muted)] backdrop-blur-xl ${className}`}
      {...props}
    />
  );
}