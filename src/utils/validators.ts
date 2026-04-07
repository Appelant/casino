/**
 * Validateurs pour les opérations de jeu
 */

import { GAME_CONFIG } from '@/config/game.config';

/**
 * Vérifie qu'une mise est valide (dans les limites et format correct).
 *
 * @param amount - Montant de la mise en centimes
 * @returns true si la mise est valide
 */
export function isBetValid(amount: number): boolean {
  return (
    Number.isInteger(amount) &&
    amount >= GAME_CONFIG.MIN_BET &&
    amount <= GAME_CONFIG.MAX_BET
  );
}

/**
 * Vérifie que le solde est suffisant pour placer une mise.
 *
 * @param balance - Solde actuel en centimes
 * @param betAmount - Montant de la mise en centimes
 * @returns true si le solde est suffisant
 */
export function isWithinBalance(balance: number, betAmount: number): boolean {
  return balance >= betAmount && betAmount > 0;
}

/**
 * Vérifie qu'une mise est dans la plage autorisée pour un type de pari donné.
 *
 * @param amount - Montant de la mise en centimes
 * @param min - Minimum autorisé pour ce type de mise
 * @param max - Maximum autorisé pour ce type de mise
 * @returns true si la mise est dans la plage
 */
export function isBetInRange(amount: number, min: number, max: number): boolean {
  return amount >= min && amount <= max;
}

/**
 * Vérifie qu'un nombre est un numéro de roulette valide (0-36).
 *
 * @param number - Numéro à vérifier
 * @returns true si le numéro est valide
 */
export function isValidRouletteNumber(number: number): boolean {
  return Number.isInteger(number) && number >= 0 && number <= 36;
}

/**
 * Vérifie qu'un tableau de numéros de roulette ne contient pas de doublons.
 *
 * @param numbers - Tableau de numéros
 * @returns true si tous les numéros sont uniques et valides
 */
export function hasUniqueRouletteNumbers(numbers: readonly number[]): boolean {
  if (numbers.length === 0) {
    return false;
  }

  const unique = new Set(numbers);
  if (unique.size !== numbers.length) {
    return false;
  }

  return numbers.every(isValidRouletteNumber);
}

/**
 * Vérifie qu'une valeur est un entier positif.
 *
 * @param value - Valeur à vérifier
 * @returns true si la valeur est un entier positif
 */
export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Vérifie qu'un string est non-vide après trim.
 *
 * @param str - String à vérifier
 * @returns true si le string est non-vide
 */
export function isNonEmptyString(str: string): boolean {
  return typeof str === 'string' && str.trim().length > 0;
}
