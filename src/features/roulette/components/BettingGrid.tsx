import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import type { BetType, RouletteBet } from '@/types';
import { getNumberColor, RED_NUMBERS } from '../utils/rouletteNumbers';
import { staggerContainer } from '@/config/animations.config';
import { chipPlace } from '@/config/animations.config';

export interface BettingGridProps {
  onPlaceBet: (type: BetType, numbers: number[]) => void;
  currentBets: RouletteBet[];
  disabled?: boolean;
}

/**
 * Composant BettingGrid — tapis de mise de la roulette interactif
 *
 * Layout:
 * - Zéro en haut à gauche
 * - Grille de numéros 1-36 avec couleurs
 * - Zones de paris extérieurs (2to1, douzaines, pair/impair, rouge/noir, manque/passe)
 */
export function BettingGrid({
  onPlaceBet,
  currentBets,
  disabled = false,
}: BettingGridProps) {
  // Compter les mises par zone
  const getBetCount = useCallback(
    (type: BetType, numbers: number[]) => {
      const key = `${type}-${numbers.sort().join('-')}`;
      return currentBets.filter((b) => {
        const betKey = `${b.type}-${b.numbers.sort().join('-')}`;
        return betKey === key;
      }).length;
    },
    [currentBets]
  );

  // Placer une mise
  const handleBet = useCallback(
    (type: BetType, numbers: number[]) => {
      if (!disabled) {
        onPlaceBet(type, numbers);
      }
    },
    [disabled, onPlaceBet]
  );

  // Rendu d'une case de pari
  const BetCell = ({
    type,
    numbers,
    children,
    className,
    rowSpan = 1,
    colSpan = 1,
  }: {
    type: BetType;
    numbers: number[];
    children: React.ReactNode;
    className?: string;
    rowSpan?: number;
    colSpan?: number;
  }) => {
    const count = getBetCount(type, numbers);

    return (
      <button
        onClick={() => handleBet(type, numbers)}
        disabled={disabled}
        className={clsx(
          'relative rounded-lg font-bold flex items-center justify-center',
          'border-2 transition-all duration-150',
          'hover:scale-105 hover:shadow-lg',
          disabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none',
          className
        )}
        style={{
          gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
          gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
        }}
        aria-label={`Miser sur ${children}`}
      >
        {children}
        {count > 0 && (
          <motion.div
            variants={chipPlace}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-xs font-bold text-amber-900">{count}</span>
            </div>
          </motion.div>
        )}
      </button>
    );
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative select-none"
    >
      {/* Grid container */}
      <div className="grid grid-cols-[50px_repeat(12,minmax(0,1fr))_40px] gap-1 p-3 bg-casino-surface/50 rounded-xl border border-white/10">
        {/* Zero */}
        <BetCell
          type="plein"
          numbers={[0]}
          rowSpan={3}
          className="bg-neon-green/20 border-neon-green/50 text-neon-green text-lg"
        >
          0
        </BetCell>

        {/* Numbers grid (1-36) */}
        <div className="col-span-12 grid grid-rows-3 gap-1">
          {/* Row 3: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36 */}
          <div className="grid grid-cols-12 gap-1">
            {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map((num) => (
              <BetCell
                key={num}
                type="plein"
                numbers={[num]}
                className={clsx(
                  'aspect-square text-sm',
                  getNumberColor(num) === 'red'
                    ? 'bg-roulette-red/30 border-roulette-red/50 text-roulette-red'
                    : 'bg-roulette-black/50 border-roulette-black/50 text-white'
                )}
              >
                {num}
              </BetCell>
            ))}
          </div>

          {/* Row 2: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35 */}
          <div className="grid grid-cols-12 gap-1">
            {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map((num) => (
              <BetCell
                key={num}
                type="plein"
                numbers={[num]}
                className={clsx(
                  'aspect-square text-sm',
                  getNumberColor(num) === 'red'
                    ? 'bg-roulette-red/30 border-roulette-red/50 text-roulette-red'
                    : 'bg-roulette-black/50 border-roulette-black/50 text-white'
                )}
              >
                {num}
              </BetCell>
            ))}
          </div>

          {/* Row 1: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34 */}
          <div className="grid grid-cols-12 gap-1">
            {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((num) => (
              <BetCell
                key={num}
                type="plein"
                numbers={[num]}
                className={clsx(
                  'aspect-square text-sm',
                  getNumberColor(num) === 'red'
                    ? 'bg-roulette-red/30 border-roulette-red/50 text-roulette-red'
                    : 'bg-roulette-black/50 border-roulette-black/50 text-white'
                )}
              >
                {num}
              </BetCell>
            ))}
          </div>
        </div>

        {/* Column bets (2to1) */}
        <div className="grid grid-rows-3 gap-1">
          <BetCell
            type="colonne"
            numbers={[1]}
            className="bg-white/5 border-white/20 text-white/60 text-xs"
          >
            2to1
          </BetCell>
          <BetCell
            type="colonne"
            numbers={[2]}
            className="bg-white/5 border-white/20 text-white/60 text-xs"
          >
            2to1
          </BetCell>
          <BetCell
            type="colonne"
            numbers={[3]}
            className="bg-white/5 border-white/20 text-white/60 text-xs"
          >
            2to1
          </BetCell>
        </div>
      </div>

      {/* Outside bets */}
      <div className="mt-2 grid grid-cols-[50px_repeat(12,minmax(0,1fr))_40px] gap-1">
        {/* Spacer for zero column */}
        <div />

        {/* Dozens */}
        <div className="col-span-12 grid grid-cols-3 gap-1 mb-2">
          <BetCell
            type="douzaine"
            numbers={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
            colSpan={4}
            className="h-12 bg-white/5 border-white/20 text-white/60 text-sm"
          >
            1ère 12
          </BetCell>
          <BetCell
            type="douzaine"
            numbers={[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]}
            colSpan={4}
            className="h-12 bg-white/5 border-white/20 text-white/60 text-sm"
          >
            2ème 12
          </BetCell>
          <BetCell
            type="douzaine"
            numbers={[25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]}
            colSpan={4}
            className="h-12 bg-white/5 border-white/20 text-white/60 text-sm"
          >
            3ème 12
          </BetCell>
        </div>
      </div>

      {/* Simple bets */}
      <div className="mt-1 grid grid-cols-[50px_repeat(12,minmax(0,1fr))_40px] gap-1">
        {/* Spacer */}
        <div />

        <div className="col-span-12 grid grid-cols-6 gap-1">
          <BetCell
            type="manque"
            numbers={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]}
            className="h-12 bg-white/5 border-white/20 text-white/60 text-sm"
          >
            1-18
          </BetCell>
          <BetCell
            type="pair"
            numbers={[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]}
            className="h-12 bg-white/5 border-white/20 text-white/60 text-sm"
          >
            PAIR
          </BetCell>
          <BetCell
            type="rouge"
            numbers={Array.from(RED_NUMBERS)}
            className="h-12 bg-roulette-red/30 border-roulette-red/50 text-roulette-red text-sm"
          >
            ROUGE
          </BetCell>
          <BetCell
            type="noir"
            numbers={[2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]}
            className="h-12 bg-roulette-black/50 border-roulette-black/50 text-white text-sm"
          >
            NOIR
          </BetCell>
          <BetCell
            type="impair"
            numbers={[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]}
            className="h-12 bg-white/5 border-white/20 text-white/60 text-sm"
          >
            IMPAIR
          </BetCell>
          <BetCell
            type="passe"
            numbers={[19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]}
            className="h-12 bg-white/5 border-white/20 text-white/60 text-sm"
          >
            19-36
          </BetCell>
        </div>
      </div>
    </motion.div>
  );
}
