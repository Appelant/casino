import { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/utils/currency';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { BettingChip } from '@/features/roulette/components/BettingChip';
import { fadeIn } from '@/config/animations.config';

export interface SideBetsTableProps {
  onPlaceBets: (mainBet: number, perfectPairsBet: number, twentyOnePlusThreeBet: number) => void;
  disabled?: boolean;
  minBet?: number;
  maxBet?: number;
  balance?: number;
}

const CHIP_VALUES = [100, 500, 2500, 10000, 50000, 100_000, 500_000, 1_000_000] as const;

interface BetSectionProps {
  label: string;
  icon: string;
  amount: number;
  color: 'gold' | 'purple' | 'cyan';
  enabled?: boolean;
  onToggle?: () => void;
  onAddChip: (value: number) => void;
  onClear: () => void;
  disabled: boolean;
  maxBet: number;
  description?: string;
}

const colorMap = {
  gold:   { border: 'border-neon-gold/50',   bg: 'bg-neon-gold/10',   text: 'text-neon-gold',   badge: 'bg-neon-gold/20 text-neon-gold',   toggle: 'bg-neon-gold' },
  purple: { border: 'border-neon-purple/50', bg: 'bg-neon-purple/10', text: 'text-neon-purple', badge: 'bg-neon-purple/20 text-neon-purple', toggle: 'bg-neon-purple' },
  cyan:   { border: 'border-neon-cyan/50',   bg: 'bg-neon-cyan/10',   text: 'text-neon-cyan',   badge: 'bg-neon-cyan/20 text-neon-cyan',   toggle: 'bg-neon-cyan' },
};

function BetSection({
  label, icon, amount, color, enabled, onToggle, onAddChip, onClear, disabled, maxBet, description,
}: BetSectionProps) {
  const isSideBet = onToggle !== undefined;
  const isActive = isSideBet ? enabled : true;
  const c = colorMap[color];

  return (
    <div className={clsx(
      'rounded-2xl border-2 transition-all duration-300',
      isActive ? `${c.border} ${c.bg}` : 'border-white/10 bg-white/[0.03]',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="font-bold text-white text-sm">{label}</div>
            {description && (
              <div className="text-xs text-white/40 mt-0.5">{description}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Bet amount badge */}
          <div className={clsx(
            'px-3 py-1.5 rounded-xl text-sm font-bold font-mono transition-all',
            isActive && amount > 0 ? c.badge : 'bg-white/5 text-white/30',
          )}>
            {isActive && amount > 0 ? formatCurrency(amount) : isSideBet ? '—' : '0 ZVC$'}
          </div>

          {/* Toggle for side bets */}
          {isSideBet && (
            <button
              onClick={onToggle}
              disabled={disabled}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-all duration-300',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                enabled ? c.toggle : 'bg-white/20',
              )}
              aria-label={enabled ? `Désactiver ${label}` : `Activer ${label}`}
            >
              <div className={clsx(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300',
                enabled ? 'left-5' : 'left-0.5',
              )} />
            </button>
          )}
        </div>
      </div>

      {/* Chips + clear — toujours visible pour mise principale, sinon selon enabled */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Chips */}
              <div className="flex gap-2 flex-wrap">
                {CHIP_VALUES.map((v) => (
                  <BettingChip
                    key={v}
                    value={v}
                    onClick={() => onAddChip(v)}
                    disabled={disabled || amount + v > maxBet}
                  />
                ))}
              </div>

              {/* Clear */}
              {amount > 0 && (
                <button
                  onClick={onClear}
                  disabled={disabled}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2 disabled:opacity-40"
                >
                  Effacer la mise
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SideBetsTable({
  onPlaceBets,
  disabled = false,
  minBet = 100,
  maxBet = Number.MAX_SAFE_INTEGER,
  balance = 0,
}: SideBetsTableProps) {
  const [mainBet, setMainBet] = useState(0);
  const [perfectPairsBet, setPerfectPairsBet] = useState(0);
  const [twentyOnePlusThreeBet, setTwentyOnePlusThreeBet] = useState(0);
  const [ppEnabled, setPpEnabled] = useState(false);
  const [p3Enabled, setP3Enabled] = useState(false);

  const totalBet = mainBet + perfectPairsBet + twentyOnePlusThreeBet;
  const canConfirm = mainBet >= minBet && totalBet <= maxBet && !disabled;

  const addChip = (setter: React.Dispatch<React.SetStateAction<number>>, current: number, value: number) => {
    if (current + value <= maxBet) setter(current + value);
  };

  const handleTogglePP = () => {
    setPpEnabled((v) => {
      if (v) setPerfectPairsBet(0);
      return !v;
    });
  };

  const handleToggleP3 = () => {
    setP3Enabled((v) => {
      if (v) setTwentyOnePlusThreeBet(0);
      return !v;
    });
  };

  const handleConfirm = () => {
    if (canConfirm) {
      onPlaceBets(mainBet, perfectPairsBet, twentyOnePlusThreeBet);
    }
  };

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="w-full max-w-lg mx-auto">
      <GlassCard glowColor="gold" className="p-5 space-y-4">

        {/* Title */}
        <div className="text-center pb-1">
          <h2 className="text-lg font-bold text-white tracking-wide">Table de mises</h2>
          <p className="text-xs text-white/40 mt-0.5">
            Min {formatCurrency(minBet)} · Max {formatCurrency(maxBet)}
          </p>
        </div>

        {/* Mise principale */}
        <BetSection
          label="Mise principale"
          icon="🎰"
          amount={mainBet}
          color="gold"
          onAddChip={(v) => addChip(setMainBet, mainBet, v)}
          onClear={() => setMainBet(0)}
          disabled={disabled}
          maxBet={maxBet}
        />

        {/* All In */}
        {!disabled && balance > 0 && (
          <div className="flex justify-center -mt-1">
            <button
              onClick={() => setMainBet(balance)}
              className="px-4 py-1.5 rounded-lg bg-neon-red/20 border border-neon-red/50 text-neon-red text-xs font-bold uppercase tracking-wider hover:bg-neon-red/30 transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            >
              🔴 All In — {formatCurrency(balance)}
            </button>
          </div>
        )}

        {/* Séparateur paris secondaires */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30 uppercase tracking-widest">Paris secondaires</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Perfect Pairs */}
        <BetSection
          label="Perfect Pairs"
          icon="🎴"
          description="Paire sur vos 2 cartes · 5:1 à 30:1"
          amount={perfectPairsBet}
          color="purple"
          enabled={ppEnabled}
          onToggle={handleTogglePP}
          onAddChip={(v) => addChip(setPerfectPairsBet, perfectPairsBet, v)}
          onClear={() => setPerfectPairsBet(0)}
          disabled={disabled}
          maxBet={maxBet}
        />

        {/* 21+3 */}
        <BetSection
          label="21+3"
          icon="🃏"
          description="Vos 2 cartes + dealer · 5:1 à 100:1"
          amount={twentyOnePlusThreeBet}
          color="cyan"
          enabled={p3Enabled}
          onToggle={handleToggleP3}
          onAddChip={(v) => addChip(setTwentyOnePlusThreeBet, twentyOnePlusThreeBet, v)}
          onClear={() => setTwentyOnePlusThreeBet(0)}
          disabled={disabled}
          maxBet={maxBet}
        />

        {/* Total + Deal */}
        <div className="pt-2 space-y-3 border-t border-white/10">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-white/50">Total</span>
            <span className={clsx(
              'text-xl font-bold font-mono transition-colors',
              canConfirm ? 'text-neon-gold' : totalBet === 0 ? 'text-white/20' : 'text-white/60',
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
            {mainBet === 0
              ? 'Placez une mise principale'
              : mainBet < minBet
              ? `Minimum ${formatCurrency(minBet)}`
              : `Distribuer · ${formatCurrency(totalBet)}`}
          </NeonButton>
        </div>

      </GlassCard>
    </motion.div>
  );
}
