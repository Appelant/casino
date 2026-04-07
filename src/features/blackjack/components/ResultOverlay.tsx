import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { BlackjackOutcome } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { bounceIn, slideUp } from '@/config/animations.config';

export interface ResultOverlayProps {
  outcome: BlackjackOutcome | null;
  payout: number;
  bet: number;
  isVisible: boolean;
  onDismiss: () => void;
}

const outcomeConfig: Record<BlackjackOutcome, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  win: {
    label: 'Gagné!',
    icon: '🎉',
    color: 'text-neon-green',
    bgColor: 'bg-neon-green/20',
  },
  lose: {
    label: 'Perdu',
    icon: '😔',
    color: 'text-neon-red',
    bgColor: 'bg-neon-red/20',
  },
  push: {
    label: 'Égalité',
    icon: '🤝',
    color: 'text-white',
    bgColor: 'bg-white/10',
  },
  blackjack: {
    label: 'Blackjack!',
    icon: '🃏',
    color: 'text-neon-gold',
    bgColor: 'bg-neon-gold/20',
  },
  bust: {
    label: 'Bust!',
    icon: '💥',
    color: 'text-neon-red',
    bgColor: 'bg-neon-red/20',
  },
  dealerBust: {
    label: 'Dealer Bust!',
    icon: '🎊',
    color: 'text-neon-green',
    bgColor: 'bg-neon-green/20',
  },
  surrender: {
    label: 'Abandon',
    icon: '🏳️',
    color: 'text-white/60',
    bgColor: 'bg-white/5',
  },
};

/**
 * Composant ResultOverlay — overlay de résultat du round
 */
export function ResultOverlay({
  outcome,
  payout,
  bet,
  isVisible,
  onDismiss,
}: ResultOverlayProps) {
  if (!outcome) return null;

  const config = outcomeConfig[outcome];
  const netProfit = payout - bet;
  const isWin = payout > bet;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onDismiss}
        >
          <motion.div
            variants={bounceIn}
            className={clsx(
              'px-8 py-6 rounded-2xl border-2 shadow-2xl',
              config.bgColor,
              config.color,
              'border-current',
              'max-w-sm mx-4'
            )}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-6xl"
              >
                {config.icon}
              </motion.div>

              {/* Label */}
              <div className="text-2xl font-bold">{config.label}</div>

              {/* Amount */}
              {payout > 0 && (
                <div className="text-center">
                  <div className="text-sm text-white/50">
                    {isWin ? 'Gain net' : 'Remboursement'}
                  </div>
                  <div className={clsx(
                    'text-3xl font-bold font-mono',
                    isWin ? 'text-neon-green' : 'text-white'
                  )}>
                    {formatCurrency(netProfit > 0 ? netProfit : payout)}
                  </div>
                  {outcome === 'blackjack' && (
                    <div className="text-xs text-neon-gold/70 mt-1">
                      Payout 3:2
                    </div>
                  )}
                </div>
              )}

              {/* Continue button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
                className={clsx(
                  'px-6 py-3 rounded-lg font-medium',
                  'bg-white/10 hover:bg-white/20',
                  'transition-colors'
                )}
              >
                Continuer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
