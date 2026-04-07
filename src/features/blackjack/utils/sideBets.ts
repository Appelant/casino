/**
 * Side Bets pour le Blackjack
 *
 * Perfect Pairs: La paire parfaite
 * - Mixed Pair (même rang, couleurs différentes): 5:1
 * - Colored Pair (même rang, même couleur, enseignes différentes): 10:1
 * - Perfect Pair (même rang ET même enseigne): 30:1
 *
 * 21+3: Combinaison poker avec les 2 cartes du joueur + carte visible du dealer
 * - Flush (5 cartes même enseigne): 5:1
 * - Straight (suite de 3 cartes): 10:1
 * - Three of a Kind (3 mêmes rangs): 30:1
 * - Straight Flush (suite même enseigne): 40:1
 * - Suited Trips (3 mêmes cartes): 100:1
 */

import type { Card } from '@/types';

// ============================================
// TYPES
// ============================================

export type SideBetType = 'perfectPairs' | 'twentyOnePlusThree';

export type PerfectPairsResult = 'lose' | 'mixedPair' | 'coloredPair' | 'perfectPair';
export type TwentyOnePlusThreeResult = 'lose' | 'flush' | 'straight' | 'threeOfAKind' | 'straightFlush' | 'suitedTrips';

export interface SideBetResult {
  type: SideBetType;
  result: PerfectPairsResult | TwentyOnePlusThreeResult;
  payout: number;
  won: boolean;
}

// ============================================
// PAYOUTS
// ============================================

export const PERFECT_PAIRS_PAYOUTS = {
  mixedPair: 5,      // 5:1
  coloredPair: 10,   // 10:1
  perfectPair: 30,   // 30:1
} as const;

export const TWENTY_ONE_PLUS_THREE_PAYOUTS = {
  flush: 5,
  straight: 10,
  threeOfAKind: 30,
  straightFlush: 40,
  suitedTrips: 100,
} as const;

// ============================================
// PERFECT PAIRS
// ============================================

/**
 * Vérifie si 2 cartes forment une paire et retourne le type
 */
export function evaluatePerfectPairs(card1: Card, card2: Card): PerfectPairsResult {
  // Pas la même valeur → perdu
  if (card1.rank !== card2.rank) {
    return 'lose';
  }

  // Même enseigne → Perfect Pair
  if (card1.suit === card2.suit) {
    return 'perfectPair';
  }

  // Même couleur (hearts/diamonds = rouge, clubs/spades = noir)
  const isRed1 = card1.suit === 'hearts' || card1.suit === 'diamonds';
  const isRed2 = card2.suit === 'hearts' || card2.suit === 'diamonds';

  if (isRed1 === isRed2) {
    return 'coloredPair';
  }

  // Couleurs différentes → Mixed Pair
  return 'mixedPair';
}

/**
 * Calcule le payout pour Perfect Pairs
 */
export function calculatePerfectPairsPayout(bet: number, result: PerfectPairsResult): number {
  if (result === 'lose') return 0;
  return bet * (PERFECT_PAIRS_PAYOUTS[result] + 1); // payout + mise remboursée
}

// ============================================
// 21+3
// ============================================

/**
 * Vérifie si 3 cartes forment un Flush (même enseigne)
 */
function isFlush(cards: Card[]): boolean {
  const firstSuit = cards[0]?.suit;
  return cards.every((c) => c.suit === firstSuit);
}

/**
 * Vérifie si 3 cartes forment un Straight (suite)
 * As peut être haut (A-K-Q) ou bas (A-2-3)
 */
function isStraight(cards: Card[]): boolean {
  const rankValues: Record<string, number> = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11,
    '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
  };

  const values = cards.map((c) => rankValues[c.rank] ?? 0).sort((a, b) => b - a);

  if (values.length !== 3) return false;

  const v1 = values[0]!;
  const v2 = values[1]!;
  const v3 = values[2]!;

  // Straight normal
  const isNormalStraight = v1 - v3 === 2 && v2 - v3 === 1;

  // Wheel straight (A-2-3)
  const isWheel = v1 === 14 && v2 === 3 && v3 === 2;

  return isNormalStraight || isWheel;
}

/**
 * Vérifie si 3 cartes forment un Three of a Kind (même rang)
 */
function isThreeOfAKind(cards: Card[]): boolean {
  return cards.every((c) => c.rank === cards[0]?.rank);
}

/**
 * Vérifie si 3 cartes forment un Straight Flush
 */
function isStraightFlush(cards: Card[]): boolean {
  return isFlush(cards) && isStraight(cards);
}

/**
 * Vérifie si 3 cartes sont identiques (Suited Trips)
 */
function isSuitedTrips(cards: Card[]): boolean {
  return cards.every((c) => c.rank === cards[0]?.rank && c.suit === cards[0]?.suit);
}

/**
 * Évalue la combinaison 21+3
 */
export function evaluateTwentyOnePlusThree(
  playerCard1: Card,
  playerCard2: Card,
  dealerUpCard: Card
): TwentyOnePlusThreeResult {
  const cards = [playerCard1, playerCard2, dealerUpCard];

  // Suited Trips (le plus rare)
  if (isSuitedTrips(cards)) {
    return 'suitedTrips';
  }

  // Straight Flush
  if (isStraightFlush(cards)) {
    return 'straightFlush';
  }

  // Three of a Kind
  if (isThreeOfAKind(cards)) {
    return 'threeOfAKind';
  }

  // Flush
  if (isFlush(cards)) {
    return 'flush';
  }

  // Straight
  if (isStraight(cards)) {
    return 'straight';
  }

  return 'lose';
}

/**
 * Calcule le payout pour 21+3
 */
export function calculateTwentyOnePlusThreePayout(
  bet: number,
  result: TwentyOnePlusThreeResult
): number {
  if (result === 'lose') return 0;
  return bet * (TWENTY_ONE_PLUS_THREE_PAYOUTS[result] + 1);
}

// ============================================
// API UNIFIÉE
// ============================================

/**
 * Évalue tous les side bets et retourne les résultats
 */
export function evaluateSideBets(
  playerCard1: Card,
  playerCard2: Card,
  dealerUpCard: Card,
  perfectPairsBet: number = 0,
  twentyOnePlusThreeBet: number = 0
): SideBetResult[] {
  const results: SideBetResult[] = [];

  // Perfect Pairs
  if (perfectPairsBet > 0) {
    const ppResult = evaluatePerfectPairs(playerCard1, playerCard2);
    const payout = calculatePerfectPairsPayout(perfectPairsBet, ppResult);
    results.push({
      type: 'perfectPairs',
      result: ppResult,
      payout,
      won: ppResult !== 'lose',
    });
  }

  // 21+3
  if (twentyOnePlusThreeBet > 0) {
    const t213Result = evaluateTwentyOnePlusThree(playerCard1, playerCard2, dealerUpCard);
    const payout = calculateTwentyOnePlusThreePayout(twentyOnePlusThreeBet, t213Result);
    results.push({
      type: 'twentyOnePlusThree',
      result: t213Result,
      payout,
      won: t213Result !== 'lose',
    });
  }

  return results;
}
