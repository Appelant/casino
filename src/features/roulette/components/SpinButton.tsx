import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { NeonButton } from '@/components/ui/NeonButton';
import { buttonPress } from '@/config/animations.config';

export interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
  totalBet: number;
}

/**
 * Composant SpinButton — bouton pour lancer la roue
 */
export function SpinButton({ onClick, disabled, isSpinning, totalBet }: SpinButtonProps) {
  return (
    <motion.div variants={buttonPress} initial="idle" whileHover="hovered" whileTap="pressed">
      <NeonButton
        variant="gold"
        size="lg"
        onClick={onClick}
        disabled={disabled || isSpinning}
        loading={isSpinning}
        className={clsx(
          'min-w-[140px]',
          disabled && !isSpinning && 'opacity-40',
        )}
      >
        {isSpinning ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            En cours...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {totalBet > 0 ? 'Lancer' : 'Placer vos jeux'}
          </span>
        )}
      </NeonButton>
    </motion.div>
  );
}
