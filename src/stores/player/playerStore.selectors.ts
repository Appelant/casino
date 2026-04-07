import { usePlayerStore } from './playerStore';
import { GAME_CONFIG } from '@/config/game.config';

/**
 * Sélecteurs dérivés du store joueur
 */

/**
 * Vérifie si le joueur peut placer une mise donnée.
 */
export const selectCanBet = (amount: number): boolean => {
  const balance = usePlayerStore.getState().balance;
  return balance >= amount && amount >= GAME_CONFIG.MIN_BET;
};

/**
 * Calcule le profit net total (gains - pertes).
 * Note: nécessite un tracking dans un store séparé pour être précis.
 */
export const selectNetProfit = (): number => {
  const balance = usePlayerStore.getState().balance;
  return balance - GAME_CONFIG.STARTING_BALANCE;
};

/**
 * Calcule le taux de victoire (win rate).
 * Note: nécessite les stats complètes pour être précis.
 */
export const selectWinRate = (): number => {
  // Sera implémenté avec le statsStore
  return 0;
};

/**
 * Retourne le solde actuel.
 */
export const selectBalance = (): number => {
  return usePlayerStore.getState().balance;
};

/**
 * Retourne le nom d'utilisateur.
 */
export const selectUsername = (): string => {
  return usePlayerStore.getState().username;
};

/**
 * Retourne l'avatar actuel.
 */
export const selectAvatar = (): string => {
  return usePlayerStore.getState().avatar;
};
