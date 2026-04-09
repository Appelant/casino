/**
 * Store Zustand pour l'authentification.
 * Source de vérité = serveur backend (synchronisation multi-appareils)
 */

import { create } from 'zustand';
import type { GameResult } from '@/types';
import { authApi, usersApi, type UserRecord as ApiUser } from '@/api/client';

// Adapter le type API vers le type local
interface UserRecord {
  id: string;
  username: string;
  balance: number;
  elo: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
  rounds: GameResult[];
}

interface AuthState {
  currentUser: UserRecord | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setBalance: (balance: number) => void;
  recordRound: (input: {
    wagered: number;
    won: number;
    netProfit: number;
    isWin: boolean;
    isBlackjack?: boolean;
    newBalance: number;
    round: GameResult;
  }) => Promise<void>;
  clearHistory: () => Promise<void>;
  clearError: () => void;
  /** Refresh les données utilisateur depuis le serveur */
  refreshUser: () => Promise<void>;
}

// Clé de session localStorage (pour le token uniquement)
const STORAGE_KEY = 'ZVC_AUTH_TOKEN';

function loadSession(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveSession(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {}
}

function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// Convertir API user + rounds vers UserRecord
function toUserRecord(user: ApiUser, rounds: any[]): UserRecord {
  return {
    ...user,
    rounds: rounds.map((r: any) => ({
      id: r.id,
      gameId: r.game_id as 'roulette' | 'blackjack' | 'dice' | 'slots',
      timestamp: r.timestamp,
      wagered: r.wagered,
      won: r.won,
      netProfit: r.net_profit,
      isWin: r.is_win === 1,
      details: JSON.parse(r.details),
    })),
  };
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    const token = loadSession();
    if (!token) return;

    try {
      const { user, rounds } = await usersApi.getById(token);
      set({
        currentUser: toUserRecord(user, rounds),
        isAuthenticated: true,
      });
    } catch {
      clearSession();
      set({ currentUser: null, isAuthenticated: false });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.login(username, password);
      saveSession(token);

      // Charger l'historique complet
      const { rounds } = await usersApi.getById(user.id);

      set({
        currentUser: toUserRecord(user, rounds),
        isAuthenticated: true,
        isLoading: false,
      });
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
      const { user, token } = await authApi.register(username, password);
      saveSession(token);

      set({
        currentUser: toUserRecord(user, []),
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur lors de la création';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    clearSession();
    set({ currentUser: null, isAuthenticated: false, error: null });
  },

  setBalance: async (balance) => {
    const user = get().currentUser;
    if (!user) return;

    // Mise à jour optimiste immédiate (évite de repasser les rounds dans toUserRecord)
    set((s) => ({
      currentUser: s.currentUser ? { ...s.currentUser, balance } : null,
    }));

    try {
      await usersApi.update(user.id, { balance });
    } catch (err) {
      // Rollback si le serveur échoue
      set((s) => ({
        currentUser: s.currentUser ? { ...s.currentUser, balance: user.balance } : null,
      }));
      console.error('Erreur setBalance:', err);
    }
  },

  recordRound: async ({ wagered, won, netProfit, isWin, newBalance, round }) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      // Mettre à jour stats + balance
      const { user: updated } = await usersApi.update(user.id, {
        balance: newBalance,
        totalGames: user.totalGames + 1,
        totalWins: user.totalWins + (isWin ? 1 : 0),
        totalLosses: user.totalLosses + (isWin ? 0 : 1),
        totalWagered: user.totalWagered + wagered,
        totalWon: user.totalWon + won,
        biggestWin: Math.max(user.biggestWin, netProfit > 0 ? netProfit : 0),
      });

      // 2. Ajouter le round
      await usersApi.addRound(user.id, round);

      // 3. Refresh complet pour sync
      const { rounds } = await usersApi.getById(user.id);
      set({ currentUser: toUserRecord(updated, rounds) });
    } catch (err) {
      console.error('Erreur recordRound:', err);
    }
  },

  clearHistory: async () => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await usersApi.clearRounds(user.id);
      const { user: updated } = await usersApi.getById(user.id);
      set({ currentUser: toUserRecord(updated, []) });
    } catch (err) {
      console.error('Erreur clearHistory:', err);
    }
  },

  clearError: () => set({ error: null }),

  refreshUser: async () => {
    const user = get().currentUser;
    if (!user) return;

    try {
      const { user: updated, rounds } = await usersApi.getById(user.id);
      set({ currentUser: toUserRecord(updated, rounds) });
    } catch (err) {
      console.error('Erreur refreshUser:', err);
    }
  },
}));
