/**
 * Types de jeux disponibles dans le casino
 */
export type GameType = 'roulette' | 'blackjack' | 'dice' | 'slots';

/**
 * Statut d'une partie en cours
 */
export type GameStatus =
  | 'idle'      // Aucune partie en cours
  | 'betting'   // Phase de mises
  | 'dealing'   // Distribution des cartes (blackjack)
  | 'spinning'  // Roue en train de tourner (roulette)
  | 'playing'   // Tour du joueur/dealer en cours
  | 'result'    // Résultat affiché, en attente de reset
  | 'settling'; // Calcul des gains en cours

/**
 * Résultat d'un round de jeu
 */
export interface GameResult {
  id:          string;
  gameId:      GameType;
  timestamp:   number;
  wagered:     number;
  won:         number;
  netProfit:   number;
  isWin:       boolean;
  details:     RouletteRoundDetails | BlackjackRoundDetails | DiceRoundDetails | SlotsRoundDetails;
}

/**
 * Détails spécifiques à la roulette
 */
export interface RouletteRoundDetails {
  winningNumber: number;
  winningColor:  'red' | 'black' | 'green';
  bets:          RouletteBetSummary[];
}

/**
 * Détails spécifiques au blackjack
 */
export interface BlackjackRoundDetails {
  playerHand:     string[];
  dealerHand:     string[];
  playerTotal:    number;
  dealerTotal:    number;
  outcome:        'win' | 'lose' | 'push' | 'blackjack' | 'bust' | 'dealerBust';
  isBlackjack:    boolean;
  isDouble:       boolean;
  isSplit:        boolean;
}

/**
 * Détails spécifiques au jeu de dés
 */
export interface DiceRoundDetails {
  rolledFace: number;
  chosenFace: number;
  outcome: 'win' | 'lose';
}

/**
 * Détails spécifiques à la machine à sous
 */
export interface SlotsRoundDetails {
  reels:      [string, string, string];
  multiplier: number;
  isJackpot:  boolean;
  winLabel:   string | null;
  outcome:    'win' | 'lose';
}

/**
 * Résumé d'une mise (pour l'historique)
 */
export interface RouletteBetSummary {
  betType:   string;
  numbers:   number[];
  amount:    number;
  won:       number;
  isWinner:  boolean;
}

/**
 * Statut d'un round
 */
export type RoundStatus = 'pending' | 'completed' | 'cancelled';
