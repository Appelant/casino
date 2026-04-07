/**
 * Calcul de la valeur d'une main de Blackjack
 *
 * Règles:
 * - As vaut 11 ou 1 (selon ce qui arrange la main)
 * - Figures (J, Q, K) valent 10
 * - Bust = total > 21
 * - Soft hand = main avec un As compté à 11
 * - Blackjack naturel = As + Figure en exactement 2 cartes
 */

import type { Card, Hand } from '@/types';
import { CARD_VALUES } from './blackjackConstants';

export interface HandValue {
  total: number;
  isSoft: boolean;      // contient un As compté à 11
  isBust: boolean;      // total > 21
  isBlackjack: boolean; // As + Figure en exactement 2 cartes
}

/**
 * Calcule la valeur d'une main de Blackjack
 *
 * Algorithme:
 * 1. Compter toutes les cartes à leur valeur nominale (As = 11)
 * 2. Si total > 21 ET au moins un As → recompter cet As à 1
 * 3. Répéter jusqu'à total ≤ 21 ou plus d'As à 11
 * 4. Déterminer si la main est soft, bust, ou blackjack
 */
export function calculateHand(cards: Card[]): HandValue {
  if (cards.length === 0) {
    return { total: 0, isSoft: false, isBust: false, isBlackjack: false };
  }

  let total = 0;
  let aces = 0;

  // Étape 1: sommer toutes les cartes
  for (const card of cards) {
    const value = CARD_VALUES[card.rank] ?? 0;
    total += value;

    if (card.rank === 'A') {
      aces++;
    }
  }

  // Étape 2: recompter les As à 1 si nécessaire
  let softAces = aces;
  while (total > 21 && softAces > 0) {
    total -= 10;  // 11 → 1 = -10
    softAces--;
  }

  // Étape 3: déterminer les flags
  const isSoft = softAces > 0;  // reste au moins un As compté à 11
  const isBust = total > 21;
  const isBlackjack = cards.length === 2 && total === 21 && aces === 1;

  return { total, isSoft, isBust, isBlackjack };
}

/**
 * Calcule la valeur d'une main et retourne un objet Hand complet
 */
export function createHand(cards: Card[]): Hand {
  const value = calculateHand(cards);
  return {
    cards,
    total: value.total,
    isSoft: value.isSoft,
    isBust: value.isBust,
    isBlackjack: value.isBlackjack,
    isSplit: false,
  };
}

/**
 * Vérifie si une main est bust (dépasse 21)
 */
export function isBust(cards: Card[]): boolean {
  return calculateHand(cards).isBust;
}

/**
 * Vérifie si une main est un blackjack naturel
 */
export function isBlackjack(cards: Card[]): boolean {
  return calculateHand(cards).isBlackjack;
}

/**
 * Vérifie si une main est soft (contient un As compté à 11)
 */
export function isSoftHand(cards: Card[]): boolean {
  return calculateHand(cards).isSoft;
}

/**
 * Compare deux mains et retourne le gagnant
 * @returns 'player' | 'dealer' | 'push'
 */
export function compareHands(playerTotal: number, dealerTotal: number): 'player' | 'dealer' | 'push' {
  if (playerTotal > 21) return 'dealer';  // player bust
  if (dealerTotal > 21) return 'player';  // dealer bust
  if (playerTotal > dealerTotal) return 'player';
  if (dealerTotal > playerTotal) return 'dealer';
  return 'push';
}
