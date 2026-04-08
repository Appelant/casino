/**
 * Hook principal pour la logique de jeu de la roulette
 * Implémente une FSM (Finite State Machine) via useReducer
 *
 * États: idle → betting → spinning → result → idle
 */

import { useReducer, useCallback, useRef } from 'react';
import type { RouletteBet, SpinResult, GameResult } from '@/types';
import { secureRandomInt } from '../../../utils/rng/rng';
import { resolveBets } from '../utils/betResolver';
import { usePlayerStore } from '@/stores';
import { useAuthStore } from '@/stores/auth/authStore';
import { ROULETTE_PAYOUTS } from '../utils/rouletteConstants';

// ============================================
// TYPES DE LA FSM
// ============================================

type GameStatus = 'idle' | 'betting' | 'spinning' | 'result';

interface RouletteState {
  status: GameStatus;
  currentBets: RouletteBet[];
  lastResult: SpinResult | null;
  winningNumber: number | null;  // Stocké avant le spin pour l'animation
  error: string | null;
}

type RouletteAction =
  | { type: 'START_BETTING' }
  | { type: 'PLACE_BET'; payload: RouletteBet }
  | { type: 'REMOVE_BET'; payload: string }
  | { type: 'CLEAR_BETS' }
  | { type: 'SPIN'; payload: number }  // Numéro gagnant généré avant le spin
  | { type: 'RESOLVE'; payload: SpinResult }
  | { type: 'RESET' }
  | { type: 'SET_ERROR'; payload: string };

// ============================================
// REDUCER
// ============================================

function rouletteReducer(state: RouletteState, action: RouletteAction): RouletteState {
  switch (action.type) {
    case 'START_BETTING':
      return { ...state, status: 'betting', error: null };

    case 'PLACE_BET':
      return { ...state, currentBets: [...state.currentBets, action.payload] };

    case 'REMOVE_BET':
      return { ...state, currentBets: state.currentBets.filter((b) => b.id !== action.payload) };

    case 'CLEAR_BETS':
      return { ...state, currentBets: [] };

    case 'SPIN':
      return { ...state, status: 'spinning', winningNumber: action.payload };

    case 'RESOLVE':
      return { ...state, status: 'result', lastResult: action.payload };

    case 'RESET':
      return { status: 'idle', currentBets: [], lastResult: null, winningNumber: null, error: null };

    case 'SET_ERROR':
      return { ...state, status: 'idle', error: action.payload };

    default:
      return state;
  }
}

// ============================================
// HOOK PRINCIPAL
// ============================================

const INITIAL_STATE: RouletteState = {
  status: 'idle',
  currentBets: [],
  lastResult: null,
  winningNumber: null,
  error: null,
};

export function useRouletteEngine() {
  const [state, dispatch] = useReducer(rouletteReducer, INITIAL_STATE);

  // Stores externes - accès direct aux valeurs et actions
  const playerBalance = usePlayerStore((s) => s.balance);
  const playerPlaceBet = usePlayerStore((s) => s.placeBet);
  const playerReceiveWin = usePlayerStore((s) => s.receiveWin);

  // Ref pour éviter les appels multiples
  const isProcessing = useRef(false);

  /**
   * Démarre la phase de mises
   */
  const startBetting = useCallback(() => {
    dispatch({ type: 'START_BETTING' });
  }, []);

  /**
   * Place une mise
   */
  const placeBet = useCallback((bet: RouletteBet) => {
    if (state.status !== 'betting' && state.status !== 'idle') {
      return false;
    }

    // Vérifier le solde du joueur
    if (playerBalance < bet.amount) {
      dispatch({ type: 'SET_ERROR', payload: 'Solde insuffisant' });
      return false;
    }

    // Déduire du solde ET ajouter la mise
    playerPlaceBet(bet.amount);
    dispatch({ type: 'PLACE_BET', payload: bet });
    return true;
  }, [state.status, playerBalance, playerPlaceBet]);

  /**
   * Supprime une mise
   */
  const removeBet = useCallback((betId: string) => {
    if (state.status !== 'betting') return;

    const bet = state.currentBets.find((b) => b.id === betId);
    if (bet) {
      // Rembourser la mise
      playerReceiveWin(bet.amount);
      dispatch({ type: 'REMOVE_BET', payload: betId });
    }
  }, [state.status, state.currentBets, playerReceiveWin]);

  /**
   * Annule toutes les mises
   */
  const clearBets = useCallback(() => {
    if (state.status !== 'betting') return;

    // Rembourser toutes les mises
    const total = state.currentBets.reduce((sum, b) => sum + b.amount, 0);
    playerReceiveWin(total);
    dispatch({ type: 'CLEAR_BETS' });
  }, [state.status, state.currentBets, playerReceiveWin]);

  /**
   * Lance le spin de la roue
   * Génère le numéro gagnant AVANT le spin pour l'animation
   */
  const spin = useCallback(() => {
    if (state.status !== 'betting' || state.currentBets.length === 0) {
      return;
    }

    // Générer le numéro gagnant MAINTENANT (avant l'animation)
    const winningNumber = secureRandomInt(0, 36);
    dispatch({ type: 'SPIN', payload: winningNumber });
    isProcessing.current = true;
  }, [state.status, state.currentBets.length]);

  /**
   * Résout les mises avec le numéro déjà généré
   * À appeler quand l'animation de la roue se termine
   */
  const resolveSpin = useCallback(() => {
    if (!isProcessing.current || state.status !== 'spinning') {
      return;
    }

    // Utiliser le numéro déjà généré (ou fallback en cas d'erreur)
    const winningNumber = state.winningNumber ?? secureRandomInt(0, 36);

    // Résoudre les mises
    const result = resolveBets(state.currentBets, winningNumber);

    // Mettre à jour l'état
    dispatch({ type: 'RESOLVE', payload: result });

    // Construire le round à enregistrer
    const round: GameResult = {
      id: `round_${Date.now()}`,
      gameId: 'roulette' as const,
      timestamp: Date.now(),
      wagered: result.totalLost,
      won: result.totalWon,
      netProfit: result.totalWon - result.totalLost,
      isWin: result.totalWon > result.totalLost,
      details: {
        winningNumber,
        winningColor: result.winningColor,
        bets: state.currentBets.map((b) => ({
          betType: b.type,
          numbers: b.numbers,
          amount: b.amount,
          won: result.winningBets.find((wb) => wb.id === b.id) ? calculatePayout(b) : 0,
          isWinner: result.winningBets.some((wb) => wb.id === b.id),
        })),
      },
    };

    // Créditer le joueur si gain
    if (result.totalWon > 0) {
      playerReceiveWin(result.totalWon);
    }

    // Enregistrer le round pour ELO + stats + historique utilisateur (DB + sync authStore)
    const currentBalance = useAuthStore.getState().currentUser?.balance ?? 0;
    useAuthStore.getState().recordRound({
      wagered: result.totalLost,
      won: result.totalWon,
      netProfit: result.totalWon - result.totalLost,
      isWin: result.totalWon > result.totalLost,
      newBalance: currentBalance,
      round,
    });

    isProcessing.current = false;
  }, [state.status, state.currentBets, state.winningNumber, playerReceiveWin]);

  /**
   * Réinitialise pour une nouvelle partie
   */
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // ============================================
  // RETOUR DU HOOK
  // ============================================

  return {
    // État
    status: state.status,
    currentBets: state.currentBets,
    lastResult: state.lastResult,
    winningNumber: state.winningNumber,  // Numéro généré pour l'animation
    error: state.error,

    // Actions
    startBetting,
    placeBet,
    removeBet,
    clearBets,
    spin,
    resolveSpin,
    reset,
  };
}

/**
 * Calcule le payout pour une mise
 */
function calculatePayout(bet: RouletteBet): number {
  const ratio = ROULETTE_PAYOUTS[bet.type as keyof typeof ROULETTE_PAYOUTS] ?? 0;
  return bet.amount * (ratio + 1);
}
