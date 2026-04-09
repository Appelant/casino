/**
 * Composant principal — Table de jeu machine à sous
 */

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, NeonButton } from '@/components/ui';
import { usePlayerStore } from '@/stores';
import { formatCurrency } from '@/utils/currency';
import { useSlotsEngine } from '../hooks/useSlotsEngine';
import { ReelDisplay } from './ReelDisplay';
import { BetPanel } from './BetPanel';
import { ResultBanner } from './ResultBanner';
import { SYMBOL_CONFIG } from '../utils/slotsConstants';
import { PAYTABLE, SEVEN_PARTIAL_PAYOUTS } from '../utils/slotsConstants';
import { fadeIn, slideUp } from '@/config/animations.config';

export function SlotsTable() {
  const {
    status,
    currentWager,
    result,
    targetReels,
    setWager,
    placeBetAndSpin,
    reset,
    isSpinning,
    isResult,
    canSpin,
  } = useSlotsEngine();

  const playerBalance = usePlayerStore((s) => s.balance);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* ── Rouleaux ── */}
      <GlassCard className="relative p-6 md:p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-6 text-center"
        >
          <h2 className="text-3xl font-bold text-neon-gold drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
            🎰 Lucky ZVC Slots
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Alignez 3 symboles identiques pour gagner !
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={slideUp}>
          <ReelDisplay isSpinning={isSpinning} targetReels={targetReels} />
        </motion.div>

        {/* Bandeau de résultat */}
        <AnimatePresence>
          {isResult && result && (
            <ResultBanner result={result} onContinue={handleReset} />
          )}
        </AnimatePresence>
      </GlassCard>

      {/* ── Panneau de mise + bouton ── */}
      <AnimatePresence mode="wait">
        {!isSpinning && !isResult && (
          <motion.div
            key="betting"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
            className="space-y-4"
          >
            {/* Mise sélectionnée */}
            <div className="text-center">
              <span className="text-sm text-gray-400">Mise : </span>
              <span className="text-lg font-bold text-neon-cyan">
                {formatCurrency(currentWager)}
              </span>
            </div>

            {/* Jetons */}
            <BetPanel
              currentWager={currentWager}
              status={status}
              playerBalance={playerBalance}
              onSetWager={setWager}
            />

            {/* Bouton LANCER */}
            <div className="flex justify-center">
              <NeonButton
                variant="gold"
                size="xl"
                onClick={placeBetAndSpin}
                disabled={!canSpin}
                aria-label="Placer la mise et lancer les rouleaux"
                className="min-w-52"
              >
                🎰 LANCER
              </NeonButton>
            </div>
          </motion.div>
        )}

        {isResult && (
          <motion.div
            key="result-action"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
            className="flex justify-center"
          >
            <NeonButton
              variant="purple"
              size="xl"
              onClick={handleReset}
              aria-label="Nouvelle partie"
              className="min-w-52"
            >
              🔄 Nouvelle partie
            </NeonButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table des gains ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="rounded-xl border border-white/10 bg-black/20 p-4"
      >
        <h3 className="mb-3 text-center text-sm font-semibold text-gray-300">
          Table des gains
        </h3>
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 md:grid-cols-6">
          {Object.entries(SYMBOL_CONFIG).map(([symbol, config]) => (
            <div
              key={symbol}
              className="flex flex-col items-center rounded-lg bg-white/5 p-2"
            >
              <span className={`text-2xl ${config.color}`}>{config.display}</span>
              <span className="mt-1 text-gray-400">{config.label}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs sm:grid-cols-3">
          {PAYTABLE.map((rule) => (
            <div key={rule.label} className="flex justify-between rounded bg-white/5 px-2 py-1">
              <span className="text-gray-400">{rule.label}</span>
              <span className="font-bold text-neon-gold">×{rule.multiplier}</span>
            </div>
          ))}
          {SEVEN_PARTIAL_PAYOUTS.map((rule) => (
            <div key={rule.label} className="flex justify-between rounded bg-white/5 px-2 py-1">
              <span className="text-gray-400">{rule.label}</span>
              <span className="font-bold text-neon-gold">×{rule.multiplier}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
