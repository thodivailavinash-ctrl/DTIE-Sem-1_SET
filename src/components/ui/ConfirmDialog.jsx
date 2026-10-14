import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import GradientButton from './GradientButton';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2 }}
            className="glass-panel rounded-2xl max-w-md w-full p-6 border border-white/15 shadow-2xl relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#FB7185]/15 border border-[#FB7185]/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#FB7185]" />
              </div>
              <div className="flex-1">
                <h3 id="confirm-dialog-title" className="text-lg font-heading font-semibold text-[#F8FAFC]">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-[#94A3B8] leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <GradientButton variant="secondary" size="sm" onClick={onCancel}>
                {cancelLabel}
              </GradientButton>
              <GradientButton variant={variant} size="sm" onClick={onConfirm}>
                {confirmLabel}
              </GradientButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
