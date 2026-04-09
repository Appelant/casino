/**
 * Hook principal — Machine à états (FSM) pour la machine à sous
 * États : idle → betting → spinning → result → idle
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { usePlayerStore, selectCanBet } from '@/stores';
import { useUIStore } from '@/stores/ui/uiStore';
import { useAuthStore } from '@/stores/auth/authStore';
import type { SlotsResult, ReelResult, GameResult } from '@/types';
import { spinAndResolve, isValidBet } from '../utils/slotsResolver';
import { formatCurrency } from '@/utils/currency';
import {
  SLOTS_RESOLVE_DELAY_MS,
  SLOTS_RESOLVE_DELAY_REDUCED_MS,
  SLOTS_MIN_BET,
} from '../utils/slotsConstants';

// ============================================
// MACHINE À ÉTATS (FSM)
// ============================================

export type SlotsStatus = 'idle' | 'betting' | 'spinning' | 'result';

interface UseSlotsEngineReturn {
  // État
  status: SlotsStatus;
  currentWager: number;
  result: SlotsResult | null;
  /** Symboles cibles connus dès le lancement du spin (avant résolution) */
  targetReels: ReelResult | null;

  // Actions
  setWager: (amount: number) => void;
  placeBet: () => void;
  spin: () => void;
  /** Action combinée : mise + spin en un seul clic (idle → spinning direct) */
  placeBetAndSpin: () => void;
  reset: () => void;

  // Utils
  isSpinning: boolean;
  isResult: boolean;
  canSpin: boolean;
}

export function useSlotsEngine(): UseSlotsEngineReturn {
  // État FSM
  const [status, setStatus] = useState<SlotsStatus>('idle');
  const [currentWager, setCurrentWager] = useState<number>(SLOTS_MIN_BET);
  const [result, setResult] = useState<SlotsResult | null>(null);
  const [targetReels, setTargetReels] = useState<ReelResult | null>(null);

  // Stores
  const { addToast } = useUIStore();
  const { placeBet: deductBet, receiveWin } = usePlayerStore();

  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const resolveDelay = prefersReducedMotion
    ? SLOTS_RESOLVE_DELAY_REDUCED_MS
    : SLOTS_RESOLVE_DELAY_MS;

  // ============================================
  // ACTIONS
  // ============================================

  const setWager = useCallback((amount: number) => {
    setCurrentWager(amount);
  }, []);

  const placeBet = useCallback(() => {
    if (!isValidBet(currentWager)) {
      addToast({
        level: 'error',
        message: `Mise invalide (min. ${formatCurrency(SLOTS_MIN_BET)})`,
        duration: 3000,
      });
      return;
    }

    if (!selectCanBet(currentWager)) {
      addToast({
        level: 'error',
        message: 'Solde insuffisant pour placer cette mise',
        duration: 3000,
      });
      return;
    }

    deductBet(currentWager);
    setStatus('betting');
  }, [currentWager, deductBet, addToast]);

  const spin = useCallback(() => {
    if (status !== 'betting') return;

    // Résultat déterminé à l'avance (anti-triche)
    const spinResult = spinAndResolve(currentWager);

    // Exposer les symboles cibles immédiatement pour l'animation
    setTargetReels(spinResult.reels);
    setStatus('spinning');

    spinTimeoutRef.current = setTimeout(() => {
      setResult(spinResult);
      setStatus('result');

      if (spinResult.isWin) {
        receiveWin(spinResult.won);
        addToast({
          level: 'success',
          message: spinResult.isJackpot
            ? `🎰 JACKPOT ! +${formatCurrency(spinResult.won)}`
            : `+${formatCurrency(spinResult.won)} (${spinResult.winLabel})`,
          duration: 4000,
        });
      } else {
        addToast({
          level: 'error',
          message: `-${formatCurrency(currentWager)}`,
          duration: 3000,
        });
      }

      // Enregistrer le round en base (stats + historique)
      const round: GameResult = {
        id: `round_${Date.now()}`,
        gameId: 'slots',
        timestamp: Date.now(),
        wagered: spinResult.wagered,
        won: spinResult.won,
        netProfit: spinResult.netProfit,
        isWin: spinResult.isWin,
        details: {
          reels: spinResult.reels,
          multiplier: spinResult.multiplier,
          isJackpot: spinResult.isJackpot,
          winLabel: spinResult.winLabel,
          outcome: spinResult.isWin ? 'win' : 'lose',
        },
      };

      const newBalance = useAuthStore.getState().currentUser?.balance ?? 0;
      useAuthStore.getState().recordRound({
        wagered: spinResult.wagered,
        won: spinResult.won,
        netProfit: spinResult.netProfit,
        isWin: spinResult.isWin,
        newBalance,
        round,
      });
    }, resolveDelay);
  }, [status, currentWager, resolveDelay, addToast, receiveWin]);

  /** Action combinée : déduit la mise + lance le spin sans passer par 'betting' */
  const placeBetAndSpin = useCallback(() => {
    if (status !== 'idle') return;

    if (!isValidBet(currentWager)) {
      addToast({ level: 'error', message: `Mise invalide (min. ${formatCurrency(SLOTS_MIN_BET)})`, duration: 3000 });
      return;
    }
    if (!selectCanBet(currentWager)) {
      addToast({ level: 'error', message: 'Solde insuffisant', duration: 3000 });
      return;
    }

    deductBet(currentWager);

    const spinResult = spinAndResolve(currentWager);
    setTargetReels(spinResult.reels);
    setStatus('spinning');

    spinTimeoutRef.current = setTimeout(() => {
      setResult(spinResult);
      setStatus('result');

      if (spinResult.isWin) {
        receiveWin(spinResult.won);
        addToast({
          level: 'success',
          message: spinResult.isJackpot
            ? `🎰 JACKPOT ! +${formatCurrency(spinResult.won)}`
            : `+${formatCurrency(spinResult.won)} (${spinResult.winLabel})`,
          duration: 4000,
        });
      } else {
        addToast({ level: 'error', message: `-${formatCurrency(currentWager)}`, duration: 3000 });
      }

      const round: GameResult = {
        id: `round_${Date.now()}`,
        gameId: 'slots',
        timestamp: Date.now(),
        wagered: spinResult.wagered,
        won: spinResult.won,
        netProfit: spinResult.netProfit,
        isWin: spinResult.isWin,
        details: {
          reels: spinResult.reels,
          multiplier: spinResult.multiplier,
          isJackpot: spinResult.isJackpot,
          winLabel: spinResult.winLabel,
          outcome: spinResult.isWin ? 'win' : 'lose',
        },
      };

      const newBalance = useAuthStore.getState().currentUser?.balance ?? 0;
      useAuthStore.getState().recordRound({
        wagered: spinResult.wagered,
        won: spinResult.won,
        netProfit: spinResult.netProfit,
        isWin: spinResult.isWin,
        newBalance,
        round,
      });
    }, resolveDelay);
  }, [status, currentWager, resolveDelay, deductBet, receiveWin, addToast]);

  const reset = useCallback(() => {
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    setStatus('idle');
    setResult(null);
    setTargetReels(null);
  }, []);

  // ============================================
  // DÉRIVÉS
  // ============================================

  const isSpinning = status === 'spinning';
  const isResult = status === 'result';
  const canSpin = status === 'idle' && isValidBet(currentWager);

  return {
    status,
    currentWager,
    result,
    targetReels,
    setWager,
    placeBet,
    spin,
    placeBetAndSpin,
    reset,
    isSpinning,
    isResult,
    canSpin,
  };
}
