import type { Currency } from './player.types';
import type { GameResult } from './game.types';

/**
 * État du store joueur
 */
export interface PlayerState {
  balance:   Currency;
  username:  string;
  avatar:    string;
}

/**
 * Type complet du store joueur (état + actions)
 */
export interface PlayerStore {
  balance:        Currency;
  username:       string;
  avatar:         string;
  hasPendingBet:  boolean;
  placeBet:       (amount: Currency) => boolean;
  receiveWin:     (amount: Currency) => void;
  lose:           (amount: Currency) => void;
  setUsername:    (username: string) => void;
  setAvatar:      (avatar: string) => void;
  resetBalance:   () => void;
}

/**
 * État du store statistiques
 */
export interface StatsState {
  totalWagered:    Currency;
  totalWon:        Currency;
  totalGames:      number;
  totalWins:       number;
  totalLosses:     number;
  biggestWin:      Currency;
  currentStreak:   number;
  bestWinStreak:   number;
  bestLossStreak:  number;
  sessionStart:    number;
  lastPlayedAt:    number | null;
}

/**
 * Sélecteurs dérivés des stats
 */
export interface StatsSelectors {
  rtp:             number; // Return To Player (%)
  winRate:         number; // % de victoires
  sessionDuration: number; // en ms
  streakStatus:    'hot' | 'cold' | 'neutral';
  averageBet:      number;
}

/**
 * Type complet du store stats (état + sélecteurs)
 */
export type StatsStore = StatsState & StatsSelectors;

/**
 * État du store historique
 */
export interface HistoryState {
  rounds: GameResult[];
}

/**
 * Actions du store historique
 */
export interface HistoryActions {
  addRound:     (round: GameResult) => void;
  clearHistory: () => void;
}

/**
 * Sélecteurs dérivés de l'historique
 */
export interface HistorySelectors {
  lastRound:      GameResult | null;
  roundsByGame:   (gameType: 'roulette' | 'blackjack') => GameResult[];
  recentTrend:    'win' | 'lose' | 'neutral';
  last10Rounds:   GameResult[];
}

/**
 * Type complet du store historique
 */
export type HistoryStore = HistoryState & HistoryActions & HistorySelectors;

/**
 * État du store UI
 */
export interface UIState {
  activeModal:   'settings' | 'stats' | 'history' | 'profile' | 'shop' | null;
  toasts:        Toast[];
  soundEnabled:  boolean;
  animSpeed:     'slow' | 'normal' | 'fast';
  isSidebarOpen: boolean;
}

/**
 * Actions du store UI
 */
export interface UIActions {
  openModal:     (modal: UIState['activeModal']) => void;
  closeModal:    () => void;
  addToast:      (toast: Omit<Toast, 'id'>) => void;
  removeToast:   (id: string) => void;
  toggleSound:   () => void;
  setAnimSpeed:  (speed: UIState['animSpeed']) => void;
  toggleSidebar: () => void;
}

/**
 * Type complet du store UI
 */
export type UIStore = UIState & UIActions;

/**
 * Structure d'un toast notification
 */
export interface Toast {
  id:       string;
  message:  string;
  level:    'success' | 'error' | 'info' | 'warning';
  duration: number; // ms avant auto-dismiss
}
