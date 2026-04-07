/**
 * Générateur de nombres pseudo-aléatoires cryptographiquement sûr.
 * Utilise crypto.getRandomValues (CSPRNG navigateur).
 *
 * ⚠️ Math.random() est INTERDIT dans tout le projet.
 */

/**
 * Génère un float dans [0, 1) via CSPRNG navigateur.
 * @returns Nombre aléatoire dans [0, 1)
 */
export function secureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0]! / (0xFFFF_FFFF + 1);
}

/**
 * Entier aléatoire sécurisé dans [min, max] inclus.
 * @param min - Borne inférieure (inclusive)
 * @param max - Borne supérieure (inclusive)
 * @returns Entier aléatoire dans [min, max]
 * @throws RangeError si min > max
 */
export function secureRandomInt(min: number, max: number): number {
  if (min > max) {
    throw new RangeError(`min (${min}) doit être ≤ max (${max})`);
  }
  return Math.floor(secureRandom() * (max - min + 1)) + min;
}

/**
 * Float aléatoire sécurisé dans [min, max).
 * @param min - Borne inférieure (inclusive)
 * @param max - Borne supérieure (exclusive)
 * @returns Float aléatoire dans [min, max)
 */
export function secureRandomFloat(min: number, max: number): number {
  return secureRandom() * (max - min) + min;
}

/**
 * Choisit un élément aléatoire dans un tableau.
 * @param array - Tableau d'éléments
 * @returns Élément aléatoire ou undefined si tableau vide
 */
export function secureRandomChoice<T>(array: readonly T[]): T | undefined {
  if (array.length === 0) {
    return undefined;
  }
  return array[secureRandomInt(0, array.length - 1)];
}
