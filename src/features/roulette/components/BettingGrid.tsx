import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import type { BetType, RouletteBet } from '@/types';
import { getNumberColor, RED_NUMBERS, BLACK_NUMBERS, EVEN_NUMBERS, ODD_NUMBERS, MANQUE_NUMBERS, PASSE_NUMBERS } from '../utils/rouletteNumbers';
import { staggerContainer } from '@/config/animations.config';
import { chipPlace } from '@/config/animations.config';

export interface BettingGridProps {
  onPlaceBet: (type: BetType, numbers: number[]) => void;
  currentBets: RouletteBet[];
  disabled?: boolean;
}

type BetMode = 'plein' | 'cheval' | 'carre';

const MODE_INFO: Record<BetMode, { label: string; required: number; payout: string; hint: string }> = {
  plein:  { label: 'Plein',  required: 1, payout: '35:1', hint: 'Cliquez sur un numéro' },
  cheval: { label: 'Cheval', required: 2, payout: '17:1', hint: 'Cliquez sur 2 numéros' },
  carre:  { label: 'Carré',  required: 4, payout: '8:1',  hint: 'Cliquez sur 4 numéros' },
};

/**
 * BettingGrid — tapis de mise interactif
 *
 * Modes :
 * - Plein  : 1 numéro → place immédiatement
 * - Cheval : 2 numéros → accumule la sélection puis place
 * - Carré  : 4 numéros → accumule la sélection puis place
 */
export function BettingGrid({
  onPlaceBet,
  currentBets,
  disabled = false,
}: BettingGridProps) {
  const [betMode, setBetMode] = useState<BetMode>('plein');
  const [selection, setSelection] = useState<number[]>([]);

  // Compter les mises par zone
  const getBetCount = useCallback(
    (type: BetType, numbers: number[]) => {
      const key = `${type}-${[...numbers].sort((a, b) => a - b).join('-')}`;
      return currentBets.filter((b) => {
        const betKey = `${b.type}-${[...b.numbers].sort((a, b) => a - b).join('-')}`;
        return betKey === key;
      }).length;
    },
    [currentBets]
  );

  // Click sur un numéro de la grille (1-36 ou 0)
  const handleNumberClick = useCallback(
    (num: number) => {
      if (disabled) return;

      if (betMode === 'plein') {
        onPlaceBet('plein', [num]);
        return;
      }

      // Mode cheval ou carré : accumule
      const required = MODE_INFO[betMode].required;
      const next = selection.includes(num)
        ? selection.filter((n) => n !== num) // déselectionne si déjà là
        : [...selection, num];

      if (next.length === required) {
        onPlaceBet(betMode, next);
        setSelection([]);
      } else {
        setSelection(next);
      }
    },
    [betMode, selection, disabled, onPlaceBet]
  );

  // Reset selection si on change de mode
  const handleModeChange = (mode: BetMode) => {
    setBetMode(mode);
    setSelection([]);
  };

  // Click sur une mise extérieure (rouge, pair, douzaine, etc.)
  const handleOutsideBet = useCallback(
    (type: BetType, numbers: number[]) => {
      if (disabled) return;
      onPlaceBet(type, numbers);
    },
    [disabled, onPlaceBet]
  );

  // Cell pour les numéros 0-36
  const NumberCell = ({ num, className }: { num: number; className?: string }) => {
    const count = getBetCount('plein', [num]);
    const isSelected = selection.includes(num);

    return (
      <button
        onClick={() => handleNumberClick(num)}
        disabled={disabled}
        type="button"
        aria-label={`Numéro ${num}`}
        className={clsx(
          'relative rounded-lg font-bold flex items-center justify-center',
          'border-2 transition-all duration-150',
          'hover:scale-105 hover:shadow-lg',
          'cursor-pointer active:scale-95',
          disabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none',
          isSelected && 'ring-2 ring-neon-purple ring-offset-1 ring-offset-casino-surface scale-105 shadow-[0_0_16px_rgba(139,92,246,0.6)]',
          className
        )}
      >
        {num}
        {count > 0 && (
          <motion.div
            variants={chipPlace}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-[3px] border-white shadow-lg flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-900">{count}</span>
            </div>
          </motion.div>
        )}
      </button>
    );
  };

  // Cell pour les mises extérieures
  const OutsideCell = ({
    type,
    numbers,
    children,
    className,
    colSpan = 1,
  }: {
    type: BetType;
    numbers: number[];
    children: React.ReactNode;
    className?: string;
    colSpan?: number;
  }) => {
    const count = getBetCount(type, numbers);
    return (
      <button
        onClick={() => handleOutsideBet(type, numbers)}
        disabled={disabled}
        type="button"
        className={clsx(
          'relative rounded-lg font-bold flex items-center justify-center',
          'border-2 transition-all duration-150',
          'hover:scale-105 hover:shadow-lg',
          'cursor-pointer active:scale-95',
          disabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none',
          className
        )}
        style={{ gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined }}
      >
        {children}
        {count > 0 && (
          <motion.div
            variants={chipPlace}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-[3px] border-white shadow-lg flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-900">{count}</span>
            </div>
          </motion.div>
        )}
      </button>
    );
  };

  const modeInfo = MODE_INFO[betMode];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative select-none space-y-2"
    >
      {/* Sélecteur de mode */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-casino-surface/60 border border-white/10">
        {(Object.keys(MODE_INFO) as BetMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeChange(mode)}
            disabled={disabled}
            className={clsx(
              'flex-1 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all',
              betMode === mode
                ? 'bg-neon-purple/25 text-neon-purple border border-neon-purple/50 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div>{MODE_INFO[mode].label}</div>
            <div className="text-[10px] opacity-70 normal-case font-mono mt-0.5">
              {MODE_INFO[mode].payout}
            </div>
          </button>
        ))}
      </div>

      {/* Indicateur de sélection en mode cheval/carré */}
      {betMode !== 'plein' && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-xs">
          <span className="text-white/70">
            {modeInfo.hint}
            <span className="ml-2 font-mono text-neon-purple">
              ({selection.length}/{modeInfo.required})
            </span>
          </span>
          {selection.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-mono text-neon-purple">{selection.join(', ')}</span>
              <button
                type="button"
                onClick={() => setSelection([])}
                className="ml-2 text-white/40 hover:text-white"
                aria-label="Effacer la sélection"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grille principale */}
      <div className="grid grid-cols-[50px_repeat(12,minmax(0,1fr))_40px] gap-1 p-3 bg-casino-surface/50 rounded-xl border border-white/10">
        {/* Zero */}
        <button
          onClick={() => handleNumberClick(0)}
          disabled={disabled || betMode !== 'plein'}
          type="button"
          aria-label="Numéro 0"
          className={clsx(
            'relative rounded-lg font-bold flex items-center justify-center text-lg',
            'bg-neon-green/20 border-2 border-neon-green/50 text-neon-green',
            'hover:scale-105 hover:shadow-lg transition-all duration-150',
            'cursor-pointer active:scale-95',
            (disabled || betMode !== 'plein') && 'opacity-50 cursor-not-allowed hover:scale-100',
            selection.includes(0) && 'ring-2 ring-neon-purple'
          )}
          style={{ gridRow: 'span 3' }}
        >
          0
          {getBetCount('plein', [0]) > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-[3px] border-white shadow-lg flex items-center justify-center">
                <span className="text-[10px] font-bold text-amber-900">{getBetCount('plein', [0])}</span>
              </div>
            </div>
          )}
        </button>

        {/* Numbers grid (1-36) */}
        <div className="col-span-12 grid grid-rows-3 gap-1">
          {[
            [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
            [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
            [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
          ].map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-12 gap-1">
              {row.map((num) => (
                <NumberCell
                  key={num}
                  num={num}
                  className={clsx(
                    'aspect-square text-sm',
                    getNumberColor(num) === 'red'
                      ? 'bg-roulette-red/30 border-roulette-red/50 text-roulette-red'
                      : 'bg-roulette-black/50 border-roulette-black/50 text-white'
                  )}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Column bets (2to1) */}
        <div className="grid grid-rows-3 gap-1">
          <OutsideCell type="colonne" numbers={[1]} className="bg-white/5 border-white/20 text-white/60 text-xs">2to1</OutsideCell>
          <OutsideCell type="colonne" numbers={[2]} className="bg-white/5 border-white/20 text-white/60 text-xs">2to1</OutsideCell>
          <OutsideCell type="colonne" numbers={[3]} className="bg-white/5 border-white/20 text-white/60 text-xs">2to1</OutsideCell>
        </div>
      </div>

      {/* Dozens */}
      <div className="grid grid-cols-[50px_repeat(12,minmax(0,1fr))_40px] gap-1">
        <div />
        <div className="col-span-12 grid grid-cols-3 gap-1">
          <OutsideCell type="douzaine" numbers={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} colSpan={4} className="h-12 bg-white/5 border-white/20 text-white/60 text-sm">1ère 12</OutsideCell>
          <OutsideCell type="douzaine" numbers={[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]} colSpan={4} className="h-12 bg-white/5 border-white/20 text-white/60 text-sm">2ème 12</OutsideCell>
          <OutsideCell type="douzaine" numbers={[25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]} colSpan={4} className="h-12 bg-white/5 border-white/20 text-white/60 text-sm">3ème 12</OutsideCell>
        </div>
      </div>

      {/* Simple bets */}
      <div className="grid grid-cols-[50px_repeat(12,minmax(0,1fr))_40px] gap-1">
        <div />
        <div className="col-span-12 grid grid-cols-6 gap-1">
          <OutsideCell type="manque" numbers={MANQUE_NUMBERS} className="h-12 bg-white/5 border-white/20 text-white/60 text-sm">1-18</OutsideCell>
          <OutsideCell type="pair" numbers={EVEN_NUMBERS} className="h-12 bg-white/5 border-white/20 text-white/60 text-sm">PAIR</OutsideCell>
          <OutsideCell type="rouge" numbers={Array.from(RED_NUMBERS)} className="h-12 bg-roulette-red/30 border-roulette-red/50 text-roulette-red text-sm">ROUGE</OutsideCell>
          <OutsideCell type="noir" numbers={Array.from(BLACK_NUMBERS)} className="h-12 bg-roulette-black/50 border-roulette-black/50 text-white text-sm">NOIR</OutsideCell>
          <OutsideCell type="impair" numbers={ODD_NUMBERS} className="h-12 bg-white/5 border-white/20 text-white/60 text-sm">IMPAIR</OutsideCell>
          <OutsideCell type="passe" numbers={PASSE_NUMBERS} className="h-12 bg-white/5 border-white/20 text-white/60 text-sm">19-36</OutsideCell>
        </div>
      </div>
    </motion.div>
  );
}
