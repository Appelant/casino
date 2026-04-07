/**
 * Utilitaires mathématiques pour ZéroVirguleChance
 */

/**
 * Contraint une valeur dans un intervalle [min, max].
 *
 * @param value - Valeur à contraindre
 * @param min - Borne inférieure
 * @param max - Borne supérieure
 * @returns Valeur contrainte
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Arrondit un nombre à un nombre de décimales donné.
 *
 * @param value - Valeur à arrondir
 * @param decimals - Nombre de décimales (défaut: 0)
 * @returns Valeur arrondie
 */
export function roundTo(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calcule le pourcentage d'une valeur par rapport à un total.
 *
 * @param value - Valeur
 * @param total - Total de référence
 * @returns Pourcentage (0-100) ou 0 si total = 0
 */
export function percentOf(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (value / total) * 100;
}

/**
 * Convertit des cotes (odds) en probabilité.
 *
 * @param odds - Cotes au format "X:1" (ex: 35 pour 35:1)
 * @returns Probabilité en pourcentage (0-100)
 */
export function oddsToProb(odds: number): number {
  return 100 / (odds + 1);
}

/**
 * Convertit une probabilité en cotes.
 *
 * @param prob - Probabilité en pourcentage (0-100)
 * @returns Cotes au format "X:1"
 */
export function probToOdds(prob: number): number {
  if (prob <= 0 || prob >= 100) {
    return 0;
  }
  return (100 / prob) - 1;
}

/**
 * Calcule une valeur interpolée entre deux nombres.
 *
 * @param start - Valeur de départ
 * @param end - Valeur d'arrivée
 * @param t - Facteur d'interpolation (0-1)
 * @returns Valeur interpolée
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Calcule la moyenne d'un tableau de nombres.
 *
 * @param values - Tableau de nombres
 * @returns Moyenne ou 0 si tableau vide
 */
export function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
