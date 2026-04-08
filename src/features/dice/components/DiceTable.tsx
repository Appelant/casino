/**
 * Composant DiceTable — table principale du jeu de dés
 *
 * Orchestre la FSM du dé et tous les sous-composants.
 */

import { useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDiceEngine } from '../hooks/useDiceEngine';
import { DiceFace } from './DiceFace';
import { DiceBetPanel } from './DiceBetPanel';
import { DiceResultDisplay } from './DiceResultDisplay';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { usePlayerStore } from '@/stores';
import { useToast } from '@/components/ui/ToastNotification';
import { fadeIn } from '@/config/animations.config';
import { formatCurrencyWithSign } from '@/utils/currency';
import { prefersReducedMotion } from '@/config/animations.config';
import { DICE_ROLL_DURATION_MS, DICE_ROLL_DURATION_REDUCED_MS } from '../utils/diceConstants';
import type { DiceFace as DiceFaceType } from '@/types';

export function DiceTable() {
  const engine = useDiceEngine();
  const toast = useToast();
  const playerBalance = usePlayerStore((s) => s.balance);
  const reduced = prefersReducedMotion();

  // Démarre la phase de mises au montage
  useEffect(() => {
    engine.startBetting();
  }, []);

  // Lance le dé et planifie la résolution après l'animation
  const handleRoll = useCallback(() => {
    if (engine.chosenFace === null) {
      toast.warning('Choisissez un numéro d\'abord', 2000);
      return;
    }
    if (playerBalance < engine.betAmount) {
      toast.warning('Solde insuffisant', 2000);
      return;
    }

    engine.roll();
  }, [engine, playerBalance, toast]);

  // Affiche un toast au résultat
  useEffect(() => {
    if (engine.lastResult && engine.status === 'result') {
      const { netProfit, isWin } = engine.lastResult;
      if (isWin) {
        toast.success(`Gagné ! ${formatCurrencyWithSign(netProfit)}`, 4000);
      } else {
        toast.info(`Perdu ! ${formatCurrencyWithSign(netProfit)}`, 3000);
      }
    }
  }, [engine.lastResult, engine.status, toast]);

  const handlePlayAgain = useCallback(() => {
    engine.reset();
    setTimeout(() => engine.startBetting(), 100);
  }, [engine]);

  // Ref pour toujours avoir la dernière version de resolveRoll (évite la closure périmée du setTimeout)
  const resolveRollRef = useRef(engine.resolveRoll);
  resolveRollRef.current = engine.resolveRoll;

  // Démarre le timer quand le lancer commence — résout après la durée de l'animation
  useEffect(() => {
    if (engine.status !== 'rolling') return;
    const duration = reduced ? DICE_ROLL_DURATION_REDUCED_MS : DICE_ROLL_DURATION_MS;
    const timer = setTimeout(() => {
      resolveRollRef.current();
    }, duration);
    return () => clearTimeout(timer);
  }, [engine.status, reduced]);

  const isRolling = engine.status === 'rolling';
  const isBetting = engine.status === 'betting' || engine.status === 'idle';
  const canRoll = isBetting && engine.chosenFace !== null && playerBalance >= engine.betAmount;

  // Face à afficher : la face roulée si disponible, sinon la face choisie ou 1 par défaut
  const displayFace: DiceFaceType = engine.rolledFace ?? engine.chosenFace ?? 1;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto"
    >
      {/* Overlay résultat */}
      <DiceResultDisplay
        result={engine.lastResult}
        isVisible={engine.status === 'result'}
        onPlayAgain={handlePlayAgain}
      />

      <div className="space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-1">
            Jeu du <span className="text-neon-cyan">Dé</span>
          </h1>
          <p className="text-white/40 text-sm">
            Choisissez une face — gagnez 6× si le dé tombe dessus
          </p>
        </div>

        {/* Zone principale : le dé */}
        <GlassCard glowColor="cyan" className="p-8 flex flex-col items-center gap-6">
          {/* Dé animé */}
          <DiceFace
            face={displayFace}
            isRolling={isRolling}
            size="lg"
          />

          {/* Statut */}
          <div className="text-center text-sm text-white/50">
            {isBetting && engine.chosenFace === null && 'Choisissez un numéro ci-dessous'}
            {isBetting && engine.chosenFace !== null && `Prêt à lancer sur le ${engine.chosenFace}`}
            {isRolling && (
              <span className="text-neon-cyan animate-pulse">Lancement en cours...</span>
            )}
          </div>
        </GlassCard>

        {/* Panneau de mise */}
        <GlassCard glowColor="gold" className="p-6">
          <DiceBetPanel
            chosenFace={engine.chosenFace}
            betAmount={engine.betAmount}
            playerBalance={playerBalance}
            disabled={!isBetting}
            onChooseFace={engine.chooseFace}
            onSetBet={engine.setBetAmount}
          />
        </GlassCard>

        {/* Bouton lancer */}
        <div className="flex justify-center">
          <NeonButton
            variant="cyan"
            size="xl"
            onClick={handleRoll}
            disabled={!canRoll || isRolling}
            loading={isRolling}
            aria-label="Lancer le dé"
            className="min-w-48"
          >
            {isRolling ? 'Lancement...' : '🎲 Lancer le dé'}
          </NeonButton>
        </div>

        {/* Message d'erreur */}
        {engine.error && (
          <p className="text-center text-sm text-neon-red">{engine.error}</p>
        )}
      </div>
    </motion.div>
  );
}
