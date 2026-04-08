import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouletteEngine } from '../hooks/useRouletteEngine';
import type { BetType } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { ChipSelector } from './BettingChip';
import { BettingGrid } from './BettingGrid';
import { BetDisplay } from './BetDisplay';
import { SpinButton } from './SpinButton';
import { RouletteWheel } from './RouletteWheel';
import { ResultBanner } from './ResultBanner';
import { RouletteHistory } from './RouletteHistory';
import { StatsBadge } from './StatsBadge';
import { useToast } from '@/components/ui/ToastNotification';
import { fadeIn } from '@/config/animations.config';
import { formatCurrency, formatCurrencyWithSign } from '@/utils/currency';

/**
 * Composant RouletteTable — table de roulette complète
 *
 * Assemble tous les sous-composants et gère le flux de jeu
 */
export function RouletteTable() {
  // Hooks
  const engine = useRouletteEngine();
  const toast = useToast();

  // State local
  const [selectedChip, setSelectedChip] = useState(100); // 1 ZVC$ par défaut
  const [history, setHistory] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Démarre la phase de mises au montage
  useEffect(() => {
    engine.startBetting();
  }, []);

  // Récupérer les mises depuis l'engine
  const currentBets = engine.currentBets;
  const totalBet = currentBets.reduce((sum, b) => sum + b.amount, 0);
  const hasBets = currentBets.length > 0;

  // Gère la fin du spin
  const handleSpinComplete = useCallback((number: number) => {
    // Le numéro passé ici est celui généré dans engine.spin() et affiché par la roue
    engine.resolveSpin();
    setHistory((prev) => [number, ...prev].slice(0, 50));
    setShowResult(true);
  }, [engine]);

  // Affiche le toast après que lastResult soit mis à jour
  useEffect(() => {
    if (engine.lastResult && engine.status === 'result') {
      const netProfit = engine.lastResult.totalWon - engine.lastResult.totalLost;
      if (netProfit > 0) {
        toast.success(`Gain ${formatCurrencyWithSign(netProfit)}`, 4000);
      } else if (netProfit < 0) {
        toast.info(`Perte ${formatCurrency(Math.abs(netProfit))}`, 3000);
      }
    }
  }, [engine.lastResult, engine.status, toast]);

  // Place une mise sur le tapis
  const handlePlaceBet = useCallback((type: BetType, numbers: number[]) => {
    if (engine.status !== 'betting' && engine.status !== 'idle') return;

    const bet: import('@/types').RouletteBet = {
      id: `bet_${crypto.randomUUID()}`,
      type,
      numbers,
      amount: selectedChip,
    };

    const success = engine.placeBet(bet);
    if (!success) {
      toast.warning('Solde insuffisant', 2000);
    }
  }, [engine, selectedChip, toast]);

  // Lance le spin
  const handleSpin = useCallback(() => {
    if (!hasBets) {
      toast.warning('Placez une mise d\'abord', 2000);
      return;
    }
    engine.spin();
  }, [hasBets, engine]);

  // Réinitialise après résultat
  const handleReset = useCallback(() => {
    setShowResult(false);
    engine.reset();
    setTimeout(() => {
      engine.startBetting();
    }, 100);
  }, [engine]);

  // Stats hot/cold numbers — calculées en O(n) puis triées
  const { hotNumbers, coldNumbers } = useMemo(() => {
    const window = history.slice(0, 20);
    const counts = new Map<number, number>();
    for (const n of window) counts.set(n, (counts.get(n) ?? 0) + 1);
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return {
      hotNumbers: sorted.slice(0, 3).map(([n]) => n),
      coldNumbers: sorted.slice(-3).map(([n]) => n).reverse(),
    };
  }, [history]);

  const isBettingPhase = engine.status === 'betting' || engine.status === 'idle';

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto"
    >
      {/* Result Banner */}
      <ResultBanner
        result={engine.lastResult}
        isVisible={showResult && engine.status === 'result'}
        onDismiss={handleReset}
      />

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Wheel + History */}
        <div className="space-y-4">
          <GlassCard glowColor="purple" className="p-6">
            <div className="flex justify-center">
              <RouletteWheel
                isSpinning={engine.status === 'spinning'}
                targetNumber={engine.winningNumber}
                onSpinComplete={handleSpinComplete}
              />
            </div>
          </GlassCard>

          {/* History */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-medium text-white/60 mb-3">Historique</h3>
            <RouletteHistory numbers={history} />
          </GlassCard>

          {/* Hot/Cold stats */}
          <div className="flex gap-3">
            <StatsBadge type="hot" numbers={hotNumbers} />
            <StatsBadge type="cold" numbers={coldNumbers} />
          </div>
        </div>

        {/* Right: Betting table + Controls */}
        <div className="space-y-4">
          <GlassCard glowColor="gold" className="p-4">
            {/* Betting Grid - interactif */}
            <div className="mb-4">
              <BettingGrid
                onPlaceBet={handlePlaceBet}
                currentBets={currentBets}
                disabled={!isBettingPhase}
              />
            </div>

            {/* Chip Selector */}
            <div className="mb-4">
              <ChipSelector
                selectedValue={selectedChip}
                onSelect={setSelectedChip}
                disabled={!isBettingPhase}
              />
            </div>

            {/* Current Bets Display */}
            <div className="border-t border-white/10 pt-4">
              <BetDisplay
                bets={currentBets}
                totalBet={totalBet}
                onRemove={(id) => engine.removeBet(id)}
                onClear={engine.clearBets}
                disabled={!isBettingPhase}
              />
            </div>
          </GlassCard>

          {/* Spin Button */}
          <div className="flex justify-center">
            <SpinButton
              onClick={handleSpin}
              disabled={!hasBets || !isBettingPhase}
              isSpinning={engine.status === 'spinning'}
              totalBet={totalBet}
            />
          </div>

          {/* Game Status */}
          <div className="text-center text-sm text-white/40">
            {engine.status === 'betting' && 'Placez vos jeux'}
            {engine.status === 'spinning' && 'Rien ne va plus...'}
            {engine.status === 'result' && 'Résultat'}
            {engine.status === 'idle' && 'En attente...'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
