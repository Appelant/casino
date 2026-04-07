import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { RouletteBet, BetType } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { fadeIn, staggerContainer, staggerItem } from '@/config/animations.config';

export interface BetDisplayProps {
  bets: RouletteBet[];
  totalBet: number;
  onRemove: (betId: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

const betLabels: Record<BetType, string> = {
  plein: 'Plein',
  cheval: 'Cheval',
  transversale: 'Transversale',
  carre: 'Carré',
  sixaine: 'Sixaine',
  colonne: 'Colonne',
  douzaine: 'Douzaine',
  pair: 'Pair',
  impair: 'Impair',
  rouge: 'Rouge',
  noir: 'Noir',
  manque: 'Manque',
  passe: 'Passe',
};

/**
 * Composant BetDisplay — affichage des mises actuelles
 */
export function BetDisplay({
  bets,
  totalBet,
  onRemove,
  onClear,
  disabled = false,
}: BetDisplayProps) {
  if (bets.length === 0) {
    return (
      <div className="text-center py-4 text-white/40">
        Aucune mise placée
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {/* Header avec total et bouton clear */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">
          Total misé:{' '}
          <span className="font-bold text-neon-gold">{formatCurrency(totalBet)}</span>
        </span>
        <motion.button
          whileHover={disabled ? undefined : { scale: 1.05 }}
          whileTap={disabled ? undefined : { scale: 0.95 }}
          onClick={onClear}
          disabled={disabled || bets.length === 0}
          className="text-xs text-white/40 hover:text-neon-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Tout effacer
        </motion.button>
      </div>

      {/* Liste des mises */}
      <motion.div
        variants={staggerContainer}
        className="flex flex-wrap gap-2"
      >
        <AnimatePresence>
          {bets.map((bet) => (
            <motion.div
              key={bet.id}
              variants={staggerItem}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.8 }}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                'bg-white/5 border border-white/10'
              )}
            >
              <div>
                <span className="text-xs text-white/60">
                  {betLabels[bet.type]}
                </span>
                <div className="text-xs font-mono text-white/40">
                  {bet.numbers.length <= 2
                    ? bet.numbers.join('-')
                    : `${bet.numbers.length} numéros`}
                </div>
              </div>
              <span className="font-mono text-sm text-neon-gold">
                {formatCurrency(bet.amount)}
              </span>
              <button
                onClick={() => onRemove(bet.id)}
                disabled={disabled}
                className="p-0.5 rounded hover:bg-white/10 transition-colors disabled:opacity-40"
                aria-label="Supprimer la mise"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
