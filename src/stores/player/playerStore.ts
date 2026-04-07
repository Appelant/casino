import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerStore } from '@/types';
import { STORAGE_KEYS } from '@/utils/storage/storageKeys';
import { GAME_CONFIG } from '@/config/game.config';

/**
 * État initial du joueur
 */
const INITIAL_STATE = {
  balance: GAME_CONFIG.STARTING_BALANCE,
  username: 'Joueur',
  avatar: 'default',
};

/**
 * Store Zustand pour la gestion du joueur
 *
 * Features:
 * - Persist LocalStorage via middleware
 * - placeBet: déduit le montant du solde (retourne false si solde insuffisant)
 * - receiveWin: ajoute un montant au solde
 * - lose: déduit un montant (pour affichage)
 * - setUsername/setAvatar: met à jour le profil
 * - resetBalance: réinitialise à 10 000 ZVC$
 */
export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      /**
       * Place une mise. Retourne false si solde insuffisant.
       */
      placeBet: (amount: number) => {
        const currentBalance = get().balance;
        if (currentBalance < amount) {
          return false;
        }
        set((state) => ({ balance: state.balance - amount }));
        return true;
      },

      /**
       * Reçoit un gain (après un win).
       */
      receiveWin: (amount: number) => {
        set((state) => ({ balance: state.balance + amount }));
      },

      /**
       * Perd un montant (pour affichage/trace).
       */
      lose: (amount: number) => {
        set((state) => ({ balance: Math.max(0, state.balance - amount) }));
      },

      /**
       * Met à jour le nom d'utilisateur.
       */
      setUsername: (username: string) => {
        set({ username });
      },

      /**
       * Met à jour l'avatar.
       */
      setAvatar: (avatar: string) => {
        set({ avatar });
      },

      /**
       * Réinitialise le solde à 10 000 ZVC$.
       */
      resetBalance: () => {
        set({ balance: GAME_CONFIG.STARTING_BALANCE });
      },
    }),
    {
      name: STORAGE_KEYS.PLAYER,
      partialize: (state) => ({
        balance: state.balance,
        username: state.username,
        avatar: state.avatar,
      }),
    }
  )
);
