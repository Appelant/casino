import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { Size, ButtonVariant, CommonUIProps } from '@/types';
import { buttonPress } from '@/config/animations.config';

export interface NeonButtonProps extends CommonUIProps {
  variant?: ButtonVariant | 'purple' | 'cyan' | 'gold';
  size?: Size;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}

const sizeClasses: Record<Size, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
  xl: 'px-10 py-4 text-xl',
};

const variantClasses: Record<string, string> = {
  primary: 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
  secondary: 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
  accent: 'bg-neon-gold/20 text-neon-gold border border-neon-gold/50 hover:bg-neon-gold/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
  danger: 'bg-neon-red/20 text-neon-red border border-neon-red/50 hover:bg-neon-red/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  ghost: 'bg-transparent text-white/70 border border-white/10 hover:bg-white/5',
  purple: 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
  cyan: 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
  gold: 'bg-neon-gold/20 text-neon-gold border border-neon-gold/50 hover:bg-neon-gold/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
  red: 'bg-neon-red/20 text-neon-red border border-neon-red/50 hover:bg-neon-red/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
};

/**
 * Composant NeonButton — bouton avec effet néon
 *
 * Features:
 * - 3 variantes principales (purple/cyan/gold) + variantes sémantiques
 * - 5 tailles (xs/sm/md/lg/xl)
 * - Animation hover/press via Framer Motion
 * - État loading optionnel
 * - État disabled
 */
export function NeonButton({
  variant = 'primary',
  size = 'md',
  type = 'button',
  children,
  className,
  disabled,
  loading,
  onClick,
  ...props
}: NeonButtonProps) {
  return (
    <motion.button
      variants={buttonPress}
      initial="idle"
      whileHover={disabled ? undefined : 'hovered'}
      whileTap={disabled ? undefined : 'pressed'}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        'font-medium rounded-lg transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
        sizeClasses[size],
        variantClasses[variant],
        loading && 'opacity-60 cursor-wait',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
