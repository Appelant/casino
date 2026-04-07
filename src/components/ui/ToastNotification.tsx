import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toastSlide } from '@/config/animations.config';
import { useUIStore } from '@/stores';
import type { ToastLevel } from '@/types';

export interface ToastProps {
  id: string;
  message: string;
  level: ToastLevel;
  onDismiss: (id: string) => void;
}

const levelStyles: Record<ToastLevel, string> = {
  success: 'bg-neon-green/20 border-neon-green/50 text-neon-green',
  error: 'bg-neon-red/20 border-neon-red/50 text-neon-red',
  info: 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan',
  warning: 'bg-neon-gold/20 border-neon-gold/50 text-neon-gold',
};

const levelIcons: Record<ToastLevel, React.JSX.Element> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

/**
 * Composant ToastNotification — notification toast individuelle
 */
function Toast({ id, message, level, onDismiss }: ToastProps) {
  return (
    <motion.div
      variants={toastSlide}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'backdrop-blur-md',
        levelStyles[level]
      )}
      role="alert"
    >
      {levelIcons[level]}
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        className="p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

/**
 * Container de toasts — à placer dans le layout principal
 *
 * Usage: <ToastContainer /> dans App.tsx ou CasinoLayout
 */
export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[400] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            level={toast.level}
            onDismiss={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook utilitaire pour ajouter un toast
 */
export function useToast() {
  const addToast = useUIStore((state) => state.addToast);

  const success = (message: string, duration: number = 3000) => {
    addToast({ message, level: 'success', duration });
  };

  const error = (message: string, duration: number = 3000) => {
    addToast({ message, level: 'error', duration });
  };

  const info = (message: string, duration: number = 3000) => {
    addToast({ message, level: 'info', duration });
  };

  const warning = (message: string, duration: number = 3000) => {
    addToast({ message, level: 'warning', duration });
  };

  return { success, error, info, warning };
}
