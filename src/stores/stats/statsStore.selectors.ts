import { useStatsStore } from './statsStore';

/**
 * Sélecteurs utilitaires pour le store stats
 */

/**
 * Retourne le RTP actuel (Return To Player)
 */
export const selectRTP = (): number => {
  return useStatsStore.getState().rtp;
};

/**
 * Retourne le win rate (taux de victoire)
 */
export const selectWinRate = (): number => {
  return useStatsStore.getState().winRate;
};

/**
 * Retourne la durée de session en millisecondes
 */
export const selectSessionDuration = (): number => {
  return useStatsStore.getState().sessionDuration;
};

/**
 * Retourne l'état de la série (hot/cold/neutral)
 */
export const selectStreakStatus = (): 'hot' | 'cold' | 'neutral' => {
  return useStatsStore.getState().streakStatus;
};

/**
 * Retourne la mise moyenne
 */
export const selectAverageBet = (): number => {
  return useStatsStore.getState().averageBet;
};

/**
 * Formate la durée de session en string lisible (ex: "1h 23min")
 */
export const formatSessionDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  if (minutes > 0) {
    return `${minutes}min ${seconds}s`;
  }
  return `${seconds}s`;
};
