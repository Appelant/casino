/**
 * Logique de multiplicateur pour Mines
 *
 * Formule combinatoire — identique aux casinos crypto (Stake, etc.)
 *
 * Probabilité de révéler k cases sûres sans mine :
 *   P(k, m) = ∏(i=0→k-1) [ (25 - m - i) / (25 - i) ]
 *
 * Multiplicateur :
 *   multiplier(k, m) = (1 / P(k, m)) × (1 - HOUSE_EDGE)
 */

export const GRID_SIZE = 25;
export const MINES_MIN = 1;
export const MINES_MAX = 24;
export const HOUSE_EDGE = 0.01; // 1 %

/**
 * Probabilité de survie après k révélations sûres avec m mines.
 *
 * @param mineCount - Nombre de mines (1–24)
 * @param revealedSafe - Cases sûres déjà révélées (0–24)
 * @returns Probabilité dans ]0, 1]
 */
export function survivalProbability(mineCount: number, revealedSafe: number): number {
  const safeCount = GRID_SIZE - mineCount;

  if (revealedSafe === 0) return 1;
  if (revealedSafe > safeCount) return 0;

  let prob = 1;
  for (let i = 0; i < revealedSafe; i++) {
    prob *= (safeCount - i) / (GRID_SIZE - i);
  }
  return prob;
}

/**
 * Multiplicateur pour k cases sûres révélées avec m mines.
 *
 * Retourne 1.0 si aucune case révélée (pas encore de gain).
 *
 * @param mineCount - Nombre de mines
 * @param revealedSafe - Cases sûres révélées
 * @returns Multiplicateur arrondi à 4 décimales
 */
export function calcMultiplier(mineCount: number, revealedSafe: number): number {
  if (revealedSafe === 0) return 1.0;

  const prob = survivalProbability(mineCount, revealedSafe);
  if (prob <= 0) return 0;

  const fair = 1 / prob;
  return Math.round(fair * (1 - HOUSE_EDGE) * 10_000) / 10_000;
}

/**
 * Calcule le payout en centimes.
 *
 * @param wager - Mise en centimes
 * @param multiplier - Multiplicateur courant
 * @returns Gain total en centimes (arrondi à l'entier)
 */
export function calcPayout(wager: number, multiplier: number): number {
  return Math.floor(wager * multiplier);
}

/**
 * Valide les paramètres d'une partie.
 *
 * @returns null si valide, message d'erreur sinon
 */
export function validateMinesParams(
  mineCount: number,
  wager: number,
  balance: number
): string | null {
  if (!Number.isInteger(mineCount) || mineCount < MINES_MIN || mineCount > MINES_MAX) {
    return `Le nombre de mines doit être entre ${MINES_MIN} et ${MINES_MAX}`;
  }
  if (!Number.isInteger(wager) || wager <= 0) {
    return 'La mise doit être un entier positif';
  }
  if (wager > balance) {
    return 'Solde insuffisant';
  }
  return null;
}

/**
 * Tableau précalculé : pour chaque (mineCount, revealedSafe), donne le multiplicateur.
 * Utile pour afficher rapidement les progressions côté client.
 *
 * @param mineCount - Nombre de mines
 * @returns Tableau indexé par nombre de cases révélées (0 → safeCount)
 */
export function buildMultiplierTable(mineCount: number): number[] {
  const safeCount = GRID_SIZE - mineCount;
  const table: number[] = [];
  for (let k = 0; k <= safeCount; k++) {
    table.push(calcMultiplier(mineCount, k));
  }
  return table;
}
