/**
 * Composant DiceResultDisplay — affichage du résultat du lancer
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { DiceResult } from '@/types';
import { NeonButton } from '@/components/ui/NeonButton';
import { scaleIn, fadeIn } from '@/config/animations.config';
import { formatCurrencyWithSign, formatCurrency } from '@/utils/currency';

export interface DiceResultDisplayProps {
  result: DiceResult | null;
  isVisible: boolean;
  onPlayAgain: () => void;
}

export function DiceResultDisplay({
  result,
  isVisible,
  onPlayAgain,
}: DiceResultDisplayProps) {
  return (
    <AnimatePresence>
      {isVisible && result && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onPlayAgain}
        >
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full mx-4"
          >
            <div className={`
              rounded-2xl border-2 p-8 text-center
              bg-casino-surface
              ${result.isWin
                ? 'border-neon-green shadow-[0_0_40px_rgba(16,185,129,0.4)]'
                : 'border-neon-red shadow-[0_0_40px_rgba(239,68,68,0.3)]'
              }
            `}>
              {/* Emoji résultat */}
              <div className="text-6xl mb-4">
                {result.isWin ? '🎲' : '💨'}
              </div>

              {/* Titre */}
              <h2 className={`text-3xl font-bold mb-2 ${result.isWin ? 'text-neon-green' : 'text-neon-red'}`}>
                {result.isWin ? 'GAGNÉ !' : 'PERDU !'}
              </h2>

              {/* Détail */}
              <div className="space-y-1 mb-6">
                <p className="text-white/60 text-sm">
                  Vous avez misé sur le <strong className="text-white">{result.chosenFace}</strong>
                </p>
                <p className="text-white/60 text-sm">
                  Le dé a donné le <strong className={result.isWin ? 'text-neon-green' : 'text-neon-red'}>{result.rolledFace}</strong>
                </p>
              </div>

              {/* Montant */}
              <div className={`text-2xl font-bold mb-6 ${result.isWin ? 'text-neon-green' : 'text-neon-red'}`}>
                {result.isWin
                  ? `+${formatCurrency(result.won)}`
                  : formatCurrencyWithSign(result.netProfit)
                }
              </div>

              {/* Mise initiale */}
              <p className="text-xs text-white/30 mb-6">
                Mise : {formatCurrency(result.wagered)}
                {result.isWin && ` × 6 = ${formatCurrency(result.won)}`}
              </p>

              <NeonButton
                variant={result.isWin ? 'cyan' : 'purple'}
                size="lg"
                className="w-full"
                onClick={onPlayAgain}
              >
                Rejouer
              </NeonButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
