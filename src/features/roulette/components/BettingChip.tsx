import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/currency';
import { scaleIn, buttonPress } from '@/config/animations.config';

export interface BettingChipProps {
  value: number;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const chipColors: Record<number, string> = {
  100:       'bg-neon-purple/30 border-neon-purple text-neon-purple',
  500:       'bg-neon-cyan/30 border-neon-cyan text-neon-cyan',
  2500:      'bg-neon-gold/30 border-neon-gold text-neon-gold',
  10000:     'bg-neon-red/30 border-neon-red text-neon-red',
  50000:     'bg-neon-green/30 border-neon-green text-neon-green',
  100_000:   'bg-orange-500/30 border-orange-400 text-orange-300',
  500_000:   'bg-white/20 border-white text-white',
  1_000_000: 'bg-yellow-900/40 border-yellow-400 text-yellow-300',
};

const chipLabels: Record<number, string> = {
  100:       '1',
  500:       '5',
  2500:      '25',
  10000:     '100',
  50000:     '500',
  100_000:   '1K',
  500_000:   '5K',
  1_000_000: '10K',
};

/**
 * Composant BettingChip — jeton de mise sélectionnable
 */
export function BettingChip({
  value,
  selected = false,
  onClick,
  disabled = false,
}: BettingChipProps) {
  const colorClass = chipColors[value] || chipColors[100];
  const label = chipLabels[value] || value.toString();

  return (
    <motion.button
      variants={buttonPress}
      initial="idle"
      whileHover={disabled ? undefined : 'hovered'}
      whileTap={disabled ? undefined : 'pressed'}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'relative w-14 h-14 rounded-full border-2 flex items-center justify-center',
        'font-bold text-sm transition-all duration-200',
        'backdrop-blur-sm shadow-lg',
        colorClass,
        selected && 'ring-2 ring-white scale-110 shadow-xl',
        disabled && 'opacity-40 cursor-not-allowed grayscale',
      )}
      aria-label={`Jeton ${formatCurrency(value)}`}
    >
      {/* Inner circle decoration */}
      <div className="absolute inset-2 rounded-full border border-white/20" />

      {/* Value label */}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

/**
 * Sélecteur de jetons — affiche tous les jetons disponibles
 */
export interface ChipSelectorProps {
  selectedValue: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
}

export function ChipSelector({ selectedValue, onSelect, disabled }: ChipSelectorProps) {
  const chipValues = [100, 500, 2500, 10000, 50000, 100_000, 500_000, 1_000_000];

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex gap-3 justify-center"
    >
      {chipValues.map((value) => (
        <BettingChip
          key={value}
          value={value}
          selected={selectedValue === value}
          onClick={() => onSelect(value)}
          disabled={disabled}
        />
      ))}
    </motion.div>
  );
}
