import { useHistoryStore } from './historyStore';
import type { GameResult } from '@/types';

/**
 * Sélecteurs utilitaires pour le store history
 */

/**
 * Retourne le dernier round joué
 */
export const selectLastRound = (): GameResult | null => {
  return useHistoryStore.getState().lastRound;
};

/**
 * Retourne les rounds filtrés par type de jeu
 */
export const selectRoundsByGame = (gameType: 'roulette' | 'blackjack'): GameResult[] => {
  return useHistoryStore.getState().roundsByGame(gameType);
};

/**
 * Retourne la tendance récente (win/lose/neutral)
 */
export const selectRecentTrend = (): 'win' | 'lose' | 'neutral' => {
  return useHistoryStore.getState().recentTrend;
};

/**
 * Retourne les 10 derniers rounds
 */
export const selectLast10Rounds = (): GameResult[] => {
  return useHistoryStore.getState().last10Rounds;
};

/**
 * Compte le nombre total de rounds dans l'historique
 */
export const selectTotalRounds = (): number => {
  return useHistoryStore.getState().rounds.length;
};

/**
 * Calcule le RTP sur les N derniers rounds
 */
export const selectRecentRTP = (limit: number = 10): number => {
  const rounds = useHistoryStore.getState().rounds.slice(0, limit);
  if (rounds.length === 0) return 100;

  const totalWagered = rounds.reduce((sum, r) => sum + r.wagered, 0);
  const totalWon = rounds.reduce((sum, r) => sum + r.won, 0);

  if (totalWagered === 0) return 100;
  return (totalWon / totalWagered) * 100;
};
