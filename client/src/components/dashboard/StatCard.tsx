import { motion } from "framer-motion";
import { Card } from "../ui/Card";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-5">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <p className="mt-4 text-3xl font-bold text-[var(--accent)]">{value}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{helper}</p>
      </Card>
    </motion.div>
  );
}