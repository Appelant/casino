import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameResult, HistoryState } from '@/types';
import { STORAGE_KEYS } from '@/utils/storage/storageKeys';
import { GAME_CONFIG } from '@/config/game.config';

/**
 * État initial de l'historique
 */
const INITIAL_STATE: HistoryState = {
  rounds: [],
};

/**
 * Interface complète du store history avec actions et sélecteurs
 */
export interface HistoryStore extends HistoryState {
  addRound: (round: GameResult) => void;
  clearHistory: () => void;
  // Sélecteurs
  lastRound: GameResult | null;
  roundsByGame: (gameType: 'roulette' | 'blackjack') => GameResult[];
  recentTrend: 'win' | 'lose' | 'neutral';
  last10Rounds: GameResult[];
}

/**
 * Store Zustand pour l'historique des rounds
 *
 * Fenêtre glissante de 50 rounds maximum
 */
export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      /**
       * Ajoute un round à l'historique
       * Supprime le plus ancien si > 50 entrées
       */
      addRound: (round: GameResult) => {
        const current = get();
        const newRounds = [round, ...current.rounds];

        // Fenêtre glissante: max 50 entrées
        if (newRounds.length > GAME_CONFIG.HISTORY_MAX_ROUNDS) {
          newRounds.pop();
        }

        set({ rounds: newRounds });
      },

      /**
       * Vide tout l'historique
       */
      clearHistory: () => {
        set({ rounds: [] });
      },

      // Sélecteurs
      get lastRound() {
        return get().rounds[0] ?? null;
      },

      roundsByGame: (gameType) => {
        return get().rounds.filter((r) => r.gameId === gameType);
      },

      get recentTrend() {
        const recent = get().rounds.slice(0, 10);
        if (recent.length === 0) return 'neutral';
        const wins = recent.filter((r) => r.isWin).length;
        const losses = recent.filter((r) => !r.isWin).length;
        if (wins > losses) return 'win';
        if (losses > wins) return 'lose';
        return 'neutral';
      },

      get last10Rounds() {
        return get().rounds.slice(0, 10);
      },
    }),
    {
      name: STORAGE_KEYS.HISTORY,
      partialize: (state) => ({
        rounds: state.rounds.slice(0, GAME_CONFIG.HISTORY_MAX_ROUNDS),
      }),
    }
  )
);
