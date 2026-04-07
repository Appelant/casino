/**
 * Résolution des mises de roulette — détermine les mises gagnantes
 */

import type { RouletteBet, SpinResult, BetType } from '@/types';
import { getNumberColor, RED_NUMBERS } from './rouletteNumbers';
import {
  FIRST_DOZEN, SECOND_DOZEN, THIRD_DOZEN,
  FIRST_COLUMN, SECOND_COLUMN, THIRD_COLUMN,
  EVEN_NUMBERS, ODD_NUMBERS,
  MANQUE_NUMBERS, PASSE_NUMBERS,
} from './rouletteNumbers';
import { ROULETTE_PAYOUTS } from './rouletteConstants';

/**
 * Vérifie si une mise est gagnante selon le numéro tiré
 */
function isBetWinner(bet: RouletteBet, winningNumber: number): boolean {
  // Le 0 (vert) fait perdre toutes les mises simples (rouge/noir, pair/impair, manque/passe)
  if (winningNumber === 0) {
    // Seul un plein sur le 0 gagne
    return bet.type === 'plein' && bet.numbers.includes(0);
  }

  switch (bet.type) {
    case 'plein':
      return bet.numbers.includes(winningNumber);

    case 'cheval':
    case 'transversale':
    case 'carre':
    case 'sixaine':
      // Ces mises couvrent des numéros spécifiques
      return bet.numbers.includes(winningNumber);

    case 'douzaine':
      if (bet.numbers[0] === 1) return FIRST_DOZEN.includes(winningNumber);
      if (bet.numbers[0] === 13) return SECOND_DOZEN.includes(winningNumber);
      if (bet.numbers[0] === 25) return THIRD_DOZEN.includes(winningNumber);
      return false;

    case 'colonne':
      if (bet.numbers[0] === 1) return FIRST_COLUMN.includes(winningNumber);
      if (bet.numbers[0] === 2) return SECOND_COLUMN.includes(winningNumber);
      if (bet.numbers[0] === 3) return THIRD_COLUMN.includes(winningNumber);
      return false;

    case 'rouge':
      return RED_NUMBERS.has(winningNumber);

    case 'noir':
      return !RED_NUMBERS.has(winningNumber) && winningNumber !== 0;

    case 'pair':
      return winningNumber % 2 === 0;

    case 'impair':
      return winningNumber % 2 === 1;

    case 'manque':
      return MANQUE_NUMBERS.includes(winningNumber);

    case 'passe':
      return PASSE_NUMBERS.includes(winningNumber);

    default:
      return false;
  }
}

/**
 * Calcule le gain d'une mise gagnante
 */
function calculatePayout(bet: RouletteBet): number {
  const ratio = ROULETTE_PAYOUTS[bet.type as keyof typeof ROULETTE_PAYOUTS] ?? 0;
  return bet.amount * ratio + bet.amount; // gain + mise remboursée
}

/**
 * Résout toutes les mises et retourne le résultat complet du spin
 *
 * @param bets - Toutes les mises placées
 * @param winningNumber - Numéro gagnant
 * @returns Résultat complet avec mises gagnantes/perdantes et totaux
 */
export function resolveBets(bets: RouletteBet[], winningNumber: number): SpinResult {
  const winningColor = getNumberColor(winningNumber);
  const winningBets: RouletteBet[] = [];
  const losingBets: RouletteBet[] = [];
  let totalWon = 0;
  let totalLost = 0;

  for (const bet of bets) {
    if (isBetWinner(bet, winningNumber)) {
      winningBets.push(bet);
      totalWon += calculatePayout(bet);
    } else {
      losingBets.push(bet);
      totalLost += bet.amount;
    }
  }

  return {
    winningNumber,
    winningColor,
    winningBets,
    losingBets,
    totalWon,
    totalLost,
  };
}

/**
 * Retourne les numéros couverts par un type de mise
 */
export function getNumbersForBet(type: BetType, specifier?: number | string): number[] {
  switch (type) {
    case 'plein':
      return specifier !== undefined ? [Number(specifier)] : [];

    case 'cheval':
      // Spécifié par deux numéros adjacents
      return typeof specifier === 'string'
        ? specifier.split('-').map(Number)
        : [];

    case 'transversale':
      // 3 numéros consécutifs
      return specifier !== undefined
        ? [Number(specifier), Number(specifier) + 1, Number(specifier) + 2]
        : [];

    case 'carre':
      // 4 numéros en carré
      return typeof specifier === 'string'
        ? specifier.split('-').map(Number)
        : [];

    case 'sixaine':
      // 6 numéros (2 transversales adjacentes)
      return typeof specifier === 'string'
        ? specifier.split('-').map(Number)
        : [];

    case 'douzaine':
      if (specifier === 1 || specifier === '1') return FIRST_DOZEN;
      if (specifier === 2 || specifier === '2') return SECOND_DOZEN;
      if (specifier === 3 || specifier === '3') return THIRD_DOZEN;
      return [];

    case 'colonne':
      if (specifier === 1 || specifier === '1') return FIRST_COLUMN;
      if (specifier === 2 || specifier === '2') return SECOND_COLUMN;
      if (specifier === 3 || specifier === '3') return THIRD_COLUMN;
      return [];

    case 'pair':
      return EVEN_NUMBERS;

    case 'impair':
      return ODD_NUMBERS;

    case 'rouge':
      return Array.from(RED_NUMBERS);

    case 'noir':
      return [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

    case 'manque':
      return MANQUE_NUMBERS;

    case 'passe':
      return PASSE_NUMBERS;

    default:
      return [];
  }
}
