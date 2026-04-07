/**
 * Constantes pour la roulette européenne
 */

import type { RouletteLimits } from '@/types';

/**
 * Limites de mise pour la roulette
 */
export const ROULETTE_LIMITS: RouletteLimits = {
  minBet: 100,        // 1 ZVC$
  maxBet: 500000,     // 5 000 ZVC$
  maxPayout: 5000000, // 50 000 ZVC$
};

/**
 * Payouts pour chaque type de mise
 * Format: ratio "X:1" stocké comme nombre décimal
 */
export const ROULETTE_PAYOUTS = {
  plein:        35,  // 1 numéro
  cheval:       17,  // 2 numéros
  transversale: 11,  // 3 numéros
  carre:        8,   // 4 numéros
  sixaine:      5,   // 6 numéros
  colonne:      2,   // 12 numéros
  douzaine:     2,   // 12 numéros
  pair:         1,   // 18 numéros
  impair:       1,   // 18 numéros
  rouge:        1,   // 18 numéros
  noir:         1,   // 18 numéros
  manque:       1,   // 1-18
  passe:        1,   // 19-36
} as const;

/**
 * Couleurs des cases
 */
export const COLOR_RED = 'red' as const;
export const COLOR_BLACK = 'black' as const;
export const COLOR_GREEN = 'green' as const;
