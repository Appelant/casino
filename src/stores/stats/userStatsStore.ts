/**
 * Store pour les statistiques par utilisateur (pseudo)
 *
 * Permet de filtrer les stats par pseudo sans authentification réelle
 * Stocke la liste des pseudos utilisés et les stats associées
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameResult } from '@/types';
import { STORAGE_KEYS } from '@/utils/storage/storageKeys';
import { useAuthStore } from '../auth/authStore';

// ============================================
// TYPES
// ============================================

export interface UserStats {
  totalWagered: number;
  totalWon: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  currentStreak: number;
  bestWinStreak: number;
  bestLossStreak: number;
  lastPlayedAt: number | null;
  sessionStart: number;
}

export interface UserStatsStore {
  // État
  currentUsername: string;
  knownUsernames: string[];

  // Stats globales (tous utilisateurs confondus)
  globalStats: UserStats;

  // Actions
  setCurrentUsername: (username: string) => void;
  addUsername: (username: string) => void;
  resetGlobalStats: () => void;

  // Sélecteurs dérivés
  getUserStats: (username: string) => UserStats;
  calculateRTP: (stats: UserStats) => number;
  calculateWinRate: (stats: UserStats) => number;
  getStreakStatus: (streak: number) => 'hot' | 'cold' | 'neutral';
}

// ============================================
// ÉTAT INITIAL
// ============================================

const INITIAL_USER_STATS: UserStats = {
  totalWagered: 0,
  totalWon: 0,
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  biggestWin: 0,
  currentStreak: 0,
  bestWinStreak: 0,
  bestLossStreak: 0,
  lastPlayedAt: null,
  sessionStart: Date.now(),
};

// ============================================
// FONCTIONS DE CALCUL DE STATS
// ============================================

/**
 * Calcule les statistiques pour un utilisateur donné à partir de l'historique
 * Note: username est actuellement ignoré (pas d'auth réelle), toutes les parties sont comptées
 */
export function calculateUserStats(rounds: GameResult[]): UserStats {

  const stats: UserStats = { ...INITIAL_USER_STATS };
  let currentStreak = 0;
  let bestWinStreak = 0;
  let bestLossStreak = 0;

  rounds.forEach((round) => {
    stats.totalGames++;
    stats.totalWagered += round.wagered;
    stats.totalWon += round.won;

    if (round.isWin) {
      stats.totalWins++;
      currentStreak++;
      if (currentStreak > bestWinStreak) {
        bestWinStreak = currentStreak;
      }
      if (currentStreak < 0) currentStreak = 0;

      // Biggest win
      const netProfit = round.netProfit;
      if (netProfit > stats.biggestWin) {
        stats.biggestWin = netProfit;
      }
    } else {
      stats.totalLosses++;
      currentStreak--;
      if (currentStreak < -bestLossStreak) {
        bestLossStreak = Math.abs(currentStreak);
      }
      if (currentStreak > 0) currentStreak = 0;
    }

    stats.lastPlayedAt = round.timestamp;
  });

  stats.currentStreak = currentStreak;
  stats.bestWinStreak = bestWinStreak;
  stats.bestLossStreak = bestLossStreak;

  return stats;
}

// ============================================
// STORE
// ============================================

export const useUserStatsStore = create<UserStatsStore>()(
  persist(
    (set, get) => ({
      // État initial
      currentUsername: 'Joueur',
      knownUsernames: ['Joueur'],
      globalStats: { ...INITIAL_USER_STATS },

      // Actions
      setCurrentUsername: (username: string) => {
        if (!username.trim()) return;
        const normalized = username.trim();

        // Ajouter à la liste si nouveau
        if (!get().knownUsernames.includes(normalized)) {
          get().addUsername(normalized);
        }

        set({ currentUsername: normalized });
      },

      addUsername: (username: string) => {
        set((state) => ({
          knownUsernames: [...state.knownUsernames, username].filter(
            (v, i, a) => a.indexOf(v) === i
          ), // Unique
        }));
      },

      resetGlobalStats: () => {
        set({ globalStats: { ...INITIAL_USER_STATS, sessionStart: Date.now() } });
      },

      // Sélecteurs dérivés
      getUserStats: () => {
        const history = useAuthStore.getState().currentUser?.rounds ?? [];
        return calculateUserStats(history);
      },

      calculateRTP: (stats: UserStats) => {
        if (stats.totalWagered === 0) return 0;
        return Math.round((stats.totalWon / stats.totalWagered) * 100 * 100) / 100;
      },

      calculateWinRate: (stats: UserStats) => {
        if (stats.totalGames === 0) return 0;
        return Math.round((stats.totalWins / stats.totalGames) * 100 * 100) / 100;
      },

      getStreakStatus: (streak: number) => {
        if (streak >= 3) return 'hot';
        if (streak <= -3) return 'cold';
        return 'neutral';
      },
    }),
    {
      name: STORAGE_KEYS.USER_STATS,
      partialize: (state) => ({
        currentUsername: state.currentUsername,
        knownUsernames: state.knownUsernames,
        globalStats: state.globalStats,
      }),
    }
  )
);

