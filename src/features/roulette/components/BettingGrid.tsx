import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { getNumberColor } from '../utils/rouletteNumbers';
import { staggerContainer } from '@/config/animations.config';

export interface BettingGridProps {
  disabled?: boolean;
}

/**
 * Composant BettingGrid — tapis de mise de la roulette (simplifié MVP)
 *
 * Layout:
 * - Grille de numéros 1-36 avec couleurs
 * - Zéro en haut
 */
export function BettingGrid({}: BettingGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative select-none"
    >
      {/* Grid container */}
      <div className="grid grid-cols-[40px_repeat(12,minmax(0,1fr))] gap-1 p-2 bg-casino-surface/50 rounded-xl border border-white/10">
        {/* Zero */}
        <div
          className={clsx(
            'row-span-3 rounded-lg font-bold text-lg flex items-center justify-center',
            'bg-neon-green/20 border-2 border-neon-green/50',
            'text-neon-green'
          )}
        >
          0
        </div>

        {/* Numbers grid */}
        <div className="col-span-12 grid grid-cols-12 gap-1">
          {[...Array(36)].map((_, i) => {
            const num = i + 1;
            return (
              <div
                key={num}
                className={clsx(
                  'aspect-square rounded-lg font-bold text-sm flex items-center justify-center',
                  'border-2',
                  getNumberColor(num) === 'red'
                    ? 'bg-roulette-red/30 border-roulette-red/50 text-roulette-red'
                    : 'bg-roulette-black/50 border-roulette-black/50 text-white'
                )}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
