/**
 * Types spécifiques à la machine à sous
 */

/** Symboles disponibles sur les rouleaux */
export type SlotSymbol = 'seven' | 'bar' | 'diamond' | 'bell' | 'cherry' | 'lemon';

/** Résultat des 3 rouleaux [reel1, reel2, reel3] */
export type ReelResult = [SlotSymbol, SlotSymbol, SlotSymbol];

/** Résultat d'un spin */
export interface SlotsResult {
  reels: ReelResult;
  multiplier: number;
  won: number;
  wagered: number;
  netProfit: number;
  isWin: boolean;
  winLabel: string | null;
  isJackpot: boolean;
}
