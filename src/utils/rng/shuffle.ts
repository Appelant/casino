import { secureRandomInt } from './rng';

/**
 * Algorithme de Fisher-Yates pour mélanger un tableau de manière uniforme.
 * Utilise un générateur cryptographiquement sûr (CSPRNG).
 *
 * @param array - Tableau à mélanger (modifié in-place)
 * @returns Le même tableau, mélangé
 *
 * @example
 * const cards = [1, 2, 3, 4, 5];
 * shuffle(cards); // [3, 1, 5, 2, 4] (exemple)
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    const temp = array[i]!;
    array[i] = array[j]!;
    array[j] = temp;
  }
  return array;
}

/**
 * Mélange un tableau sans le modifier (version immutable).
 *
 * @param array - Tableau à mélanger
 * @returns Nouvelle instance du tableau mélangé
 */
export function shuffleImmutable<T>(array: readonly T[]): T[] {
  return shuffle([...array]);
}
