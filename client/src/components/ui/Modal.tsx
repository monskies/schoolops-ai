import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Button } from "./Button";

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button variant="secondary" onClick={onClose} aria-label="Close modal">
            <FiX />
          </Button>
        </div>

        {children}
      </motion.section>
    </div>
  );
}