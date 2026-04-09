/**
 * Constantes de la machine à sous ZVC
 */

import type { SlotSymbol } from '@/types';
import { GAME_CONFIG } from '@/config/game.config';

// ============================================
// CONFIGURATION GÉNÉRALE
// ============================================

export const SLOTS_MIN_BET = GAME_CONFIG.MIN_BET;
export const SLOTS_MAX_BET = GAME_CONFIG.MAX_BET;

/** Délais d'arrêt des rouleaux (ms) — effet staggered authentique */
export const REEL_STOP_DELAYS: [number, number, number] = [1100, 1900, 2700];

/** Délai avant la résolution (après le dernier rouleau)
 * Rouleau 3 s'arrête à tick 46 × 80ms = 3 680ms — on laisse 120ms de marge */
export const SLOTS_RESOLVE_DELAY_MS = 3800;

/** Délais réduits (prefers-reduced-motion) */
export const REEL_STOP_DELAYS_REDUCED: [number, number, number] = [150, 250, 350];
export const SLOTS_RESOLVE_DELAY_REDUCED_MS = 500;

// ============================================
// SYMBOLES — AFFICHAGE
// ============================================

export interface SymbolConfig {
  display: string;    // Texte ou emoji affiché
  label: string;      // Nom lisible
  color: string;      // Classe Tailwind couleur du texte
  glow: string;       // Classe Tailwind glow (box-shadow)
  isText: boolean;    // true = texte stylisé, false = emoji
}

export const SYMBOL_CONFIG: Record<SlotSymbol, SymbolConfig> = {
  seven: {
    display: '7',
    label: 'Sept',
    color: 'text-neon-red',
    glow: 'shadow-[0_0_24px_rgba(239,68,68,0.9)]',
    isText: true,
  },
  bar: {
    display: 'BAR',
    label: 'Bar',
    color: 'text-neon-gold',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.7)]',
    isText: true,
  },
  diamond: {
    display: '💎',
    label: 'Diamant',
    color: 'text-neon-cyan',
    glow: 'shadow-[0_0_18px_rgba(6,182,212,0.6)]',
    isText: false,
  },
  bell: {
    display: '🔔',
    label: 'Cloche',
    color: 'text-neon-gold',
    glow: 'shadow-[0_0_14px_rgba(245,158,11,0.4)]',
    isText: false,
  },
  cherry: {
    display: '🍒',
    label: 'Cerise',
    color: 'text-neon-red',
    glow: '',
    isText: false,
  },
  lemon: {
    display: '🍋',
    label: 'Citron',
    color: 'text-yellow-400',
    glow: '',
    isText: false,
  },
};

// ============================================
// POIDS DES SYMBOLES (probabilité par rouleau)
// ============================================

/** Poids de chaque symbole (total = 20) */
export const SYMBOL_WEIGHTS: Record<SlotSymbol, number> = {
  seven:   1,   // 5%   — très rare
  bar:     2,   // 10%
  diamond: 2,   // 10%
  bell:    4,   // 20%
  cherry:  6,   // 30%
  lemon:   5,   // 25%
};

export const TOTAL_WEIGHT = Object.values(SYMBOL_WEIGHTS).reduce((a, b) => a + b, 0); // 20

// ============================================
// BANDES VISUELLES DES ROULEAUX
// Définit l'ordre d'affichage des symboles adjacents
// ============================================

export const REEL_STRIPS: readonly SlotSymbol[][] = [
  ['lemon', 'cherry', 'bell', 'lemon', 'cherry', 'bar', 'lemon', 'bell', 'diamond',
   'cherry', 'lemon', 'bell', 'cherry', 'bar', 'bell', 'seven', 'lemon', 'cherry', 'diamond', 'lemon'],
  ['cherry', 'lemon', 'bell', 'cherry', 'lemon', 'bar', 'cherry', 'bell', 'diamond',
   'lemon', 'cherry', 'bell', 'lemon', 'bar', 'bell', 'cherry', 'diamond', 'lemon', 'bar', 'seven'],
  ['lemon', 'cherry', 'lemon', 'bell', 'cherry', 'lemon', 'bar', 'bell', 'lemon',
   'diamond', 'cherry', 'bell', 'lemon', 'cherry', 'bar', 'bell', 'lemon', 'diamond', 'cherry', 'seven'],
] as const;

// ============================================
// TABLE DES GAINS (PAYTABLE)
// ============================================

export interface PayoutRule {
  /** null = n'importe quel symbole */
  reels: [SlotSymbol | null, SlotSymbol | null, SlotSymbol | null];
  /** Multiplicateur de la mise */
  multiplier: number;
  label: string;
  isJackpot?: boolean;
}

/** Règles évaluées dans l'ordre — première correspondance gagne */
export const PAYTABLE: PayoutRule[] = [
  // ── Triple identique ──────────────────────────────
  { reels: ['seven',   'seven',   'seven'  ], multiplier: 100, label: '🎰 JACKPOT 777 !', isJackpot: true },
  { reels: ['bar',     'bar',     'bar'    ], multiplier: 30,  label: 'BAR BAR BAR' },
  { reels: ['diamond', 'diamond', 'diamond'], multiplier: 20,  label: '💎 Triple Diamant' },
  { reels: ['bell',    'bell',    'bell'   ], multiplier: 15,  label: '🔔 Triple Cloche' },
  { reels: ['cherry',  'cherry',  'cherry' ], multiplier: 8,   label: '🍒 Triple Cerise' },
  { reels: ['lemon',   'lemon',   'lemon'  ], multiplier: 4,   label: '🍋 Triple Citron' },
  // ── Deux sevens (any position) ────────────────────
  // (handled in resolver logic, not via simple rule matching)
];

/** Règles spéciales pour les sevens partiels */
export const SEVEN_PARTIAL_PAYOUTS: { count: number; multiplier: number; label: string }[] = [
  { count: 2, multiplier: 10, label: '2 × 7 — Bonus !' },
  { count: 1, multiplier: 2,  label: '1 × 7 — Consolation' },
];
