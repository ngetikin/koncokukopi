import { motion, AnimatePresence } from "motion/react";

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function AlertModal({ isOpen, title = "Alert", message, onClose }: AlertModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[30px] p-6 sm:p-8 relative z-10 shadow-2xl text-center"
          >
            <h3 className="text-xl font-light mb-2">{title}</h3>
            <p className="text-brand-secondary text-sm mb-6 sm:mb-8">{message}</p>
            <button
              onClick={onClose}
              className="w-full bg-brand-accent text-white py-3 sm:py-4 rounded-xl text-[10px] uppercase font-bold tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(217,119,6,0.2)]"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
