import { useState } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/currency';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { ChipSelector } from '@/features/roulette/components/BettingChip';
import { fadeIn } from '@/config/animations.config';

export interface BettingTableProps {
  onPlaceBet: (amount: number) => void;
  disabled?: boolean;
  minBet?: number;
  maxBet?: number;
}

/**
 * Composant BettingTable — table de mise initiale du Blackjack
 *
 * Le joueur place sa mise avant la distribution des cartes
 */
export function BettingTable({
  onPlaceBet,
  disabled = false,
  minBet = 100,
  maxBet = 500000,
}: BettingTableProps) {
  const [selectedChip, setSelectedChip] = useState(500); // 5 ZVC$ par défaut
  const [currentBet, setCurrentBet] = useState(0);

  const handleAddChip = () => {
    if (currentBet + selectedChip <= maxBet) {
      setCurrentBet((prev) => prev + selectedChip);
    }
  };

  const handleRemoveChip = () => {
    if (currentBet >= selectedChip) {
      setCurrentBet((prev) => prev - selectedChip);
    }
  };

  const handleClear = () => {
    setCurrentBet(0);
  };

  const handleConfirm = () => {
    if (currentBet >= minBet) {
      onPlaceBet(currentBet);
      setCurrentBet(0);
    }
  };

  const canConfirm = currentBet >= minBet && !disabled;
  const canAddChip = currentBet + selectedChip <= maxBet && !disabled;

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <GlassCard glowColor="gold" className="p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-1">
              Placez votre mise
            </h2>
            <p className="text-sm text-white/50">
              Minimum: {formatCurrency(minBet)} — Maximum: {formatCurrency(maxBet)}
            </p>
          </div>

          {/* Current bet display */}
          <div className={clsx(
            'px-6 py-4 rounded-xl border-2 min-w-[200px] text-center',
            currentBet >= minBet
              ? 'border-neon-gold/50 bg-neon-gold/10'
              : 'border-white/10 bg-white/5'
          )}>
            <div className="text-xs text-white/50 mb-1">Mise actuelle</div>
            <div className={clsx(
              'text-2xl font-bold font-mono',
              currentBet >= minBet ? 'text-neon-gold' : 'text-white/60'
            )}>
              {formatCurrency(currentBet)}
            </div>
          </div>

          {/* Chip selector */}
          <ChipSelector
            selectedValue={selectedChip}
            onSelect={setSelectedChip}
            disabled={disabled}
          />

          {/* Add/Remove buttons */}
          <div className="flex gap-3">
            <NeonButton
              variant="cyan"
              size="sm"
              onClick={handleAddChip}
              disabled={!canAddChip}
            >
              + Ajouter
            </NeonButton>
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={handleRemoveChip}
              disabled={currentBet < selectedChip || disabled}
            >
              - Retirer
            </NeonButton>
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={currentBet === 0 || disabled}
            >
              Clear
            </NeonButton>
          </div>

          {/* Confirm button */}
          <NeonButton
            variant="gold"
            size="lg"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full"
          >
            {currentBet >= minBet
              ? `Confirmer ${formatCurrency(currentBet)}`
              : `Minimum ${formatCurrency(minBet)}`}
          </NeonButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}
