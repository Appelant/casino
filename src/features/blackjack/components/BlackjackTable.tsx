import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBlackjackEngine } from '../hooks/useBlackjackEngine';
import { SideBetsTable } from './SideBetsTable';
import { usePlayerStore } from '@/stores';
import { DealerHand } from './DealerHand';
import { PlayerHand, SplitHands } from './PlayerHand';
import { ActionPanel } from './ActionPanel';
import { ResultOverlay } from './ResultOverlay';
import { useToast } from '@/components/ui/ToastNotification';
import { fadeIn, staggerContainer } from '@/config/animations.config';
import { formatCurrency, formatCurrencyWithSign } from '@/utils/currency';

/**
 * Composant BlackjackTable — table de blackjack complète
 *
 * Assemble tous les sous-composants et gère le flux de jeu
 */
export function BlackjackTable() {
  // Hook engine
  const engine = useBlackjackEngine();
  const playerBalance = usePlayerStore((s) => s.balance);
  const toast = useToast();

  // State local
  const [showResult, setShowResult] = useState(false);

  // Reset au montage — sauf si une partie en cours a été restaurée depuis localStorage
  useEffect(() => {
    if (engine.status !== 'playerTurn') {
      engine.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Place les mises (principale + side bets) et distribue les cartes
  const handlePlaceBets = useCallback((mainBet: number, perfectPairsBet: number, twentyOnePlusThreeBet: number) => {
    const success = engine.placeBet(mainBet, perfectPairsBet, twentyOnePlusThreeBet);
    if (!success) {
      toast.error('Solde insuffisant', 2000);
      return;
    }
    // deal() sera appelé via useEffect quand le status passera à 'deal'
  }, [engine, toast]);

  // Distribue les cartes automatiquement après la mise
  useEffect(() => {
    if (engine.status === 'deal') {
      engine.deal();
    }
  }, [engine.status, engine.deal]);

  // Actions du joueur
  const handleHit = useCallback(() => {
    engine.hit();
  }, [engine]);

  const handleStand = useCallback(() => {
    engine.stand();
  }, [engine]);

  const handleDouble = useCallback(() => {
    engine.doubleDown();
  }, [engine]);

  const handleSplit = useCallback(() => {
    engine.split();
  }, [engine]);

  // Déclenche automatiquement le tour du dealer quand le statut passe à dealerTurn
  useEffect(() => {
    if (engine.status === 'dealerTurn') {
      const timer = setTimeout(() => {
        engine.playDealerTurn();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [engine.status, engine.playDealerTurn]);

  // Quand le résultat est disponible
  useEffect(() => {
    if (engine.outcome && engine.status === 'settle') {
      setShowResult(true);

      // Toast de résultat
      const netProfit = engine.payout - engine.currentBet;
      if (netProfit > 0) {
        toast.success(`${engine.outcome === 'blackjack' ? 'Blackjack ! ' : ''}Gain ${formatCurrencyWithSign(netProfit)}`, 4000);
      } else if (netProfit < 0) {
        toast.info(`Perte ${formatCurrency(Math.abs(netProfit))}`, 3000);
      }
    }
  }, [engine.outcome, engine.status, engine.payout, engine.currentBet, toast]);

  // Réinitialiser pour un nouveau round
  const handleReset = useCallback(() => {
    setShowResult(false);
    engine.reset();
  }, [engine]);

  // Déterminer les actions disponibles
  const playerTotal = engine.playerHand?.total ?? 0;
  const canHit = engine.status === 'playerTurn' && playerTotal < 21;
  const canStand = engine.status === 'playerTurn';
  const canDouble = engine.status === 'playerTurn' &&
    engine.playerHand?.cards.length === 2 &&
    playerTotal < 21 &&
    playerBalance >= engine.currentBet;
  // Split: uniquement avec 2 cartes de même rang, avant de tirer
  const canSplit = engine.status === 'playerTurn' &&
    engine.playerHand?.cards.length === 2 &&
    engine.playerHand.cards[0]?.rank === engine.playerHand.cards[1]?.rank;

  const isBettingPhase = engine.status === 'idle' || engine.status === 'bet';
  const isPlayingPhase = engine.status === 'playerTurn' || engine.status === 'dealerTurn' || engine.status === 'deal' || engine.status === 'settle';

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto"
    >
      {/* Result Overlay */}
      <ResultOverlay
        outcome={engine.outcome}
        payout={engine.payout}
        bet={engine.currentBet}
        isVisible={showResult}
        onDismiss={handleReset}
      />

      {/* Betting phase */}
      {isBettingPhase && (
        <div className="py-12">
          <SideBetsTable
            onPlaceBets={handlePlaceBets}
            disabled={engine.status === 'bet'}
            balance={playerBalance}
          />
        </div>
      )}

      {/* Playing phase */}
      {isPlayingPhase && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Dealer hand */}
          <DealerHand
            hand={engine.dealerHand}
            isPlaying={engine.status === 'playerTurn'}
            isRevealed={engine.status === 'dealerTurn' || engine.status === 'settle'}
          />

          {/* Player hands - split ou main unique */}
          {engine.playerHands ? (
            <SplitHands
              hands={engine.playerHands}
              activeHandIndex={engine.activeHandIndex}
            />
          ) : (
            <PlayerHand
              hand={engine.playerHand}
              isActive={engine.status === 'playerTurn'}
            />
          )}

          {/* Action panel */}
          <ActionPanel
            onHit={handleHit}
            onStand={handleStand}
            onDouble={handleDouble}
            onSplit={handleSplit}
            canHit={canHit}
            canStand={canStand}
            canDouble={canDouble}
            canSplit={canSplit}
            disabled={engine.status !== 'playerTurn'}
          />

          {/* Game status */}
          <div className="text-center text-sm text-white/40">
            {engine.status === 'playerTurn' && (
              engine.playerHands
                ? `Main ${engine.activeHandIndex + 1}/${engine.playerHands.length}`
                : "À vous de jouer"
            )}
            {engine.status === 'dealerTurn' && "Tour du dealer..."}
            {engine.status === 'settle' && "Résultat"}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
