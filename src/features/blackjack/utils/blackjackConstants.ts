/**
 * Constantes pour le Blackjack Vegas Rules
 */

import type { BlackjackConfig } from '@/types';
import { GAME_CONFIG } from '@/config/game.config';

/**
 * Configuration complète du Blackjack
 */
export const BLACKJACK_CONFIG: BlackjackConfig = {
  numDecks: GAME_CONFIG.BJ_NUM_DECKS,
  blackjackPayout: GAME_CONFIG.BJ_PAYOUT,       // 3:2 = 1.5
  insurancePayout: GAME_CONFIG.BJ_INSURANCE_PAYOUT, // 2:1
  shuffleThreshold: GAME_CONFIG.BJ_SHUFFLE_THRESHOLD, // 25%
  dealerHitsSoft17: GAME_CONFIG.BJ_DEALER_HITS_SOFT_17, // H17 (Vegas rules)
};

/**
 * Valeurs des cartes pour le calcul des mains
 */
export const CARD_VALUES: Record<string, number> = {
  'A': 11,  // As vaut 11 ou 1
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,  // Figures valent 10
  'Q': 10,
  'K': 10,
};

/**
 * Limites de mise pour le Blackjack
 */
export const BLACKJACK_LIMITS = {
  minBet: GAME_CONFIG.MIN_BET,
  maxBet: GAME_CONFIG.MAX_BET,
  maxSplits: 1,  // Un seul split autorisé (MVP)
  doubleAny: true,  // Double autorisé sur toutes les cartes
};

/**
 * Noms affichables des enseignes
 */
export const SUIT_NAMES: Record<string, string> = {
  hearts:   'Cœur',
  diamonds: 'Carreau',
  clubs:    'Trèfle',
  spades:   'Pique',
};

/**
 * Symboles des enseignes (pour affichage)
 */
export const SUIT_SYMBOLS: Record<string, string> = {
  hearts:   '♥',
  diamonds: '♦',
  clubs:    '♣',
  spades:   '♠',
};
