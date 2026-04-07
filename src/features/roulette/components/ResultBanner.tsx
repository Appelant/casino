import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpinResult } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { bounceIn, slideUp } from '@/config/animations.config';

export interface ResultBannerProps {
  result: SpinResult | null;
  isVisible: boolean;
  onDismiss: () => void;
}

const colorClasses = {
  red: 'bg-roulette-red',
  black: 'bg-roulette-black',
  green: 'bg-roulette-green',
};

const colorLabels = {
  red: 'Rouge',
  black: 'Noir',
  green: 'Zéro',
};

/**
 * Composant ResultBanner — affichage du résultat du spin
 */
export function ResultBanner({ result, isVisible, onDismiss }: ResultBannerProps) {
  if (!result) return null;

  const isWin = result.totalWon > 0;
  const netProfit = result.totalWon - result.totalLost;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -20 }}
          className={clsx(
            'fixed top-20 left-1/2 -translate-x-1/2 z-[200]',
            'px-6 py-4 rounded-xl border-2 shadow-2xl backdrop-blur-md',
            isWin
              ? 'bg-neon-green/20 border-neon-green/50'
              : 'bg-neon-red/20 border-neon-red/50'
          )}
        >
          <div className="flex items-center gap-6">
            {/* Winning number */}
            <div className="flex items-center gap-3">
              <motion.div
                variants={bounceIn}
                className={clsx(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  'text-2xl font-bold text-white shadow-lg',
                  colorClasses[result.winningColor]
                )}
              >
                {result.winningNumber}
              </motion.div>
              <div>
                <div className="text-sm text-white/60">Numéro gagnant</div>
                <div className="text-lg font-bold">
                  {result.winningNumber} — {colorLabels[result.winningColor]}
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="text-right">
              <div className="text-sm text-white/60">
                {isWin ? 'Gain' : 'Perte'}
              </div>
              <div className={clsx(
                'text-2xl font-bold',
                isWin ? 'text-neon-green' : 'text-neon-red'
              )}>
                {isWin ? '+' : ''}{formatCurrency(netProfit)}
              </div>
              {result.totalWon > 0 && (
                <div className="text-xs text-white/40">
                  Total encaissé: {formatCurrency(result.totalWon)}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onDismiss}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
