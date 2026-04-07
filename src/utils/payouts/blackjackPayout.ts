/**
 * Calcul des payouts pour le Blackjack
 */

import { BLACKJACK_CONFIG } from '@/features/blackjack/utils/blackjackConstants';

export type BlackjackOutcome = 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | 'dealerBust' | 'surrender';

/**
 * Calcule le payout pour un blackjack naturel (As + Figure en 2 cartes)
 * Ratio: 3:2 (1.5x la mise)
 */
export function calculateBlackjackPayout(bet: number): number {
  return bet * (1 + BLACKJACK_CONFIG.blackjackPayout);
}

/**
 * Calcule le payout pour une victoire normale
 * Ratio: 1:1 (remise de la mise + gain égal)
 */
export function calculateWinPayout(bet: number): number {
  return bet * 2;  // mise remboursée + gain
}

/**
 * Calcule le payout pour un push (égalité)
 * Remboursement de la mise
 */
export function calculatePushPayout(bet: number): number {
  return bet;  // juste la mise remboursée
}

/**
 * Calcule le payout pour un surrender (abandon)
 * Le joueur récupère 50% de sa mise
 */
export function calculateSurrenderPayout(bet: number): number {
  return bet * 0.5;
}

/**
 * Calcule le payout pour une insurance
 * Ratio: 2:1 si le dealer a blackjack
 */
export function calculateInsurancePayout(insuranceBet: number, dealerHasBlackjack: boolean): number {
  if (dealerHasBlackjack) {
    return insuranceBet * (1 + BLACKJACK_CONFIG.insurancePayout);
  }
  return 0;  // insurance perdue
}

/**
 * Calcule le payout total selon l'outcome
 */
export function calculatePayout(
  outcome: BlackjackOutcome,
  bet: number,
  insuranceBet: number = 0,
  dealerHasBlackjack: boolean = false
): number {
  let basePayout = 0;

  switch (outcome) {
    case 'blackjack':
      basePayout = calculateBlackjackPayout(bet);
      break;

    case 'win':
    case 'dealerBust':
      basePayout = calculateWinPayout(bet);
      break;

    case 'push':
      basePayout = calculatePushPayout(bet);
      break;

    case 'surrender':
      basePayout = calculateSurrenderPayout(bet);
      break;

    case 'lose':
    case 'bust':
      basePayout = 0;
      break;
  }

  // Ajouter insurance si gagnante
  if (insuranceBet > 0 && dealerHasBlackjack) {
    basePayout += calculateInsurancePayout(insuranceBet, true);
  }

  return basePayout;
}

/**
 * Calcule le profit net (gain - mises totales)
 */
export function calculateNetProfit(
  outcome: BlackjackOutcome,
  bet: number,
  insuranceBet: number = 0,
  dealerHasBlackjack: boolean = false
): number {
  const totalBet = bet + insuranceBet;
  const payout = calculatePayout(outcome, bet, insuranceBet, dealerHasBlackjack);
  return payout - totalBet;
}
