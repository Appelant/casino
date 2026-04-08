/**
 * Store Zustand pour l'authentification.
 * Source de vérité de l'utilisateur connecté + actions login/register/logout.
 */

import { create } from 'zustand';
import type { UserRecord } from '@/db/schema';
import type { GameResult } from '@/types';
import { usersRepo, sessionRepo } from '@/db/users.repo';
import { computeEloDelta, applyEloDelta } from '@/features/auth/utils/eloCalculator';

interface AuthState {
  currentUser: UserRecord | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  /** Charge la session persistée si elle existe. */
  hydrate: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  /** Met à jour le solde du joueur connecté (synchronisé en DB). */
  setBalance: (balance: number) => void;
  /**
   * Enregistre le résultat d'un round : balance, ELO, stats agrégées.
   */
  recordRound: (input: {
    wagered: number;
    won: number;
    netProfit: number;
    isWin: boolean;
    isBlackjack?: boolean;
    newBalance: number;
    round: GameResult;
  }) => void;
  clearHistory: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  hydrate: () => {
    const session = sessionRepo.current();
    if (!session) return;
    const user = usersRepo.findById(session.userId);
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
    } else {
      sessionRepo.clear();
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await usersRepo.authenticate(username, password);
      sessionRepo.set(user.id);
      set({ currentUser: user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur de connexion';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await usersRepo.create(username, password);
      sessionRepo.set(user.id);
      set({ currentUser: user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur lors de la création';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    sessionRepo.clear();
    set({ currentUser: null, isAuthenticated: false, error: null });
  },

  setBalance: (balance) => {
    const user = get().currentUser;
    if (!user) return;
    const updated = usersRepo.update(user.id, { balance });
    if (updated) set({ currentUser: updated });
  },

  recordRound: ({ wagered, won, netProfit, isWin, isBlackjack, newBalance, round }) => {
    const user = get().currentUser;
    if (!user) return;

    const delta = computeEloDelta({ wagered, netProfit, isWin, isBlackjack });
    const newElo = applyEloDelta(user.elo, delta);

    // 1. Stats + balance + elo
    const updated = usersRepo.update(user.id, {
      balance: newBalance,
      elo: newElo,
      totalGames: user.totalGames + 1,
      totalWins: user.totalWins + (isWin ? 1 : 0),
      totalLosses: user.totalLosses + (isWin ? 0 : 1),
      totalWagered: user.totalWagered + wagered,
      totalWon: user.totalWon + won,
      biggestWin: Math.max(user.biggestWin, netProfit > 0 ? netProfit : 0),
    });
    if (!updated) return;

    // 2. Historique
    const withRound = usersRepo.addRound(user.id, round);
    set({ currentUser: withRound ?? updated });
  },

  clearHistory: () => {
    const user = get().currentUser;
    if (!user) return;
    const updated = usersRepo.clearRounds(user.id);
    if (updated) set({ currentUser: updated });
  },

  clearError: () => set({ error: null }),
}));
