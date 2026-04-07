/**
 * Hook de gestion des mises pour la roulette
 */

import { useState, useCallback, useMemo } from 'react';
import type { RouletteBet } from '@/types';
import { GAME_CONFIG } from '@/config/game.config';

/**
 * Hook pour gérer les mises de roulette
 *
 * @returns Objet avec les mises actuelles et les actions disponibles
 */
export function useRouletteBets() {
  const [bets, setBets] = useState<RouletteBet[]>([]);

  /**
   * Ajoute une mise
   */
  const addBet = useCallback((bet: RouletteBet) => {
    setBets((prev) => [...prev, bet]);
  }, []);

  /**
   * Supprime une mise par son ID
   */
  const removeBet = useCallback((betId: string) => {
    setBets((prev) => prev.filter((b) => b.id !== betId));
  }, []);

  /**
   * Supprime toutes les mises
   */
  const clearBets = useCallback(() => {
    setBets([]);
  }, []);

  /**
   * Total misé en centimes
   */
  const totalBet = useMemo(() => {
    return bets.reduce((sum, bet) => sum + bet.amount, 0);
  }, [bets]);

  /**
   * Vérifie si on peut placer une mise (dans les limites)
   */
  const canAddBet = useCallback((additionalAmount: number): boolean => {
    const newTotal = totalBet + additionalAmount;
    return newTotal <= GAME_CONFIG.MAX_BET;
  }, [totalBet]);

  /**
   * Nombre de mises placées
   */
  const betCount = bets.length;

  /**
   * Vérifie s'il y a des mises actives
   */
  const hasBets = betCount > 0;

  return {
    bets,
    totalBet,
    betCount,
    hasBets,
    addBet,
    removeBet,
    clearBets,
    canAddBet,
  };
}
