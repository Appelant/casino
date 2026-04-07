import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'cyan' | 'gold' | 'white';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const colorClasses = {
  purple: 'text-neon-purple',
  cyan: 'text-neon-cyan',
  gold: 'text-neon-gold',
  white: 'text-white',
};

/**
 * Composant LoadingSpinner — spinner de chargement néon
 */
export function LoadingSpinner({
  size = 'md',
  color = 'purple',
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      <motion.div
        className={clsx(
          'rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          colorClasses[color]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && (
        <span className="text-sm text-white/60 animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * Overlay de chargement plein écran
 */
export function LoadingOverlay({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" color="purple" text={text} />
    </div>
  );
}
