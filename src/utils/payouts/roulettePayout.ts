/**
 * Calcul des payouts pour la roulette
 */

import type { BetType } from '@/types';
import { ROULETTE_PAYOUTS } from '@/features/roulette/utils/rouletteConstants';

/**
 * Retourne le ratio de payout pour un type de mise
 *
 * @param betType - Type de mise
 * @returns Ratio "X:1" (ex: 35 pour plein, 17 pour cheval)
 */
export function getPayoutRatio(betType: BetType): number {
  return ROULETTE_PAYOUTS[betType] ?? 0;
}

/**
 * Calcule le gain total pour une mise (incluant la mise remboursée)
 *
 * @param betType - Type de mise
 * @param amount - Montant misé en centimes
 * @returns Gain total (mise + profit)
 */
export function calculateRoulettePayout(betType: BetType, amount: number): number {
  const ratio = getPayoutRatio(betType);
  return amount * (ratio + 1);
}

/**
 * Calcule le profit net (sans la mise initiale)
 *
 * @param betType - Type de mise
 * @param amount - Montant misé en centimes
 * @returns Profit net
 */
export function calculateRouletteProfit(betType: BetType, amount: number): number {
  const ratio = getPayoutRatio(betType);
  return amount * ratio;
}

/**
 * Vérifie si un payout est dans les limites acceptables
 */
export function isPayoutWithinLimits(payout: number, maxPayout: number): boolean {
  return payout <= maxPayout;
}
