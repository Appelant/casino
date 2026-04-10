/**
 * Hook principal du jeu Mines
 *
 * Gère la communication avec le backend et l'état local de la partie.
 * Toute la logique métier (mines, multiplicateurs, validations) vit côté serveur.
 */

import { useReducer, useCallback } from 'react';
import type { MinesRoundPublic } from '@/types';
import { usePlayerStore } from '@/stores';
import { useAuthStore } from '@/stores/auth/authStore';
import { useUIStore } from '@/stores/ui/uiStore';
import { GAME_CONFIG } from '@/config/game.config';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`;

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error('Serveur injoignable — relance npm run server');
  }
  const data = await res.json() as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
  return data;
}

// ── FSM ───────────────────────────────────────────────────────────────────────

type MinesEngineStatus = 'idle' | 'active' | 'cashed_out' | 'exploded';

interface MinesEngineState {
  status: MinesEngineStatus;
  round: MinesRoundPublic | null;
  wager: number;
  mineCount: number;
  isLoading: boolean;
  error: string | null;
}

type MinesEngineAction =
  | { type: 'SET_WAGER'; payload: number }
  | { type: 'SET_MINE_COUNT'; payload: number }
  | { type: 'START_LOADING' }
  | { type: 'START_SUCCESS'; payload: MinesRoundPublic }
  | { type: 'REVEAL_SUCCESS'; payload: MinesRoundPublic }
  | { type: 'CASHOUT_SUCCESS'; payload: MinesRoundPublic }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' };

const INITIAL_STATE: MinesEngineState = {
  status: 'idle',
  round: null,
  wager: GAME_CONFIG.CHIP_VALUES[0],
  mineCount: 3,
  isLoading: false,
  error: null,
};

function minesReducer(state: MinesEngineState, action: MinesEngineAction): MinesEngineState {
  switch (action.type) {
    case 'SET_WAGER':
      return { ...state, wager: action.payload, error: null };
    case 'SET_MINE_COUNT':
      return { ...state, mineCount: action.payload, error: null };
    case 'START_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'START_SUCCESS':
      return { ...state, isLoading: false, status: 'active', round: action.payload, error: null };
    case 'REVEAL_SUCCESS': {
      const newStatus: MinesEngineStatus =
        action.payload.status === 'exploded' ? 'exploded' : 'active';
      return { ...state, isLoading: false, status: newStatus, round: action.payload };
    }
    case 'CASHOUT_SUCCESS':
      return { ...state, isLoading: false, status: 'cashed_out', round: action.payload };
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'RESET':
      return { ...INITIAL_STATE, wager: state.wager, mineCount: state.mineCount };
    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMinesEngine() {
  const [state, dispatch] = useReducer(minesReducer, INITIAL_STATE);

  const playerStore = usePlayerStore();
  const addToast = useUIStore((s) => s.addToast);

  const userId = useAuthStore.getState().currentUser?.id;

  // ── Actions ──────────────────────────────────────────────────────────────────

  const setWager = useCallback((amount: number) => {
    if (state.status !== 'idle') return;
    dispatch({ type: 'SET_WAGER', payload: amount });
  }, [state.status]);

  const setMineCount = useCallback((count: number) => {
    if (state.status !== 'idle') return;
    dispatch({ type: 'SET_MINE_COUNT', payload: count });
  }, [state.status]);

  const start = useCallback(async () => {
    if (!userId) { dispatch({ type: 'ERROR', payload: 'Non connecté' }); return; }
    if (state.status !== 'idle') return;
    if (playerStore.balance < state.wager) {
      dispatch({ type: 'ERROR', payload: 'Solde insuffisant' });
      return;
    }

    dispatch({ type: 'START_LOADING' });

    try {
      const data = await apiPost<{ round: MinesRoundPublic }>('/mines/start', {
        userId, mineCount: state.mineCount, wager: state.wager,
      });
      playerStore.placeBet(state.wager);
      dispatch({ type: 'START_SUCCESS', payload: data.round });
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err instanceof Error ? err.message : 'Erreur serveur' });
    }
  }, [userId, state.status, state.wager, state.mineCount, playerStore]);

  const reveal = useCallback(async (tileIndex: number) => {
    if (!userId || state.status !== 'active' || !state.round || state.isLoading) return;

    dispatch({ type: 'START_LOADING' });

    try {
      const data = await apiPost<{ round: MinesRoundPublic; newBalance?: number }>(
        '/mines/reveal',
        { roundId: state.round.id, userId, tileIndex },
      );

      dispatch({ type: 'REVEAL_SUCCESS', payload: data.round });

      if (data.round.status === 'exploded') {
        if (data.newBalance !== undefined) {
          useAuthStore.setState((s) => ({
            currentUser: s.currentUser ? { ...s.currentUser, balance: data.newBalance! } : null,
          }));
        }
        addToast({ level: 'error', message: `Explosion ! -${(state.wager / 100).toLocaleString('fr-FR')} ZVC$`, duration: 3000 });
        setTimeout(() => useAuthStore.getState().refreshUser(), 500);
      }
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err instanceof Error ? err.message : 'Erreur serveur' });
    }
  }, [userId, state.status, state.round, state.isLoading, state.wager, addToast]);

  const cashout = useCallback(async () => {
    if (!userId || state.status !== 'active' || !state.round || state.isLoading) return;
    if ((state.round.revealedSafe ?? 0) === 0) {
      addToast({ level: 'warning', message: 'Révélez au moins une case avant de retirer', duration: 2000 });
      return;
    }

    dispatch({ type: 'START_LOADING' });

    try {
      const data = await apiPost<{ round: MinesRoundPublic; newBalance?: number }>(
        '/mines/cashout',
        { roundId: state.round.id, userId },
      );

      dispatch({ type: 'CASHOUT_SUCCESS', payload: data.round });

      const wonAmount = data.round.wonAmount ?? 0;
      // Sync balance depuis le serveur
      if (data.newBalance !== undefined) {
        useAuthStore.setState((s) => ({
          currentUser: s.currentUser ? { ...s.currentUser, balance: data.newBalance! } : null,
        }));
      }
      const netProfit = wonAmount - state.wager;
      addToast({
        level: 'success',
        message: `Encaissé ! ${netProfit >= 0 ? '+' : ''}${(netProfit / 100).toLocaleString('fr-FR')} ZVC$`,
        duration: 4000,
      });
      setTimeout(() => useAuthStore.getState().refreshUser(), 500);
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err instanceof Error ? err.message : 'Erreur serveur' });
    }
  }, [userId, state.status, state.round, state.isLoading, state.wager, addToast]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    setWager,
    setMineCount,
    start,
    reveal,
    cashout,
    reset,
    canStart: state.status === 'idle' && playerStore.balance >= state.wager,
    canCashout: state.status === 'active' && (state.round?.revealedSafe ?? 0) > 0,
  };
}
