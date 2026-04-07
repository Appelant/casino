/**
 * Utilitaires de formatage de la monnaie ZVC$
 *
 * Toutes les valeurs sont stockées en centimes (entiers) pour éviter
 * les problèmes de précision des floats.
 */

/**
 * Formate un montant en centimes vers une chaîne lisible.
 *
 * @param amount - Montant en centimes
 * @returns Chaîne formatée ex: "1 234 ZVC$"
 *
 * @example
 * formatCurrency(10000)     // "100 ZVC$"
 * formatCurrency(1_000_000) // "10 000 ZVC$"
 */
export function formatCurrency(amount: number): string {
  const zvc = amount / 100;
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(zvc);

  return `${formatted} ZVC$`;
}

/**
 * Formate un montant avec le signe + ou -.
 *
 * @param amount - Montant en centimes
 * @returns Chaîne formatée avec signe ex: "+500 ZVC$" ou "-100 ZVC$"
 */
export function formatCurrencyWithSign(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${formatCurrency(amount)}`;
}

/**
 * Convertit des ZVC$ (float) en centimes (entier).
 *
 * @param zvc - Montant en ZVC$
 * @returns Montant en centimes
 */
export function toCents(zvc: number): number {
  return Math.round(zvc * 100);
}

/**
 * Convertit des centimes en ZVC$ (float).
 *
 * @param cents - Montant en centimes
 * @returns Montant en ZVC$
 */
export function toZVC(cents: number): number {
  return cents / 100;
}
