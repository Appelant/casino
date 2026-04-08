/**
 * Repository pour la table USERS.
 * Toutes les opérations passent par ici (jamais d'accès direct au storage).
 */

import { db } from './database';
import { DB_KEYS, MAX_ROUNDS_PER_USER, type UserRecord, type SessionRecord } from './schema';
import { generateSalt, hashPassword, verifyPassword } from './auth';
import { GAME_CONFIG } from '@/config/game.config';
import { uuid } from '@/utils/rng/uuid';
import type { GameResult } from '@/types';

const STARTING_ELO = 0;

function loadUsers(): UserRecord[] {
  const users = db.read<UserRecord[]>(DB_KEYS.USERS, []);
  // Migration : ajoute rounds: [] aux anciens users
  let needsSave = false;
  for (const u of users) {
    if (!Array.isArray(u.rounds)) {
      u.rounds = [];
      needsSave = true;
    }
  }
  if (needsSave) saveUsers(users);
  return users;
}

function saveUsers(users: UserRecord[]): void {
  db.write(DB_KEYS.USERS, users);
}

function normalize(username: string): string {
  return username.trim().toLowerCase();
}

export const usersRepo = {
  /** Récupère tous les utilisateurs (lecture seule). */
  all(): UserRecord[] {
    return loadUsers();
  },

  findById(id: string): UserRecord | null {
    return loadUsers().find((u) => u.id === id) ?? null;
  },

  findByUsername(username: string): UserRecord | null {
    const norm = normalize(username);
    return loadUsers().find((u) => normalize(u.username) === norm) ?? null;
  },

  /**
   * Crée un nouvel utilisateur. Lève une erreur si le pseudo est déjà pris.
   */
  async create(username: string, password: string): Promise<UserRecord> {
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      throw new Error('Le pseudo doit faire au moins 3 caractères');
    }
    if (trimmed.length > 20) {
      throw new Error('Le pseudo doit faire au maximum 20 caractères');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      throw new Error('Pseudo invalide (lettres, chiffres, _ et - uniquement)');
    }
    if (password.length < 4) {
      throw new Error('Le mot de passe doit faire au moins 4 caractères');
    }

    const users = loadUsers();
    if (users.some((u) => normalize(u.username) === normalize(trimmed))) {
      throw new Error('Ce pseudo est déjà utilisé');
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const now = Date.now();

    const user: UserRecord = {
      id: uuid(),
      username: trimmed,
      passwordHash,
      salt,
      balance: GAME_CONFIG.STARTING_BALANCE,
      elo: STARTING_ELO,
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalWagered: 0,
      totalWon: 0,
      biggestWin: 0,
      rounds: [],
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    users.push(user);
    saveUsers(users);
    return user;
  },

  /**
   * Vérifie les credentials et retourne l'utilisateur si OK.
   */
  async authenticate(username: string, password: string): Promise<UserRecord> {
    const user = this.findByUsername(username);
    if (!user) throw new Error('Pseudo ou mot de passe incorrect');
    const ok = await verifyPassword(password, user.salt, user.passwordHash);
    if (!ok) throw new Error('Pseudo ou mot de passe incorrect');

    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    const existing = users[idx];
    if (idx >= 0 && existing) {
      const updated: UserRecord = { ...existing, lastLoginAt: Date.now() };
      users[idx] = updated;
      saveUsers(users);
      return updated;
    }
    return user;
  },

  /**
   * Met à jour partiellement un utilisateur. Renvoie le record à jour.
   */
  update(id: string, patch: Partial<Omit<UserRecord, 'id' | 'createdAt'>>): UserRecord | null {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === id);
    const existing = users[idx];
    if (idx < 0 || !existing) return null;
    const updated: UserRecord = { ...existing, ...patch, updatedAt: Date.now() };
    users[idx] = updated;
    saveUsers(users);
    return updated;
  },

  /**
   * Ajoute un round à l'historique de l'utilisateur (fenêtre glissante).
   */
  addRound(userId: string, round: GameResult): UserRecord | null {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    const existing = users[idx];
    if (idx < 0 || !existing) return null;
    const newRounds = [round, ...existing.rounds].slice(0, MAX_ROUNDS_PER_USER);
    const updated: UserRecord = { ...existing, rounds: newRounds, updatedAt: Date.now() };
    users[idx] = updated;
    saveUsers(users);
    return updated;
  },

  /**
   * Vide l'historique d'un utilisateur.
   */
  clearRounds(userId: string): UserRecord | null {
    return this.update(userId, { rounds: [] });
  },

  /**
   * Top N utilisateurs par ELO (classement).
   */
  leaderboard(limit = 50): UserRecord[] {
    return loadUsers()
      .slice()
      .sort((a, b) => b.elo - a.elo || b.totalWon - a.totalWon)
      .slice(0, limit);
  },
};

// ============================================
// Session courante (utilisateur connecté)
// ============================================

export const sessionRepo = {
  current(): SessionRecord | null {
    return db.read<SessionRecord | null>(DB_KEYS.SESSION, null);
  },
  set(userId: string): void {
    db.write<SessionRecord>(DB_KEYS.SESSION, { userId, startedAt: Date.now() });
  },
  clear(): void {
    db.remove(DB_KEYS.SESSION);
  },
};
