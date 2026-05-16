import { motion, AnimatePresence } from "motion/react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  confirmText?: string;
}

export function ConfirmModal({ 
  isOpen, 
  title = "Are you sure?", 
  message, 
  onConfirm, 
  onCancel, 
  isProcessing = false,
  confirmText = "Confirm" 
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessing && onCancel()}
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                disabled={isProcessing}
                onClick={onCancel}
                className="w-full sm:flex-1 bg-white/5 py-3 sm:py-4 rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-white/10 transition-all disabled:opacity-30 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={onConfirm}
                className="w-full sm:flex-1 bg-brand-accent text-white py-3 sm:py-4 rounded-xl text-[10px] uppercase font-bold tracking-widest hover:brightness-110 transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(217,119,6,0.2)] order-1 sm:order-2"
              >
                {isProcessing ? "Processing..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
