/**
 * Hook pour gérer les actions du joueur au Blackjack
 */

import { useCallback } from 'react';
import type { Card, Hand } from '@/types';
import { createHand } from '../utils/handCalculator';
import {
  canDouble,
  canSplit,
  canHit,
  canStand,
  getValidActions,
} from '../utils/actionValidator';

/**
 * Hook pour gérer les actions possibles du joueur
 *
 * @param playerHand - Main actuelle du joueur
 * @param dealerUpCard - Carte visible du dealer
 * @param currentBet - Mise actuelle
 * @param playerBalance - Solde du joueur
 * @returns Actions valides et callbacks pour les exécuter
 */
export function useBlackjackActions(
  playerHand: Hand,
  dealerUpCard: Card | null,
  currentBet: number,
  playerBalance: number
) {
  /**
   * Vérifie si le joueur peut hitter
   */
  const canHitAction = useCallback(() => {
    return canHit(playerHand);
  }, [playerHand]);

  /**
   * Vérifie si le joueur peut stand
   */
  const canStandAction = useCallback(() => {
    return canStand(playerHand);
  }, [playerHand]);

  /**
   * Vérifie si le joueur peut doubler
   */
  const canDoubleAction = useCallback(() => {
    return canDouble(playerHand.cards, currentBet, playerBalance);
  }, [playerHand.cards, currentBet, playerBalance]);

  /**
   * Vérifie si le joueur peut splitter
   */
  const canSplitAction = useCallback(() => {
    return canSplit(playerHand.cards, currentBet, playerBalance);
  }, [playerHand.cards, currentBet, playerBalance]);

  /**
   * Retourne toutes les actions valides
   */
  const validActions = useCallback(() => {
    return getValidActions(playerHand, dealerUpCard, currentBet, playerBalance);
  }, [playerHand, dealerUpCard, currentBet, playerBalance]);

  /**
   * Ajoute une carte à la main (pour hit)
   */
  const hit = useCallback((card: Card): Hand => {
    const newCards = [...playerHand.cards, card];
    return createHand(newCards);
  }, [playerHand.cards]);

  /**
   * Double: ajoute une carte et termine le tour
   */
  const double = useCallback((card: Card): Hand => {
    const newCards = [...playerHand.cards, card];
    return createHand(newCards);
  }, [playerHand.cards]);

  /**
   * Split: sépare la main en deux mains distinctes
   * Retourne deux nouvelles mains
   */
  const split = useCallback((secondCard: Card): [Hand, Hand] => {
    if (playerHand.cards.length !== 2) {
      throw new Error('Split impossible: la main doit avoir exactement 2 cartes');
    }

    const card1 = playerHand.cards[0]!;
    const card2 = playerHand.cards[1]!;
    const hand1 = createHand([card1, secondCard]);
    const hand2 = createHand([card2, secondCard]);

    return [hand1, hand2];
  }, [playerHand.cards]);

  return {
    canHit: canHitAction,
    canStand: canStandAction,
    canDouble: canDoubleAction,
    canSplit: canSplitAction,
    validActions,
    hit,
    double,
    split,
  };
}
