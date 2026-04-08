/**
 * Hook principal pour la logique du jeu de dés
 * Implémente une FSM (Finite State Machine) via useReducer
 *
 * États: idle → betting → rolling → result → idle
 */

import { useReducer, useCallback, useRef } from 'react';
import type { DiceFace, DiceResult, GameResult } from '@/types';
import { secureRandomInt } from '@/utils/rng/rng';
import { resolveDice } from '../utils/diceResolver';
import { usePlayerStore } from '@/stores';
import { useAuthStore } from '@/stores/auth/authStore';
import { DICE_MIN_BET } from '../utils/diceConstants';

// ============================================
// TYPES DE LA FSM
// ============================================

type DiceStatus = 'idle' | 'betting' | 'rolling' | 'result';

interface DiceState {
  status: DiceStatus;
  chosenFace: DiceFace | null;
  betAmount: number;
  rolledFace: DiceFace | null;
  lastResult: DiceResult | null;
  error: string | null;
}

type DiceAction =
  | { type: 'START_BETTING' }
  | { type: 'CHOOSE_FACE'; payload: DiceFace }
  | { type: 'SET_BET'; payload: number }
  | { type: 'ROLL'; payload: DiceFace }
  | { type: 'RESOLVE'; payload: DiceResult }
  | { type: 'RESET' }
  | { type: 'SET_ERROR'; payload: string };

// ============================================
// REDUCER
// ============================================

function diceReducer(state: DiceState, action: DiceAction): DiceState {
  switch (action.type) {
    case 'START_BETTING':
      return { ...state, status: 'betting', error: null };

    case 'CHOOSE_FACE':
      return { ...state, chosenFace: action.payload };

    case 'SET_BET':
      return { ...state, betAmount: action.payload };

    case 'ROLL':
      return { ...state, status: 'rolling', rolledFace: action.payload };

    case 'RESOLVE':
      return { ...state, status: 'result', lastResult: action.payload };

    case 'RESET':
      return {
        status: 'idle',
        chosenFace: null,
        betAmount: DICE_MIN_BET,
        rolledFace: null,
        lastResult: null,
        error: null,
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// ============================================
// ÉTAT INITIAL
// ============================================

const INITIAL_STATE: DiceState = {
  status: 'idle',
  chosenFace: null,
  betAmount: DICE_MIN_BET,
  rolledFace: null,
  lastResult: null,
  error: null,
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useDiceEngine() {
  const [state, dispatch] = useReducer(diceReducer, INITIAL_STATE);

  const playerBalance = usePlayerStore((s) => s.balance);
  const playerPlaceBet = usePlayerStore((s) => s.placeBet);
  const playerReceiveWin = usePlayerStore((s) => s.receiveWin);

  const isProcessing = useRef(false);

  const startBetting = useCallback(() => {
    dispatch({ type: 'START_BETTING' });
  }, []);

  const chooseFace = useCallback((face: DiceFace) => {
    if (state.status !== 'betting' && state.status !== 'idle') return;
    dispatch({ type: 'CHOOSE_FACE', payload: face });
  }, [state.status]);

  const setBetAmount = useCallback((amount: number) => {
    if (state.status !== 'betting' && state.status !== 'idle') return;
    dispatch({ type: 'SET_BET', payload: amount });
  }, [state.status]);

  /**
   * Lance le dé — génère la face gagnante avant l'animation
   */
  const roll = useCallback(() => {
    if (state.status !== 'betting' || state.chosenFace === null) return false;
    if (playerBalance < state.betAmount) {
      dispatch({ type: 'SET_ERROR', payload: 'Solde insuffisant' });
      return false;
    }

    const rolledFace = secureRandomInt(1, 6) as DiceFace;
    playerPlaceBet(state.betAmount);
    dispatch({ type: 'ROLL', payload: rolledFace });
    isProcessing.current = true;
    return true;
  }, [state.status, state.chosenFace, state.betAmount, playerBalance, playerPlaceBet]);

  /**
   * Résout le lancer — à appeler quand l'animation se termine
   */
  const resolveRoll = useCallback(() => {
    if (!isProcessing.current || state.status !== 'rolling') return;
    if (state.chosenFace === null || state.rolledFace === null) return;

    const result = resolveDice(state.chosenFace, state.rolledFace, state.betAmount);
    dispatch({ type: 'RESOLVE', payload: result });

    if (result.won > 0) {
      playerReceiveWin(result.won);
    }

    const round: GameResult = {
      id: `round_${Date.now()}`,
      gameId: 'dice' as const,
      timestamp: Date.now(),
      wagered: result.wagered,
      won: result.won,
      netProfit: result.netProfit,
      isWin: result.isWin,
      details: {
        rolledFace: result.rolledFace,
        chosenFace: result.chosenFace,
        outcome: result.isWin ? 'win' : 'lose',
      },
    };

    const currentBalance = useAuthStore.getState().currentUser?.balance ?? 0;
    useAuthStore.getState().recordRound({
      wagered: result.wagered,
      won: result.won,
      netProfit: result.netProfit,
      isWin: result.isWin,
      newBalance: currentBalance,
      round,
    });

    isProcessing.current = false;
  }, [state.status, state.chosenFace, state.rolledFace, state.betAmount, playerReceiveWin]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    status: state.status,
    chosenFace: state.chosenFace,
    betAmount: state.betAmount,
    rolledFace: state.rolledFace,
    lastResult: state.lastResult,
    error: state.error,
    startBetting,
    chooseFace,
    setBetAmount,
    roll,
    resolveRoll,
    reset,
  };
}
