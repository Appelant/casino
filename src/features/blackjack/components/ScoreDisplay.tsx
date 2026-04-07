import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { Hand } from '@/types';
import { bounceIn } from '@/config/animations.config';

export interface ScoreDisplayProps {
  hand: Hand | null;
  label?: string;
  isBust?: boolean;
  isBlackjack?: boolean;
  showTotal?: boolean;
}

/**
 * Composant ScoreDisplay — affichage du score d'une main
 *
 * Features:
 * - Affichage du total
 * - Indication Soft/Hard
 * - Alertes Bust et Blackjack
 */
export function ScoreDisplay({
  hand,
  label,
  isBust,
  isBlackjack,
  showTotal = true,
}: ScoreDisplayProps) {
  if (!hand) return null;

  const displayBust = isBust ?? hand.isBust;
  const displayBlackjack = isBlackjack ?? hand.isBlackjack;

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs text-white/50 uppercase tracking-wider">
          {label}
        </span>
      )}

      <AnimatePresence mode="wait">
        {displayBlackjack ? (
          <motion.div
            key="blackjack"
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-bold',
              'bg-neon-gold/20 text-neon-gold border border-neon-gold/50',
              'shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            )}
          >
            BLACKJACK!
          </motion.div>
        ) : displayBust ? (
          <motion.div
            key="bust"
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-bold',
              'bg-neon-red/20 text-neon-red border border-neon-red/50',
              'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            )}
          >
            BUST!
          </motion.div>
        ) : (
          <motion.div
            key="score"
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className={clsx(
              'px-4 py-2 rounded-lg font-bold text-xl',
              'bg-white/5 border border-white/10',
              hand.isSoft && 'text-neon-cyan'
            )}
          >
            {showTotal && (
              <>
                <span className={clsx(displayBust ? 'text-neon-red' : 'text-white')}>
                  {hand.total}
                </span>
                {hand.isSoft && (
                  <span className="text-xs text-neon-cyan/70 ml-1">Soft</span>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
