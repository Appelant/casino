/**
 * Client API pour communiquer avec le serveur backend
 * Tous les appels passent par ici pour la synchronisation multi-appareils
 */

// URL du backend - configurable via variable d'environnement
const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`;

/**
 * Requête HTTP typée avec gestion d'erreurs
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
  } catch (fetchError) {
    console.error('API fetch error:', fetchError);
    throw new Error(
      'Impossible de se connecter au serveur backend. ' +
      'Vérifie que le serveur tourne sur http://localhost:3001'
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Erreur HTTP ${response.status}`);
  }

  return data;
}

/**
 * Auth API
 */
export const authApi = {
  register: (username: string, password: string) =>
    request<{ user: UserRecord; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    request<{ user: UserRecord; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

/**
 * Users API
 */
export const usersApi = {
  getById: (id: string) =>
    request<{ user: UserRecord; rounds: DbRound[] }>(`/users/${id}`),

  update: (id: string, data: Partial<UserUpdate>) =>
    request<{ user: UserRecord }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  addRound: (userId: string, round: GameResult) =>
    request<{ success: boolean }>(`/users/${userId}/rounds`, {
      method: 'POST',
      body: JSON.stringify({ round }),
    }),

  clearRounds: (userId: string) =>
    request<{ success: boolean }>(`/users/${userId}/rounds`, {
      method: 'DELETE',
    }),
};

/**
 * Leaderboard API
 */
export const leaderboardApi = {
  get: (limit = 50) =>
    request<{ players: LeaderboardPlayer[] }>(`/leaderboard?limit=${limit}`),
};

/**
 * Types
 */
export interface UserRecord {
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
}

interface UserUpdate {
  balance?: number;
  elo?: number;
  totalGames?: number;
  totalWins?: number;
  totalLosses?: number;
  totalWagered?: number;
  totalWon?: number;
  biggestWin?: number;
}

interface DbRound {
  id: string;
  user_id: string;
  game_id: string;
  timestamp: number;
  wagered: number;
  won: number;
  net_profit: number;
  is_win: number;
  details: string;
}

export interface LeaderboardPlayer {
  id: string;
  username: string;
  balance: number;
  elo: number;
  total_games: number;
  total_wins: number;
  total_losses: number;
  total_wagered: number;
  total_won: number;
  biggest_win: number;
}

import type { GameResult } from '@/types';
