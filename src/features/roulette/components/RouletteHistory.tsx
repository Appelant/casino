import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/config/animations.config';
import { getNumberColor } from '../utils/rouletteNumbers';

export interface RouletteHistoryProps {
  numbers: number[];
  maxDisplay?: number;
}

const colorClasses = {
  red: 'bg-roulette-red',
  black: 'bg-roulette-black',
  green: 'bg-roulette-green',
};

/**
 * Composant RouletteHistory — historique des numéros sortis
 */
export function RouletteHistory({ numbers, maxDisplay = 20 }: RouletteHistoryProps) {
  const recentNumbers = numbers.slice(0, maxDisplay);

  if (recentNumbers.length === 0) {
    return (
      <div className="text-center py-4 text-white/40">
        Aucun historique
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-2 justify-center"
    >
      {recentNumbers.map((num, index) => {
        const color = getNumberColor(num);
        return (
          <motion.div
            key={`${num}-${index}`}
            variants={staggerItem}
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center',
              'text-sm font-bold text-white shadow-md',
              colorClasses[color]
            )}
          >
            {num}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
