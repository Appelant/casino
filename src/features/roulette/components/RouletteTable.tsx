import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouletteEngine } from '../hooks/useRouletteEngine';
import { useRouletteBets } from '../hooks/useRouletteBets';
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

/**
 * Composant RouletteTable — table de roulette complète
 *
 * Assemble tous les sous-composants et gère le flux de jeu
 */
export function RouletteTable() {
  // Hooks
  const engine = useRouletteEngine();
  const { bets, totalBet, hasBets } = useRouletteBets();
  const toast = useToast();

  // State local
  const [selectedChip, setSelectedChip] = useState(100); // 1 ZVC$ par défaut
  const [history, setHistory] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Démarre la phase de mises au montage
  useEffect(() => {
    engine.startBetting();
  }, []);

  // Gère la fin du spin
  const handleSpinComplete = useCallback((number: number) => {
    engine.resolveSpin();
    setHistory((prev) => [number, ...prev].slice(0, 50));
    setShowResult(true);

    // Toast de résultat
    if (engine.lastResult) {
      const netProfit = engine.lastResult.totalWon - engine.lastResult.totalLost;
      if (netProfit > 0) {
        toast.success(`Gain: ${netProfit / 100} ZVC$`, 4000);
      } else if (netProfit < 0) {
        toast.info(`Perte: ${Math.abs(netProfit) / 100} ZVC$`, 3000);
      }
    }
  }, [engine]);

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

  // Stats hot/cold numbers
  const hotNumbers = history
    .slice(0, 20)
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .sort((a, b) => {
      const countA = history.filter((n) => n === a).length;
      const countB = history.filter((n) => n === b).length;
      return countB - countA;
    })
    .slice(0, 3);

  const coldNumbers = history
    .slice(0, 20)
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .sort((a, b) => {
      const countA = history.filter((n) => n === a).length;
      const countB = history.filter((n) => n === b).length;
      return countA - countB;
    })
    .slice(0, 3);

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
                targetNumber={engine.lastResult?.winningNumber ?? null}
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
            {/* Betting Grid (simplified for MVP - display only) */}
            <div className="mb-4">
              <BettingGrid disabled={!isBettingPhase} />
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
                bets={bets}
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
