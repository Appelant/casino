import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBlackjackEngine } from '../hooks/useBlackjackEngine';
import { BettingTable } from './BettingTable';
import { DealerHand } from './DealerHand';
import { PlayerHand } from './PlayerHand';
import { ActionPanel } from './ActionPanel';
import { ResultOverlay } from './ResultOverlay';
import { useToast } from '@/components/ui/ToastNotification';
import { fadeIn, staggerContainer } from '@/config/animations.config';

/**
 * Composant BlackjackTable — table de blackjack complète
 *
 * Assemble tous les sous-composants et gère le flux de jeu
 */
export function BlackjackTable() {
  // Hook engine
  const engine = useBlackjackEngine();
  const toast = useToast();

  // State local
  const [showResult, setShowResult] = useState(false);

  // Reset au montage
  useEffect(() => {
    engine.reset();
  }, []);

  // Place la mise initiale
  const handlePlaceBet = useCallback((amount: number) => {
    const success = engine.placeBet(amount);
    if (success) {
      engine.deal();
    } else {
      toast.error('Solde insuffisant', 2000);
    }
  }, [engine, toast]);

  // Actions du joueur
  const handleHit = useCallback(() => {
    engine.hit();
  }, [engine]);

  const handleStand = useCallback(() => {
    engine.stand();
    // Le tour du dealer se joue automatiquement
    setTimeout(() => {
      engine.playDealerTurn();
    }, 500);
  }, [engine]);

  const handleDouble = useCallback(() => {
    engine.doubleDown();
    // Après double, le dealer joue immédiatement
    setTimeout(() => {
      engine.playDealerTurn();
    }, 500);
  }, [engine]);

  // Quand le résultat est disponible
  useEffect(() => {
    if (engine.outcome && engine.status === 'settle') {
      setShowResult(true);

      // Toast de résultat
      const netProfit = engine.payout - engine.currentBet;
      if (netProfit > 0) {
        toast.success(`${engine.outcome === 'blackjack' ? 'Blackjack! ' : ''}Gain: ${netProfit / 100} ZVC$`, 4000);
      } else if (netProfit < 0) {
        toast.info(`Perte: ${Math.abs(netProfit) / 100} ZVC$`, 3000);
      }
    }
  }, [engine.outcome, engine.status, engine.payout, engine.currentBet, toast]);

  // Réinitialiser pour un nouveau round
  const handleReset = useCallback(() => {
    setShowResult(false);
    engine.reset();
  }, [engine]);

  // Déterminer les actions disponibles
  const canHit = engine.status === 'playerTurn' && !engine.playerHand?.isBust && engine.playerHand!.total < 21;
  const canStand = engine.status === 'playerTurn' && !engine.playerHand?.isBust;
  const canDouble = engine.status === 'playerTurn' &&
    engine.playerHand!.cards.length === 2 &&
    !engine.playerHand?.isBust;

  const isBettingPhase = engine.status === 'idle' || engine.status === 'bet';
  const isPlayingPhase = engine.status === 'playerTurn' || engine.status === 'dealerTurn';

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
          <BettingTable
            onPlaceBet={handlePlaceBet}
            disabled={engine.status === 'bet'}
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

          {/* Player hand */}
          <PlayerHand
            hand={engine.playerHand}
            isActive={engine.status === 'playerTurn'}
          />

          {/* Action panel */}
          <ActionPanel
            onHit={handleHit}
            onStand={handleStand}
            onDouble={handleDouble}
            canHit={canHit}
            canStand={canStand}
            canDouble={canDouble}
            disabled={engine.status !== 'playerTurn'}
          />

          {/* Game status */}
          <div className="text-center text-sm text-white/40">
            {engine.status === 'playerTurn' && "À vous de jouer"}
            {engine.status === 'dealerTurn' && "Tour du dealer..."}
            {engine.status === 'settle' && "Résultat"}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
