import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { CommonUIProps } from '@/types';

export interface GlassCardProps extends CommonUIProps {
  glowColor?: 'purple' | 'cyan' | 'gold' | 'green' | 'red' | 'none';
  hover?: boolean;
}

/**
 * Composant GlassCard — conteneur glassmorphisme
 *
 * Features:
 * - Backdrop blur
 * - Border néon optionnelle
 * - Glow optionnel au hover
 */
export function GlassCard({
  children,
  className,
  glowColor = 'none',
  hover = false,
}: GlassCardProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: hover ? 1.01 : 1,
        boxShadow: glowColor !== 'none' && hover
          ? `var(--glow-${glowColor})`
          : 'none',
      }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'backdrop-blur-md bg-white/5 border rounded-xl',
        glowColor === 'purple' && 'border-neon-purple/30',
        glowColor === 'cyan' && 'border-neon-cyan/30',
        glowColor === 'gold' && 'border-neon-gold/30',
        glowColor === 'green' && 'border-neon-green/30',
        glowColor === 'red' && 'border-neon-red/30',
        glowColor === 'none' && 'border-casino-border',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
