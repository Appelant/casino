import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { modalBackdrop, modalContent } from '@/config/animations.config';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Composant Modal — modale générique avec AnimatePresence
 *
 * Features:
 * - Backdrop cliquable optionnel
 * - Bouton de fermeture optionnel
 * - Animation fade + scale
 * - Fermeture avec Echap
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}: ModalProps) {
  // Fermer avec la touche Echap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            key="modal-content"
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={clsx(
              'w-full mx-4 rounded-xl',
              'bg-casino-surface border border-white/10',
              'shadow-2xl',
              sizeClasses[size]
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-white"
                  >
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Fermer"
                  >
                    <svg
                      className="w-5 h-5 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={clsx('p-4', title || showCloseButton ? '' : 'pt-4')}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
