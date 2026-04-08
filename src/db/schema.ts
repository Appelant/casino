/**
 * Schéma de la base de données locale ZVC.
 * Stockage : localStorage (vraie DB structurée par tables typées).
 */

import type { GameResult } from '@/types';

export interface UserRecord {
  /** UUID v4 */
  id: string;
  /** Pseudo unique (case-insensitive) */
  username: string;
  /** Hash SHA-256 hex du mot de passe + sel */
  passwordHash: string;
  /** Sel hex utilisé pour le hash */
  salt: string;
  /** Solde en centimes ZVC$ */
  balance: number;
  /** Points ELO (rank Valorant) */
  elo: number;
  /** Statistiques cumulées */
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
  /** Historique des rounds (fenêtre glissante 200 max) */
  rounds: GameResult[];
  /** Timestamps */
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
}

/** Nombre maximum de rounds conservés par utilisateur */
export const MAX_ROUNDS_PER_USER = 200;

export interface SessionRecord {
  userId: string;
  startedAt: number;
}

export const DB_KEYS = {
  USERS: 'ZVC_DB_USERS',
  SESSION: 'ZVC_DB_SESSION',
  SCHEMA_VERSION: 'ZVC_DB_VERSION',
} as const;

export const DB_SCHEMA_VERSION = 1;
