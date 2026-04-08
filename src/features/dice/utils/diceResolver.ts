/**
 * Logique de résolution du jeu de dés
 *
 * Si la face choisie correspond à la face obtenue → gain 6x la mise.
 * Sinon → perte de la mise.
 */

import type { DiceFace, DiceResult } from '@/types';
import { DICE_PAYOUT } from './diceConstants';

/**
 * Résout un lancer de dé et retourne le résultat.
 */
export function resolveDice(
  chosenFace: DiceFace,
  rolledFace: DiceFace,
  wagered: number
): DiceResult {
  const isWin = chosenFace === rolledFace;
  const won = isWin ? wagered * DICE_PAYOUT : 0;

  return {
    rolledFace,
    chosenFace,
    isWin,
    wagered,
    won,
    netProfit: won - wagered,
  };
}
