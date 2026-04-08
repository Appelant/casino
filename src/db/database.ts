/**
 * Wrapper localStorage typé pour la DB locale ZVC.
 * Gère lecture/écriture atomique avec parsing JSON sécurisé.
 */

import { DB_KEYS, DB_SCHEMA_VERSION } from './schema';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota dépassé : silencieux
  }
}

export const db = {
  read<T>(key: string, fallback: T): T {
    return safeGet(key, fallback);
  },
  write<T>(key: string, value: T): void {
    safeSet(key, value);
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

/**
 * Initialise la DB (à appeler au boot de l'app).
 */
export function initDatabase(): void {
  const currentVersion = db.read<number>(DB_KEYS.SCHEMA_VERSION, 0);
  if (currentVersion < DB_SCHEMA_VERSION) {
    db.write(DB_KEYS.SCHEMA_VERSION, DB_SCHEMA_VERSION);
  }
}
