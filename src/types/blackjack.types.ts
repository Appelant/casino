/**
 * Valeurs des cartes (As, 2-10, Valet, Dame, Roi)
 */
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

/**
 * Enseignes des cartes
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

/**
 * Une carte individuelle
 */
export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // valeur numérique (As=11 ou 1, Figures=10)
  isFaceDown?: boolean; // pour la carte cachée du dealer
}

/**
 * Une main de blackjack (ensemble de cartes)
 */
export interface Hand {
  cards:      Card[];
  total:      number;
  isSoft:     boolean; // contient un As compté à 11
  isBust:     boolean; // total > 21
  isBlackjack: boolean; // As + Figure en exactement 2 cartes
  isSplit:    boolean; // main issue d'un split
}

/**
 * Actions possibles au blackjack
 */
export type BlackjackAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance';

/**
 * Résultat d'une main de blackjack
 */
export type BlackjackOutcome =
  | 'win'          // Joueur gagne
  | 'lose'         // Joueur perd
  | 'push'         // Égalité (remboursement)
  | 'blackjack'    // Blackjack naturel (payout 3:2)
  | 'bust'         // Joueur dépasse 21
  | 'dealerBust'   // Dealer dépasse 21
  | 'surrender';   // Joueur abandonne (récupère 50%)

/**
 * Résultat complet d'un round de blackjack
 */
export interface BlackjackResult {
  outcome:       BlackjackOutcome;
  playerHand:    Hand;
  dealerHand:    Hand;
  payout:        number; // montant gagné/perdu
  isBlackjack:   boolean;
  isDouble:      boolean;
  isSplit:       boolean;
}

/**
 * État du sabot (ensemble des decks)
 */
export interface Shoe {
  decks:        number;       // nombre de decks (6 pour Vegas)
  cards:        Card[];       // cartes restantes
  dealtCount:   number;       // cartes déjà distribuées
  needsShuffle: boolean;      // vrai si < 25% restant
}

/**
 * Configuration du blackjack
 */
export interface BlackjackConfig {
  numDecks:          number;
  blackjackPayout:   number; // 3:2 = 1.5
  insurancePayout:   number; // 2:1
  shuffleThreshold:  number; // 0.25 = reshuffle à 25% restant
  dealerHitsSoft17:  boolean; // Vegas rules: H17
}
