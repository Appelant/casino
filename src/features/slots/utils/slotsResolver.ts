/**
 * Résolveur de gains pour la machine à sous ZVC
 * Détermine les mises gagnantes selon les symboles tirés
 */

import type { SlotSymbol, SlotsResult } from '@/types';
import { secureRandomInt } from '@/utils/rng/rng';
import {
  PAYTABLE,
  SEVEN_PARTIAL_PAYOUTS,
  SYMBOL_WEIGHTS,
  TOTAL_WEIGHT,
  SLOTS_MIN_BET,
  SLOTS_MAX_BET,
} from './slotsConstants';

/**
 * Vérifie si un pari est valide
 */
export function isValidBet(wagered: number): boolean {
  return Number.isInteger(wagered) && wagered >= SLOTS_MIN_BET && wagered <= SLOTS_MAX_BET;
}

/**
 * Tire un symbole aléatoire pondéré selon les poids définis
 * Utilise CSPRNG pour une distribution équitable
 */
export function spinReel(): SlotSymbol {
  const roll = secureRandomInt(1, TOTAL_WEIGHT);
  let cumulative = 0;

  for (const [symbol, weight] of Object.entries(SYMBOL_WEIGHTS)) {
    cumulative += weight;
    if (roll <= cumulative) {
      return symbol as SlotSymbol;
    }
  }

  // Fallback (ne devrait jamais arriver)
  return 'lemon';
}

/**
 * Génère le résultat complet d'un spin (3 rouleaux)
 */
export function generateSpinResult(): [SlotSymbol, SlotSymbol, SlotSymbol] {
  return [spinReel(), spinReel(), spinReel()];
}

/**
 * Compte le nombre de symboles "seven" dans le résultat
 */
function countSevens(reels: [SlotSymbol, SlotSymbol, SlotSymbol]): number {
  return reels.filter((s) => s === 'seven').length;
}

/**
 * Trouve le gain correspondant dans la table des gains
 * Retourne le premier match trouvé (ordre important)
 */
function findPaytableMatch(
  reels: [SlotSymbol, SlotSymbol, SlotSymbol]
): { multiplier: number; label: string; isJackpot?: boolean } | null {
  for (const rule of PAYTABLE) {
    const matches = rule.reels.every((symbol, i) => symbol === null || symbol === reels[i]);
    if (matches) {
      return { multiplier: rule.multiplier, label: rule.label, isJackpot: rule.isJackpot };
    }
  }
  return null;
}

/**
 * Résout le résultat d'un spin et calcule les gains
 * @param reels - Résultat des 3 rouleaux
 * @param wagered - Mise totale
 * @returns Résultat complet avec gains
 */
export function resolveSlotsSpin(
  reels: [SlotSymbol, SlotSymbol, SlotSymbol],
  wagered: number
): SlotsResult {
  // 1. Chercher un triple dans le paytable
  const paytableMatch = findPaytableMatch(reels);

  if (paytableMatch) {
    const won = wagered * paytableMatch.multiplier;
    return {
      reels,
      multiplier: paytableMatch.multiplier,
      won,
      wagered,
      netProfit: won - wagered,
      isWin: true,
      winLabel: paytableMatch.label,
      isJackpot: paytableMatch.isJackpot ?? false,
    };
  }

  // 2. Vérifier les gains partiels avec les sevens
  const sevenCount = countSevens(reels);
  if (sevenCount > 0) {
    const sevenRule = SEVEN_PARTIAL_PAYOUTS.find((r) => r.count === sevenCount);
    if (sevenRule) {
      const won = wagered * sevenRule.multiplier;
      return {
        reels,
        multiplier: sevenRule.multiplier,
        won,
        wagered,
        netProfit: won - wagered,
        isWin: true,
        winLabel: sevenRule.label,
        isJackpot: false,
      };
    }
  }

  // 3. Aucune combinaison gagnante
  return {
    reels,
    multiplier: 0,
    won: 0,
    wagered,
    netProfit: -wagered,
    isWin: false,
    winLabel: null,
    isJackpot: false,
  };
}

/**
 * Fonction principale : génère et résout un spin complet
 */
export function spinAndResolve(wagered: number): SlotsResult {
  const reels = generateSpinResult();
  return resolveSlotsSpin(reels, wagered);
}
