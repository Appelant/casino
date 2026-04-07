import { useState } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/currency';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { fadeIn } from '@/config/animations.config';

export interface SideBetsTableProps {
  onPlaceBets: (mainBet: number, perfectPairsBet: number, twentyOnePlusThreeBet: number) => void;
  disabled?: boolean;
  minBet?: number;
  maxBet?: number;
}

/**
 * Composant SideBetsTable — table de paris secondaires
 *
 * Side bets disponibles:
 * - Perfect Pairs: Paire parfaite sur les 2 premières cartes du joueur
 * - 21+3: Combinaison poker avec les 2 cartes joueur + carte visible du dealer
 */
export function SideBetsTable({
  onPlaceBets,
  disabled = false,
  minBet = 100,
  maxBet = 500000,
}: SideBetsTableProps) {
  const [mainBet, setMainBet] = useState(500);
  const [perfectPairsBet, setPerfectPairsBet] = useState(0);
  const [twentyOnePlusThreeBet, setTwentyOnePlusThreeBet] = useState(0);

  const totalBet = mainBet + perfectPairsBet + twentyOnePlusThreeBet;

  const handleTogglePerfectPairs = () => {
    setPerfectPairsBet((prev) => (prev === 0 ? minBet : 0));
  };

  const handleToggleTwentyOnePlusThree = () => {
    setTwentyOnePlusThreeBet((prev) => (prev === 0 ? minBet : 0));
  };

  const handleConfirm = () => {
    if (totalBet >= minBet && totalBet <= maxBet) {
      onPlaceBets(mainBet, perfectPairsBet, twentyOnePlusThreeBet);
    }
  };

  const canConfirm = totalBet >= minBet && totalBet <= maxBet && !disabled;

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <GlassCard glowColor="gold" className="p-6 max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-1">
              Table de mises
            </h2>
            <p className="text-sm text-white/50">
              Minimum: {formatCurrency(minBet)} — Maximum: {formatCurrency(maxBet)}
            </p>
          </div>

          {/* Main bet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 font-medium">Mise principale</span>
              <div className={clsx(
                'px-4 py-2 rounded-lg border-2 min-w-[120px] text-center',
                mainBet >= minBet
                  ? 'border-neon-gold/50 bg-neon-gold/10'
                  : 'border-white/10 bg-white/5'
              )}>
                <span className={clsx(
                  'text-lg font-bold font-mono',
                  mainBet >= minBet ? 'text-neon-gold' : 'text-white/60'
                )}>
                  {formatCurrency(mainBet)}
                </span>
              </div>
            </div>

            {/* Chip selector for main bet */}
            <div className="flex gap-2 justify-center flex-wrap">
              {[100, 500, 2500, 10000].map((value) => (
                <button
                  key={value}
                  onClick={() => setMainBet(value)}
                  disabled={disabled}
                  className={clsx(
                    'px-4 py-2 rounded-full border-2 font-bold text-sm transition-all',
                    'hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed',
                    mainBet === value
                      ? 'bg-neon-gold/30 border-neon-gold text-neon-gold shadow-lg'
                      : 'bg-white/5 border-white/20 text-white/70 hover:border-white/40'
                  )}
                >
                  {formatCurrency(value)}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Side Bets */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Paris secondaires
            </h3>

            {/* Perfect Pairs */}
            <div className={clsx(
              'p-4 rounded-xl border-2 transition-all cursor-pointer',
              perfectPairsBet > 0
                ? 'border-purple-400/50 bg-purple-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            )}
            onClick={handleTogglePerfectPairs}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    perfectPairsBet > 0 ? 'bg-purple-500/30' : 'bg-white/10'
                  )}>
                    <span className="text-lg">🎴</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">Perfect Pairs</div>
                    <div className="text-xs text-white/50">
                      Paire sur vos 2 cartes (5:1 à 30:1)
                    </div>
                  </div>
                </div>
                <div className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-bold font-mono',
                  perfectPairsBet > 0
                    ? 'bg-purple-500/30 text-purple-300'
                    : 'bg-white/5 text-white/40'
                )}>
                  {perfectPairsBet > 0 ? formatCurrency(perfectPairsBet) : 'Pas misé'}
                </div>
              </div>
            </div>

            {/* 21+3 */}
            <div className={clsx(
              'p-4 rounded-xl border-2 transition-all cursor-pointer',
              twentyOnePlusThreeBet > 0
                ? 'border-cyan-400/50 bg-cyan-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            )}
            onClick={handleToggleTwentyOnePlusThree}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    twentyOnePlusThreeBet > 0 ? 'bg-cyan-500/30' : 'bg-white/10'
                  )}>
                    <span className="text-lg">🃏</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">21+3</div>
                    <div className="text-xs text-white/50">
                      Vos 2 cartes + carte du dealer (5:1 à 100:1)
                    </div>
                  </div>
                </div>
                <div className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-bold font-mono',
                  twentyOnePlusThreeBet > 0
                    ? 'bg-cyan-500/30 text-cyan-300'
                    : 'bg-white/5 text-white/40'
                )}>
                  {twentyOnePlusThreeBet > 0 ? formatCurrency(twentyOnePlusThreeBet) : 'Pas misé'}
                </div>
              </div>
            </div>
          </div>

          {/* Total and Confirm */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Total des mises</span>
              <span className={clsx(
                'text-2xl font-bold font-mono',
                canConfirm ? 'text-neon-gold' : 'text-white/40'
              )}>
                {formatCurrency(totalBet)}
              </span>
            </div>

            <NeonButton
              variant="gold"
              size="lg"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="w-full"
            >
              {canConfirm
                ? `Distribuer (${formatCurrency(totalBet)})`
                : `Minimum ${formatCurrency(minBet)}`}
            </NeonButton>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
