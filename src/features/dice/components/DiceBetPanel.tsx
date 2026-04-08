/**
 * Composant DiceBetPanel — sélection du numéro et de la mise
 */

import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { DiceFace } from '@/types';
import { DiceFace as DiceFaceComponent } from './DiceFace';
import { GAME_CONFIG } from '@/config/game.config';
import { formatCurrency } from '@/utils/currency';
import { staggerContainer, staggerItem } from '@/config/animations.config';

export interface DiceBetPanelProps {
  chosenFace: DiceFace | null;
  betAmount: number;
  playerBalance: number;
  disabled: boolean;
  onChooseFace: (face: DiceFace) => void;
  onSetBet: (amount: number) => void;
}

const FACES: DiceFace[] = [1, 2, 3, 4, 5, 6];

export function DiceBetPanel({
  chosenFace,
  betAmount,
  playerBalance,
  disabled,
  onChooseFace,
  onSetBet,
}: DiceBetPanelProps) {
  const chipValues = GAME_CONFIG.CHIP_VALUES.slice(0, 6); // Jusqu'à 500 ZVC$

  return (
    <div className="space-y-6">
      {/* Sélection du numéro */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-3">Choisissez votre numéro</p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-6 gap-2"
        >
          {FACES.map((face) => (
            <motion.button
              key={face}
              variants={staggerItem}
              onClick={() => !disabled && onChooseFace(face)}
              disabled={disabled}
              aria-label={`Choisir le ${face}`}
              className={clsx(
                'flex items-center justify-center rounded-xl transition-all duration-200',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                chosenFace === face
                  ? 'ring-2 ring-neon-cyan scale-105'
                  : 'hover:scale-105 hover:opacity-90'
              )}
            >
              <DiceFaceComponent
                face={face}
                isRolling={false}
                size="sm"
                highlighted={chosenFace === face}
              />
            </motion.button>
          ))}
        </motion.div>
        {chosenFace !== null && (
          <p className="text-center text-sm text-neon-cyan mt-2">
            Face choisie : <strong>{chosenFace}</strong>
          </p>
        )}
      </div>

      {/* Sélection de la mise */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/60">Montant de la mise</p>
          <p className="text-sm font-bold text-neon-gold">{formatCurrency(betAmount)}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {chipValues.map((value) => {
            const isSelected = betAmount === value;
            const isAffordable = playerBalance >= value;
            return (
              <button
                key={value}
                onClick={() => !disabled && onSetBet(value)}
                disabled={disabled || !isAffordable}
                aria-label={`Miser ${formatCurrency(value)}`}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  isSelected
                    ? 'bg-neon-gold/30 border border-neon-gold text-neon-gold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                {formatCurrency(value)}
              </button>
            );
          })}
        </div>

        {/* All In */}
        {!disabled && playerBalance > 0 && (
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => onSetBet(playerBalance)}
              className="px-4 py-1.5 rounded-lg bg-neon-red/20 border border-neon-red/50 text-neon-red text-xs font-bold uppercase tracking-wider hover:bg-neon-red/30 transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            >
              All In — {formatCurrency(playerBalance)}
            </button>
          </div>
        )}
      </div>

      {/* Info payout */}
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/5 border border-white/10">
        <span className="text-xs text-white/40">Gain potentiel</span>
        <span className="text-sm font-bold text-neon-green">
          {formatCurrency(betAmount * GAME_CONFIG.DICE_PAYOUT)}
        </span>
      </div>
    </div>
  );
}
