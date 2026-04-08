/**
 * Types spécifiques au jeu de dés
 */

/** Une face du dé (1 à 6) */
export type DiceFace = 1 | 2 | 3 | 4 | 5 | 6;

/** Mise du joueur sur un numéro */
export interface DiceBet {
  chosenFace: DiceFace;
  amount: number;
}

/** Résultat d'un lancer de dé */
export interface DiceResult {
  rolledFace: DiceFace;
  chosenFace: DiceFace;
  isWin: boolean;
  wagered: number;
  won: number;
  netProfit: number;
}
