/**
 * Constantes du jeu de dés
 */

import { GAME_CONFIG } from '@/config/game.config';

export const DICE_PAYOUT = GAME_CONFIG.DICE_PAYOUT;
export const DICE_SIDES = GAME_CONFIG.DICE_SIDES;
export const DICE_MIN_BET = GAME_CONFIG.MIN_BET;
export const DICE_MAX_BET = GAME_CONFIG.MAX_BET;

/** Durée de l'animation de lancer en ms */
export const DICE_ROLL_DURATION_MS = 3000;

/** Durée réduite pour prefers-reduced-motion en ms */
export const DICE_ROLL_DURATION_REDUCED_MS = 200;
