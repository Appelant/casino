/**
 * Configuration des numéros de la roulette européenne
 */

import type { RouletteNumber, RouletteColor } from '@/types';

/**
 * Ordre des cases sur la roue européenne (sens horaire, position 0 en haut)
 * C'est l'ordre physique sur la roue, pas l'ordre numérique
 */
export const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;

/**
 * Numéros rouges (18 sur 37)
 */
export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

/**
 * Numéros noirs (18 sur 37)
 */
export const BLACK_NUMBERS = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

/**
 * Retourne la couleur d'un numéro
 */
export function getNumberColor(n: number): RouletteColor {
  if (n === 0) return 'green';
  if (RED_NUMBERS.has(n)) return 'red';
  return 'black';
}

/**
 * Vérifie si un numéro est rouge
 */
export function isRed(n: number): boolean {
  return RED_NUMBERS.has(n);
}

/**
 * Vérifie si un numéro est noir
 */
export function isBlack(n: number): boolean {
  return BLACK_NUMBERS.has(n);
}

/**
 * Retourne l'index (position) d'un numéro sur la roue
 */
export function getWheelIndex(n: number): number {
  return WHEEL_ORDER.indexOf(n as never);
}

/**
 * Crée un objet RouletteNumber complet
 */
export function createRouletteNumber(value: number): RouletteNumber {
  return {
    value,
    color: getNumberColor(value),
    index: getWheelIndex(value),
  };
}

/**
 * Génère tous les numéros de la roulette (0-36)
 */
export function getAllRouletteNumbers(): RouletteNumber[] {
  return Array.from({ length: 37 }, (_, i) => createRouletteNumber(i));
}

/**
 * Numéros de la première douzaine (1-12)
 */
export const FIRST_DOZEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Numéros de la deuxième douzaine (13-24)
 */
export const SECOND_DOZEN = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

/**
 * Numéros de la troisième douzaine (25-36)
 */
export const THIRD_DOZEN = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

/**
 * Numéros de la première colonne (1, 4, 7, ..., 34)
 */
export const FIRST_COLUMN = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

/**
 * Numéros de la deuxième colonne (2, 5, 8, ..., 35)
 */
export const SECOND_COLUMN = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];

/**
 * Numéros de la troisième colonne (3, 6, 9, ..., 36)
 */
export const THIRD_COLUMN = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

/**
 * Numéros pairs (2-36)
 */
export const EVEN_NUMBERS = Array.from({ length: 18 }, (_, i) => (i + 1) * 2);

/**
 * Numéros impairs (1-35)
 */
export const ODD_NUMBERS = Array.from({ length: 18 }, (_, i) => i * 2 + 1);

/**
 * Numéros manque (1-18)
 */
export const MANQUE_NUMBERS = Array.from({ length: 18 }, (_, i) => i + 1);

/**
 * Numéros passe (19-36)
 */
export const PASSE_NUMBERS = Array.from({ length: 18 }, (_, i) => i + 19);
