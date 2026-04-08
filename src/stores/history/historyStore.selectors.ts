import { useAuthStore } from '../auth/authStore';
import type { GameResult } from '@/types';

/**
 * Sélecteurs utilitaires pour l'historique (lus depuis authStore.currentUser.rounds)
 */

function getRounds(): GameResult[] {
  return useAuthStore.getState().currentUser?.rounds ?? [];
}

/**
 * Retourne le dernier round joué
 */
export const selectLastRound = (): GameResult | null => {
  const rounds = getRounds();
  return rounds[0] ?? null;
};

/**
 * Retourne les rounds filtrés par type de jeu
 */
export const selectRoundsByGame = (gameType: 'roulette' | 'blackjack'): GameResult[] => {
  return getRounds().filter((r) => r.gameId === gameType);
};

/**
 * Retourne la tendance récente (win/lose/neutral) sur les 10 derniers rounds
 */
export const selectRecentTrend = (): 'win' | 'lose' | 'neutral' => {
  const recent = getRounds().slice(0, 10);
  if (recent.length === 0) return 'neutral';
  const wins = recent.filter((r) => r.isWin).length;
  const losses = recent.filter((r) => !r.isWin).length;
  if (wins > losses) return 'win';
  if (losses > wins) return 'lose';
  return 'neutral';
};

/**
 * Retourne les 10 derniers rounds
 */
export const selectLast10Rounds = (): GameResult[] => {
  return getRounds().slice(0, 10);
};

/**
 * Compte le nombre total de rounds dans l'historique
 */
export const selectTotalRounds = (): number => {
  return getRounds().length;
};

/**
 * Calcule le RTP sur les N derniers rounds
 */
export const selectRecentRTP = (limit: number = 10): number => {
  const rounds = getRounds().slice(0, limit);
  if (rounds.length === 0) return 100;

  const totalWagered = rounds.reduce((sum, r) => sum + r.wagered, 0);
  const totalWon = rounds.reduce((sum, r) => sum + r.won, 0);

  if (totalWagered === 0) return 100;
  return (totalWon / totalWagered) * 100;
};
