type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-black/5 backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}