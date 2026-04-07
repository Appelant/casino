/**
 * Configuration globale du jeu ZéroVirguleChance
 */

export const GAME_CONFIG = {
  /** Solde de départ en centimes ZVC$ (10 000 ZVC$ = 1 000 000 centimes) */
  STARTING_BALANCE: 10_000 * 100,

  /** Mise minimale (1 ZVC$ = 100 centimes) */
  MIN_BET: 1 * 100,

  /** Mise maximale par round (5 000 ZVC$) */
  MAX_BET: 5_000 * 100,

  /** Valeurs des jetons disponibles (en centimes) */
  CHIP_VALUES: [100, 500, 2500, 10000, 50000] as const,

  /** Nombre maximum de rounds dans l'historique */
  HISTORY_MAX_ROUNDS: 50,

  /** Son activé par défaut */
  SOUND_ENABLED_DEFAULT: true,

  // ============================================
  // CONFIGURATION ROULETTE
  // ============================================

  /** Nombre de cases sur la roue européenne */
  ROULETTE_POCKETS: 37, // 0-36

  // ============================================
  // CONFIGURATION BLACKJACK
  // ============================================

  /** Nombre de decks dans le sabot (Vegas rules) */
  BJ_NUM_DECKS: 6,

  /** Payout Blackjack naturel (3:2 = 1.5) */
  BJ_PAYOUT: 1.5,

  /** Payout Insurance (2:1) */
  BJ_INSURANCE_PAYOUT: 2,

  /** Seuil de reshuffle (< 25% du sabot restant) */
  BJ_SHUFFLE_THRESHOLD: 0.25,

  /** Dealer hit sur Soft 17 (Vegas H17 rules) */
  BJ_DEALER_HITS_SOFT_17: true,

  // ============================================
  // CONFIGURATION SESSION
  // ============================================

  /** Intervalle d'auto-save en millisecondes (30s) */
  AUTO_SAVE_INTERVAL_MS: 30_000,

  /** Durée maximale d'une session avant idle timeout (15 min) */
  SESSION_IDLE_TIMEOUT_MS: 15 * 60 * 1000,
} as const;

/**
 * Limites de mise spécifiques à la roulette
 */
export const ROULETTE_LIMITS = {
  MIN_BET: GAME_CONFIG.MIN_BET,
  MAX_BET: GAME_CONFIG.MAX_BET,
  /** Gain maximum par spin */
  MAX_PAYOUT: 50_000 * 100,
} as const;

/**
 * Limites de mise spécifiques au blackjack
 */
export const BLACKJACK_LIMITS = {
  MIN_BET: GAME_CONFIG.MIN_BET,
  MAX_BET: GAME_CONFIG.MAX_BET,
  /** Nombre maximum de splits */
  MAX_SPLITS: 1,
  /** Double autorisé sur toutes les cartes */
  DOUBLE_ANY: true,
} as const;
