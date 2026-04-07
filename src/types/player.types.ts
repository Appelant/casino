import type { GameType } from './game.types';

/**
 * Monnaie du jeu — toujours en centimes (entier) pour éviter les floats
 */
export type Currency = number;

/**
 * Historique d'une mise placée par le joueur
 */
export interface BetHistory {
  id:        string;
  gameId:    GameType;
  amount:    Currency;
  won:       Currency;
  netProfit: Currency;
  timestamp: number;
}

/**
 * Profil du joueur avec son solde et ses préférences
 */
export interface Player {
  id:        string;
  username:  string;
  avatar:    string;
  balance:   Currency;
  createdAt: number;
}

/**
 * Statistiques globales du joueur
 */
export interface PlayerStats {
  totalWagered:    Currency;
  totalWon:        Currency;
  totalGames:      number;
  totalWins:       number;
  totalLosses:     number;
  biggestWin:      Currency;
  currentStreak:   number; // positif = win streak, négatif = loss streak
  bestWinStreak:   number;
  bestLossStreak:  number;
  sessionStart:    number;
  lastPlayedAt:    number | null;
}

/**
 * État complet du joueur (combinaison Player + PlayerStats)
 */
export interface PlayerState {
  balance:   Currency;
  username:  string;
  avatar:    string;
  stats:     PlayerStats;
  betHistory: BetHistory[];
}
