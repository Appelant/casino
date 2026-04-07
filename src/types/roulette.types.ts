/**
 * Couleurs de la roulette européenne
 */
export type RouletteColor = 'red' | 'black' | 'green';

/**
 * Types de mises disponibles à la roulette
 */
export type BetType =
  | 'plein'           // 1 numéro (35:1)
  | 'cheval'          // 2 numéros adjacents (17:1)
  | 'transversale'    // 3 numéros (11:1)
  | 'carre'           // 4 numéros (8:1)
  | 'sixaine'         // 6 numéros (5:1)
  | 'colonne'         // 12 numéros (2:1)
  | 'douzaine'        // 12 numéros (2:1)
  | 'pair'            // 18 numéros (1:1)
  | 'impair'          // 18 numéros (1:1)
  | 'rouge'           // 18 numéros (1:1)
  | 'noir'            // 18 numéros (1:1)
  | 'manque'          // 1-18 (1:1)
  | 'passe';          // 19-36 (1:1)

/**
 * Structure d'un numéro de roulette
 */
export interface RouletteNumber {
  value:   number;
  color:   RouletteColor;
  index:   number; // position sur la roue (0-36)
}

/**
 * Mise placée par le joueur
 */
export interface RouletteBet {
  id:        string;
  type:      BetType;
  numbers:   number[]; // numéros couverts par cette mise
  amount:    number;   // en centimes ZVC
  position?: {         // position sur le tapis (pour affichage)
    x: number;
    y: number;
  };
}

/**
 * Résultat d'un spin
 */
export interface SpinResult {
  winningNumber: number;
  winningColor:  RouletteColor;
  winningBets:   RouletteBet[];
  losingBets:    RouletteBet[];
  totalWon:      number;
  totalLost:     number;
}

/**
 * Configuration des limites de mise
 */
export interface RouletteLimits {
  minBet:     number;
  maxBet:     number;
  maxPayout:  number;
}

/**
 * Statistiques de session pour la roulette
 */
export interface RouletteSessionStats {
  spins:           number[]; // historique des numéros sortis
  hotNumbers:      number[]; // numéros les plus fréquents
  coldNumbers:     number[]; // numéros les moins fréquents
  redCount:        number;
  blackCount:      number;
  greenCount:      number;
  evenCount:       number;
  oddCount:        number;
}
