/**
 * Validation des actions possibles au Blackjack
 */

import type { Card, Hand } from '@/types';
import { BLACKJACK_LIMITS } from './blackjackConstants';

/**
 * Vérifie si le joueur peut doubler (double down)
 *
 * Conditions:
 * - Exactement 2 cartes dans la main
 * - Solde suffisant pour doubler la mise
 * - Double autorisé sur toutes les cartes (Vegas rules)
 */
export function canDouble(playerHand: Card[], currentBet: number, playerBalance: number): boolean {
  if (playerHand.length !== 2) {
    return false;
  }

  if (!BLACKJACK_LIMITS.doubleAny) {
    // Restrictions supplémentaires si doubleAny = false
    // (hors scope MVP Vegas rules)
    return false;
  }

  return playerBalance >= currentBet;
}

/**
 * Vérifie si le joueur peut splitter
 *
 * Conditions:
 * - Exactement 2 cartes dans la main
 * - Les deux cartes ont la même valeur (rank ou value)
 * - Nombre maximum de splits non atteint
 * - Solde suffisant pour une mise supplémentaire
 */
export function canSplit(playerHand: Card[], currentBet: number, playerBalance: number): boolean {
  if (playerHand.length !== 2) {
    return false;
  }

  const [card1, card2] = playerHand;

  // Même rank = split possible
  if (card1!.rank !== card2!.rank) {
    return false;
  }

  // Solde suffisant pour une nouvelle mise
  if (playerBalance < currentBet) {
    return false;
  }

  return true;
}

/**
 * Vérifie si le joueur peut assurer (insurance)
 *
 * Conditions:
 * - La carte visible du dealer est un As
 * - Le joueur n'a pas déjà un blackjack naturel
 */
export function canTakeInsurance(dealerUpCard: Card | null, playerHasBlackjack: boolean): boolean {
  if (!dealerUpCard) {
    return false;
  }

  // La carte du dealer doit être un As
  if (dealerUpCard.rank !== 'A') {
    return false;
  }

  // Si le joueur a déjà blackjack, pas d'insurance (le round est fini)
  if (playerHasBlackjack) {
    return false;
  }

  return true;
}

/**
 * Vérifie si le joueur peut abandonner (surrender)
 *
 * Note: Hors scope MVP, toujours false
 */
export function canSurrender(): boolean {
  return false;  // Hors scope MVP
}

/**
 * Vérifie si le joueur peut hitter (prendre une carte)
 *
 * Toujours possible si la main n'est pas bust et n'a pas 21
 */
export function canHit(hand: Hand): boolean {
  return !hand.isBust && hand.total < 21;
}

/**
 * Vérifie si le joueur peut stand (s'arrêter)
 *
 * Toujours possible (sauf si main terminée)
 */
export function canStand(hand: Hand): boolean {
  return !hand.isBust;
}

/**
 * Retourne toutes les actions valides pour le joueur
 */
export function getValidActions(
  playerHand: Hand,
  dealerUpCard: Card | null,
  currentBet: number,
  playerBalance: number
): Array<'hit' | 'stand' | 'double' | 'split' | 'insurance'> {
  const actions: Array<'hit' | 'stand' | 'double' | 'split' | 'insurance'> = [];

  if (canHit(playerHand)) {
    actions.push('hit');
  }

  if (canStand(playerHand)) {
    actions.push('stand');
  }

  if (canDouble(playerHand.cards, currentBet, playerBalance)) {
    actions.push('double');
  }

  if (canSplit(playerHand.cards, currentBet, playerBalance)) {
    actions.push('split');
  }

  if (canTakeInsurance(dealerUpCard, playerHand.isBlackjack)) {
    actions.push('insurance');
  }

  return actions;
}
