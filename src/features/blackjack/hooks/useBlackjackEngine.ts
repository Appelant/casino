/**
 * Hook principal pour la logique de jeu du Blackjack
 * Implémente une FSM (Finite State Machine) via useReducer
 *
 * États: idle → bet → deal → playerTurn → dealerTurn → settle → idle
 */

import { useReducer, useCallback, useRef } from 'react';
import type { Card, Hand } from '@/types';
import { usePlayerStore } from '@/stores';
import { useHistoryStore } from '@/stores';
import { createHand, calculateHand, compareHands } from '../utils/handCalculator';
import { simulateDealerTurn } from '../utils/dealerStrategy';
import { calculatePayout, calculateNetProfit } from '@/utils/payouts/blackjackPayout';
import { useBlackjackDeck } from './useBlackjackDeck';

type BlackjackOutcome = 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | 'dealerBust';

// ============================================
// TYPES DE LA FSM
// ============================================

type GameStatus = 'idle' | 'bet' | 'deal' | 'playerTurn' | 'dealerTurn' | 'settle';

interface BlackjackState {
  status: GameStatus;
  playerHand: Hand | null;
  dealerHand: Hand | null;
  currentBet: number;
  insuranceBet: number;
  outcome: BlackjackOutcome | null;
  payout: number;
  error: string | null;
}

type BlackjackAction =
  | { type: 'START_BET' }
  | { type: 'PLACE_BET'; payload: number }
  | { type: 'DEAL' }
  | { type: 'PLAYER_HIT'; payload: Hand }
  | { type: 'PLAYER_STAND' }
  | { type: 'PLAYER_DOUBLE'; payload: { hand: Hand; additionalBet: number } }
  | { type: 'PLAYER_BLACKJACK' }
  | { type: 'PLAYER_BUST' }
  | { type: 'DEALER_TURN'; payload: Hand }
  | { type: 'SETTLE'; payload: { outcome: BlackjackOutcome; payout: number } }
  | { type: 'RESET' }
  | { type: 'SET_ERROR'; payload: string };

// ============================================
// REDUCER
// ============================================

function blackjackReducer(state: BlackjackState, action: BlackjackAction): BlackjackState {
  switch (action.type) {
    case 'START_BET':
      return { ...state, status: 'bet', error: null };

    case 'PLACE_BET':
      return { ...state, currentBet: action.payload, status: 'deal' };

    case 'DEAL':
      return { ...state, status: 'playerTurn' };

    case 'PLAYER_HIT':
      return { ...state, playerHand: action.payload };

    case 'PLAYER_STAND':
      return { ...state, status: 'dealerTurn' };

    case 'PLAYER_DOUBLE':
      return {
        ...state,
        playerHand: action.payload.hand,
        currentBet: state.currentBet + action.payload.additionalBet,
        status: 'dealerTurn',
      };

    case 'PLAYER_BLACKJACK':
      return { ...state, status: 'settle' };

    case 'PLAYER_BUST':
      return { ...state, status: 'settle', outcome: 'bust', payout: 0 };

    case 'DEALER_TURN':
      return { ...state, dealerHand: action.payload, status: 'settle' };

    case 'SETTLE':
      return {
        ...state,
        outcome: action.payload.outcome,
        payout: action.payload.payout,
      };

    case 'RESET':
      return {
        status: 'idle',
        playerHand: null,
        dealerHand: null,
        currentBet: 0,
        insuranceBet: 0,
        outcome: null,
        payout: 0,
        error: null,
      };

    case 'SET_ERROR':
      return { ...state, status: 'idle', error: action.payload };

    default:
      return state;
  }
}

// ============================================
// HOOK PRINCIPAL
// ============================================

const INITIAL_STATE: BlackjackState = {
  status: 'idle',
  playerHand: null,
  dealerHand: null,
  currentBet: 0,
  insuranceBet: 0,
  outcome: null,
  payout: 0,
  error: null,
};

export function useBlackjackEngine() {
  const [state, dispatch] = useReducer(blackjackReducer, INITIAL_STATE);

  // Stores externes
  const playerStore = usePlayerStore();
  const addRound = useHistoryStore((s) => s.addRound);

  // Gestion du sabot
  const { draw, resetShoe, needsShuffle } = useBlackjackDeck();

  // Ref pour éviter les appels multiples
  const isProcessing = useRef(false);

  /**
   * Démarre la phase de mise
   */
  const startBetting = useCallback(() => {
    dispatch({ type: 'START_BET' });
  }, []);

  /**
   * Place la mise initiale et distribue les cartes
   */
  const placeBet = useCallback((amount: number) => {
    // Vérifier le solde
    const canBet = playerStore.placeBet(amount);
    if (!canBet) {
      dispatch({ type: 'SET_ERROR', payload: 'Solde insuffisant' });
      return false;
    }

    dispatch({ type: 'PLACE_BET', payload: amount });
    return true;
  }, [playerStore]);

  /**
   * Distribue les cartes (2 joueur + 2 dealer)
   */
  const deal = useCallback(() => {
    if (state.status !== 'deal') return;

    // Vérifier si le sabot doit être remélangé
    if (needsShuffle()) {
      resetShoe();
    }

    // Distribuer 2 cartes au joueur et 2 au dealer (1 face-down)
    const playerCards: Card[] = [];
    const dealerCards: Card[] = [];

    // Distribution en alternance
    playerCards.push(draw()!);
    dealerCards.push(draw()!);
    playerCards.push(draw()!);
    const dealerHiddenCard = draw();
    if (dealerHiddenCard) {
      dealerHiddenCard.isFaceDown = true;
      dealerCards.push(dealerHiddenCard);
    }

    const playerHand = createHand(playerCards);
    const dealerHand = createHand(dealerCards);

    // Mettre à jour l'état
    dispatch({ type: 'DEAL' });

    // Vérifier blackjack naturel du joueur
    if (playerHand.isBlackjack) {
      // Vérifier si le dealer a aussi blackjack
      const dealerShowing = dealerCards.find((c) => !c.isFaceDown);
      if (dealerShowing && ['A', '10', 'J', 'Q', 'K'].includes(dealerShowing.rank)) {
        // Révéler la carte cachée pour vérification
        const hiddenCard = dealerCards.find((c) => c.isFaceDown);
        if (hiddenCard) {
          hiddenCard.isFaceDown = false;
          const dealerValue = calculateHand(dealerCards);
          if (dealerValue.isBlackjack) {
            // Push - les deux ont blackjack
            dispatch({ type: 'SETTLE', payload: { outcome: 'push', payout: state.currentBet } });
            settleRound('push', state.currentBet, playerHand, { ...dealerHand, cards: dealerCards });
            return;
          }
        }
      }

      // Blackjack naturel du joueur seul
      const payout = calculatePayout('blackjack', state.currentBet);
      dispatch({ type: 'PLAYER_BLACKJACK' });
      settleRound('blackjack', payout, playerHand, { ...dealerHand, cards: dealerCards });
    } else {
      // Continuer avec le tour du joueur
      // On garde dealerHand avec la carte face-down pour l'UI
    }
  }, [state.status, state.currentBet]);

  /**
   * Le joueur prend une carte (hit)
   */
  const hit = useCallback(() => {
    if (state.status !== 'playerTurn' || !state.playerHand) return;

    const card = draw();
    if (!card) return;

    const newHand = createHand([...state.playerHand.cards, card]);

    if (newHand.isBust) {
      dispatch({ type: 'PLAYER_BUST' });
      settleRound('bust', 0, newHand, state.dealerHand);
    } else {
      dispatch({ type: 'PLAYER_HIT', payload: newHand });
    }
  }, [state.status, state.playerHand, state.dealerHand]);

  /**
   * Le joueur s'arrête (stand)
   */
  const stand = useCallback(() => {
    if (state.status !== 'playerTurn') return;
    dispatch({ type: 'PLAYER_STAND' });
  }, [state.status]);

  /**
   * Le joueur double (double down)
   */
  const doubleDown = useCallback(() => {
    if (state.status !== 'playerTurn' || !state.playerHand) return;

    const additionalBet = state.currentBet;
    const canDouble = playerStore.placeBet(additionalBet);
    if (!canDouble) {
      dispatch({ type: 'SET_ERROR', payload: 'Solde insuffisant pour doubler' });
      return;
    }

    const card = draw();
    if (!card) return;

    const newHand = createHand([...state.playerHand.cards, card]);
    dispatch({ type: 'PLAYER_DOUBLE', payload: { hand: newHand, additionalBet } });

    // Si bust après double, perte immédiate
    if (newHand.isBust) {
      settleRound('bust', 0, newHand, state.dealerHand);
    }
  }, [state.status, state.playerHand, state.currentBet, playerStore]);

  /**
   * Tour automatique du dealer
   */
  const playDealerTurn = useCallback(() => {
    if (state.status !== 'dealerTurn' || !state.dealerHand) return;
    if (isProcessing.current) return;

    isProcessing.current = true;

    // Révéler la carte cachée
    const dealerCards = state.dealerHand.cards.map((c) => ({ ...c, isFaceDown: false }));

    // Simuler le tour du dealer selon la stratégie H17
    const finalDealerCards = simulateDealerTurn(dealerCards, () => draw()!);
    const finalDealerHand = createHand(finalDealerCards);

    dispatch({ type: 'DEALER_TURN', payload: finalDealerHand });

    // Déterminer le résultat
    if (finalDealerHand.isBust) {
      // Dealer bust → joueur gagne
      const payout = calculatePayout('dealerBust', state.currentBet);
      settleRound('dealerBust', payout, state.playerHand, finalDealerHand);
    } else {
      // Comparer les mains
      const playerValue = state.playerHand ? calculateHand(state.playerHand.cards) : { total: 0 };
      const comparison = compareHands(playerValue.total, finalDealerHand.total);

      let outcome: BlackjackOutcome;
      let payout: number;

      switch (comparison) {
        case 'player':
          outcome = 'win';
          payout = calculatePayout('win', state.currentBet);
          break;
        case 'dealer':
          outcome = 'lose';
          payout = 0;
          break;
        default:
          outcome = 'push';
          payout = calculatePayout('push', state.currentBet);
      }

      settleRound(outcome, payout, state.playerHand, finalDealerHand);
    }

    isProcessing.current = false;
  }, [state.status, state.dealerHand, state.playerHand, state.currentBet]);

  /**
   * Enregistre le round terminé et crédite le joueur
   */
  const settleRound = useCallback(
    (outcome: BlackjackOutcome, payout: number, playerHand: Hand | null, dealerHand: Hand | null) => {
      dispatch({ type: 'SETTLE', payload: { outcome, payout } });

      // Créditer le joueur si gain
      if (payout > 0) {
        playerStore.receiveWin(payout);
      }

      // Enregistrer dans l'historique
      if (playerHand && dealerHand) {
        const round: import('@/types').GameResult = {
          id: `bj_${Date.now()}`,
          gameId: 'blackjack' as const,
          timestamp: Date.now(),
          wagered: state.currentBet,
          won: payout,
          netProfit: calculateNetProfit(outcome as any, state.currentBet),
          isWin: payout > state.currentBet,
          details: {
            playerHand: playerHand.cards.map((c) => `${c.rank}${c.suit[0]}`),
            dealerHand: dealerHand.cards.map((c) => `${c.rank}${c.suit[0]}`),
            playerTotal: playerHand.total,
            dealerTotal: dealerHand.total,
            outcome: outcome as any,
            isBlackjack: playerHand.isBlackjack,
            isDouble: false,
            isSplit: false,
          },
        };

        addRound(round);
      }
    },
    [state.currentBet, playerStore, addRound]
  );

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
    playerHand: state.playerHand,
    dealerHand: state.dealerHand,
    currentBet: state.currentBet,
    outcome: state.outcome,
    payout: state.payout,
    error: state.error,

    // Actions
    startBetting,
    placeBet,
    deal,
    hit,
    stand,
    doubleDown,
    playDealerTurn,
    reset,
  };
}
