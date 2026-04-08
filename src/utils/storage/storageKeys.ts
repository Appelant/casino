/**
 * Clés de stockage LocalStorage pour ZéroVirguleChance
 *
 * Toutes les clés sont préfixées par 'ZVC_' pour éviter les collisions.
 */

export const STORAGE_KEYS = {
  /** État du joueur (balance, username, avatar) */
  PLAYER: 'ZVC_PLAYER',

  /** Statistiques globales */
  STATS: 'ZVC_STATS',

  /** Statistiques par utilisateur (pseudo) */
  USER_STATS: 'ZVC_USER_STATS',

  /** Historique des rounds (50 entrées max) */
  HISTORY: 'ZVC_HISTORY',

  /** Préférences UI (son, vitesse animation, thème) */
  UI_PREFS: 'ZVC_UI_PREFS',

  /** Session en cours (game state persisté) */
  SESSION: 'ZVC_SESSION',

  /** Dernière version de schema pour migrations */
  SCHEMA_VERSION: 'ZVC_SCHEMA_VERSION',
} as const;

/**
 * Version actuelle du schema de données
 * Incrémenter en cas de breaking change nécessitant une migration
 */
export const SCHEMA_VERSION = 1;
