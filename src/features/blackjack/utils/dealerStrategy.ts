/**
 * Stratégie du dealer selon les règles Vegas H17
 *
 * Règles:
 * - Le dealer DOIT tirer jusqu'à atteindre 17 ou plus
 * - Le dealer DOIT tirer sur Soft 17 (H17 = Hit on Soft 17)
 * - Le dealer DOIT s'arrêter sur Hard 17 ou plus
 */

import type { Card } from '@/types';
import { calculateHand } from './handCalculator';
import { BLACKJACK_CONFIG } from './blackjackConstants';

/**
 * Détermine si le dealer doit tirer une carte supplémentaire
 *
 * Règles Vegas H17:
 * - Hit si total < 17
 * - Hit si Soft 17 (total = 17 avec As compté à 11)
 * - Stand si Hard 17 ou plus (total >= 17 sans As à 11)
 */
export function dealerMustHit(cards: Card[]): boolean {
  const { total, isSoft } = calculateHand(cards);

  // Bust → ne peut plus tirer (mais la main est déjà terminée)
  if (total > 21) {
    return false;
  }

  // Total < 17 → toujours hit
  if (total < 17) {
    return true;
  }

  // Soft 17 → hit (règle H17 de Vegas)
  if (total === 17 && isSoft && BLACKJACK_CONFIG.dealerHitsSoft17) {
    return true;
  }

  // Hard 17+ → stand
  return false;
}

/**
 * Simule le tour complet du dealer
 * Tire des cartes jusqu'à ce que la stratégie indique de s'arrêter
 *
 * @param initialCards - Cartes initiales du dealer
 * @param drawCard - Fonction pour tirer une carte
 * @returns La main finale du dealer
 */
export function simulateDealerTurn(
  initialCards: Card[],
  drawCard: () => Card | undefined
): Card[] {
  const dealerCards = [...initialCards];

  // Révéler la carte cachée si présente
  const hiddenCard = dealerCards.find((c) => c.isFaceDown);
  if (hiddenCard) {
    hiddenCard.isFaceDown = false;
  }

  // Tirer des cartes tant que le dealer doit hitter
  while (dealerMustHit(dealerCards)) {
    const newCard = drawCard();
    if (!newCard) break;  // sabot vide

    newCard.isFaceDown = false;
    dealerCards.push(newCard);
  }

  return dealerCards;
}

/**
 * Retourne l'action recommandée pour le dealer (pour affichage UI)
 */
export function getDealerAction(cards: Card[]): 'hit' | 'stand' {
  return dealerMustHit(cards) ? 'hit' : 'stand';
}
