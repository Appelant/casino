/**
 * Hook principal pour la logique de jeu du Blackjack
 * Implémente une FSM (Finite State Machine) via useReducer
 *
 * États: idle → bet → deal → playerTurn → dealerTurn → settle → idle
 */

import { useReducer, useCallback, useRef, useEffect } from 'react';
import type { Card, Hand, Shoe } from '@/types';
import { usePlayerStore } from '@/stores';
import { useAuthStore } from '@/stores/auth/authStore';
import { uuid } from '@/utils/rng/uuid';
import { createHand, calculateHand, compareHands } from '../utils/handCalculator';
import { simulateDealerTurn } from '../utils/dealerStrategy';
import { calculatePayout } from '@/utils/payouts/blackjackPayout';
import { useBlackjackDeck } from './useBlackjackDeck';
import { evaluateSideBets, type SideBetResult } from '../utils/sideBets';

type BlackjackOutcome = 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | 'dealerBust';

// ============================================
// TYPES DE LA FSM
// ============================================

type GameStatus = 'idle' | 'bet' | 'deal' | 'playerTurn' | 'dealerTurn' | 'settle';

interface BlackjackState {
  status: GameStatus;
  playerHand: Hand | null;
  playerHands: Hand[] | null;  // Pour le split (plusieurs mains)
  activeHandIndex: number;     // Index de la main active en cas de split
  dealerHand: Hand | null;
  currentBet: number;
  insuranceBet: number;
  perfectPairsBet: number;     // Mise Perfect Pairs
  twentyOnePlusThreeBet: number; // Mise 21+3
  sideBetResults: SideBetResult[] | null;
  outcome: BlackjackOutcome | null;
  payout: number;
  error: string | null;
}

type BlackjackAction =
  | { type: 'START_BET' }
  | { type: 'PLACE_BET'; payload: { mainBet: number; perfectPairsBet?: number; twentyOnePlusThreeBet?: number } }
  | { type: 'DEAL'; payload: { playerHand: Hand; dealerHand: Hand } }
  | { type: 'PLAYER_HIT'; payload: Hand }
  | { type: 'PLAYER_STAND' }
  | { type: 'PLAYER_DOUBLE'; payload: { hand: Hand; additionalBet: number } }
  | { type: 'PLAYER_BLACKJACK' }
  | { type: 'PLAYER_BUST' }
  | { type: 'SPLIT'; payload: { hands: Hand[] } }
  | { type: 'NEXT_HAND' }
  | { type: 'DEALER_TURN'; payload: Hand }
  | { type: 'SETTLE'; payload: { outcome: BlackjackOutcome; payout: number; sideBetResults?: SideBetResult[] } }
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
      return {
        ...state,
        currentBet: action.payload.mainBet,
        perfectPairsBet: action.payload.perfectPairsBet ?? 0,
        twentyOnePlusThreeBet: action.payload.twentyOnePlusThreeBet ?? 0,
        status: 'deal',
      };

    case 'DEAL':
      return {
        ...state,
        status: 'playerTurn',
        playerHand: action.payload.playerHand,
        dealerHand: action.payload.dealerHand,
      };

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
      // En cas de split, passer à la main suivante ou au dealer
      if (state.playerHands && state.activeHandIndex < state.playerHands.length - 1) {
        return { ...state, activeHandIndex: state.activeHandIndex + 1 };
      }
      return { ...state, status: 'settle', outcome: 'bust', payout: 0 };

    case 'SPLIT':
      return {
        ...state,
        playerHands: action.payload.hands,
        activeHandIndex: 0,
      };

    case 'NEXT_HAND':
      if (state.playerHands && state.activeHandIndex < state.playerHands.length - 1) {
        return { ...state, activeHandIndex: state.activeHandIndex + 1 };
      }
      return { ...state, status: 'dealerTurn' };

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
        playerHands: null,
        activeHandIndex: 0,
        dealerHand: null,
        currentBet: 0,
        insuranceBet: 0,
        perfectPairsBet: 0,
        twentyOnePlusThreeBet: 0,
        sideBetResults: null,
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
// PERSISTANCE DE SESSION (anti-exploit refresh)
// ============================================

const BJ_SESSION_KEY = 'ZVC_BJ_SESSION';

interface BJSession {
  state: BlackjackState;
  shoe: Shoe;
}

function loadBJSession(): BJSession | null {
  try {
    const saved = localStorage.getItem(BJ_SESSION_KEY);
    return saved ? (JSON.parse(saved) as BJSession) : null;
  } catch {
    return null;
  }
}

function saveBJSession(state: BlackjackState, shoe: Shoe): void {
  try {
    // On ne sauvegarde pas les états terminaux ou de transition
    if (state.status === 'idle' || state.status === 'settle') {
      localStorage.removeItem(BJ_SESSION_KEY);
    } else {
      localStorage.setItem(BJ_SESSION_KEY, JSON.stringify({ state, shoe }));
    }
  } catch {}
}

function clearBJSession(): void {
  try {
    localStorage.removeItem(BJ_SESSION_KEY);
  } catch {}
}

/** Restaure l'état du jeu depuis localStorage si une partie est en cours */
function getInitialState(): BlackjackState {
  const session = loadBJSession();
  // On ne restaure que le tour du joueur (état interactif persistable)
  if (session?.state.status === 'playerTurn') {
    return session.state;
  }
  return INITIAL_STATE_DEFAULT;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

const INITIAL_STATE_DEFAULT: BlackjackState = {
  status: 'idle',
  playerHand: null,
  playerHands: null,
  activeHandIndex: 0,
  dealerHand: null,
  currentBet: 0,
  insuranceBet: 0,
  perfectPairsBet: 0,
  twentyOnePlusThreeBet: 0,
  sideBetResults: null,
  outcome: null,
  payout: 0,
  error: null,
};

export function useBlackjackEngine() {
  // Initialisation : restaure la session sauvegardée si elle existe
  const [state, dispatch] = useReducer(blackjackReducer, undefined, getInitialState);

  // Stores externes
  const playerStore = usePlayerStore();

  // Gestion du sabot
  const { draw, resetShoe, needsShuffle, getShoe, restoreShoe } = useBlackjackDeck();

  // Ref pour éviter les appels multiples
  const isProcessing = useRef(false);

  // Restaure le sabot sauvegardé au premier montage (si session playerTurn restaurée)
  const didRestoreShoe = useRef(false);
  useEffect(() => {
    if (didRestoreShoe.current) return;
    didRestoreShoe.current = true;
    if (state.status === 'playerTurn') {
      const session = loadBJSession();
      if (session?.shoe) {
        restoreShoe(session.shoe);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistance automatique à chaque changement d'état
  useEffect(() => {
    saveBJSession(state, getShoe());
  }, [state, getShoe]);

  /**
   * Démarre la phase de mise
   */
  const startBetting = useCallback(() => {
    dispatch({ type: 'START_BET' });
  }, []);

  /**
   * Place la mise initiale et les side bets optionnels
   */
  const placeBet = useCallback((mainBet: number, perfectPairsBet: number = 0, twentyOnePlusThreeBet: number = 0) => {
    const totalBet = mainBet + perfectPairsBet + twentyOnePlusThreeBet;

    // Vérifier le solde
    const canBet = playerStore.placeBet(totalBet);
    if (!canBet) {
      dispatch({ type: 'SET_ERROR', payload: 'Solde insuffisant' });
      return false;
    }

    // Immédiatement persister le solde déduit en DB
    // → empêche le joueur de récupérer sa mise en rafraîchissant la page
    const newBalance = useAuthStore.getState().currentUser?.balance ?? 0;
    void useAuthStore.getState().setBalance(newBalance);

    dispatch({
      type: 'PLACE_BET',
      payload: { mainBet, perfectPairsBet, twentyOnePlusThreeBet },
    });
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

    // Évaluer les side bets si des mises sont placées
    let sideBetResults: SideBetResult[] | null = null;
    let sideBetPayout = 0;

    if (state.perfectPairsBet > 0 || state.twentyOnePlusThreeBet > 0) {
      const dealerUpCard = dealerCards.find((c) => !c.isFaceDown);
      if (playerCards[0] && playerCards[1] && dealerUpCard) {
        sideBetResults = evaluateSideBets(
          playerCards[0],
          playerCards[1],
          dealerUpCard,
          state.perfectPairsBet,
          state.twentyOnePlusThreeBet
        );

        // Créditer immédiatement les side bets gagnants
        for (const result of sideBetResults) {
          if (result.won && result.payout > 0) {
            sideBetPayout += result.payout;
          }
        }

        if (sideBetPayout > 0) {
          playerStore.receiveWin(sideBetPayout);
        }
      }
    }

    // Mettre à jour l'état avec les mains distribuées
    dispatch({ type: 'DEAL', payload: { playerHand, dealerHand } });

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
    if (state.status !== 'playerTurn') return;

    // Gestion du split: on joue sur la main active
    if (state.playerHands && state.playerHands[state.activeHandIndex]) {
      const currentHand = state.playerHands[state.activeHandIndex];
      if (!currentHand) return;

      const card = draw();
      if (!card) return;

      const newHand = createHand([...currentHand.cards, card]);
      const newHands = [...state.playerHands];
      newHands[state.activeHandIndex] = newHand;

      if (newHand.isBust) {
        // Main suivante ou tour du dealer
        if (state.activeHandIndex < state.playerHands.length - 1) {
          dispatch({ type: 'SPLIT', payload: { hands: newHands } });
          dispatch({ type: 'NEXT_HAND' });
        } else {
          dispatch({ type: 'SPLIT', payload: { hands: newHands } });
          settleRound('bust', 0, newHand, state.dealerHand);
        }
      } else {
        dispatch({ type: 'SPLIT', payload: { hands: newHands } });
      }
      return;
    }

    // Main unique (pas de split)
    if (!state.playerHand) return;

    const card = draw();
    if (!card) return;

    const newHand = createHand([...state.playerHand.cards, card]);

    if (newHand.isBust) {
      dispatch({ type: 'PLAYER_BUST' });
      settleRound('bust', 0, newHand, state.dealerHand);
    } else {
      dispatch({ type: 'PLAYER_HIT', payload: newHand });
    }
  }, [state.status, state.playerHand, state.playerHands, state.activeHandIndex, state.dealerHand]);

  /**
   * Le joueur s'arrête (stand)
   */
  const stand = useCallback(() => {
    if (state.status !== 'playerTurn') return;

    // En cas de split, passer à la main suivante ou au dealer
    if (state.playerHands && state.activeHandIndex < state.playerHands.length - 1) {
      dispatch({ type: 'NEXT_HAND' });
    } else {
      // Fin des mains joueur, tour du dealer
      dispatch({ type: 'PLAYER_STAND' });
    }
  }, [state.status, state.playerHands, state.activeHandIndex]);

  /**
   * Le joueur double (double down) - une seule carte puis tour du dealer
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

    // Après un double, le joueur ne peut plus tirer - une carte automatique
    // Puis c'est le tour du dealer (sauf si bust)
    if (newHand.isBust) {
      settleRound('bust', 0, newHand, state.dealerHand);
    } else {
      // Passer directement au tour du dealer
      dispatch({ type: 'PLAYER_STAND' });
    }
  }, [state.status, state.playerHand, state.currentBet, playerStore]);

  /**
   * Le joueur sépare sa main (split) - crée 2 mains distinctes
   * Règles:
   * - Possible uniquement avec 2 cartes de même rang (paire)
   * - Mise supplémentaire égale à la mise initiale
   * - Chaque main reçoit une carte supplémentaire
   * - Le joueur joue chaque main séparément
   */
  const split = useCallback(() => {
    if (state.status !== 'playerTurn' || !state.playerHand) return;

    // Vérifier que c'est une paire (2 cartes de même rang)
    const cards = state.playerHand.cards;
    if (cards.length !== 2) return;

    const card1 = cards[0];
    const card2 = cards[1];
    if (!card1 || !card2) return;
    if (card1.rank !== card2.rank) return;

    // Vérifier le solde pour la mise supplémentaire
    const additionalBet = state.currentBet;
    const canSplit = playerStore.placeBet(additionalBet);
    if (!canSplit) {
      dispatch({ type: 'SET_ERROR', payload: 'Solde insuffisant pour splitter' });
      return;
    }

    // Créer 2 nouvelles mains avec une carte chacune
    const hand1 = createHand([card1]);
    const hand2 = createHand([card2]);

    // Tirer une carte supplémentaire pour chaque main
    const cardForHand1 = draw();
    const cardForHand2 = draw();

    if (cardForHand1) {
      hand1.cards.push(cardForHand1);
      Object.assign(hand1, calculateHand(hand1.cards));
    }

    if (cardForHand2) {
      hand2.cards.push(cardForHand2);
      Object.assign(hand2, calculateHand(hand2.cards));
    }

    // Mettre à jour l'état avec les 2 mains
    dispatch({ type: 'SPLIT', payload: { hands: [hand1, hand2] } });
  }, [state.status, state.playerHand, state.currentBet, playerStore]);

  /**
   * Tour automatique du dealer - gère aussi les mains splitées
   */
  const playDealerTurn = useCallback(() => {
    if (state.status !== 'dealerTurn' && state.status !== 'settle') return;
    if (!state.dealerHand) return;
    if (isProcessing.current) return;

    isProcessing.current = true;

    // Révéler la carte cachée
    const dealerCards = state.dealerHand.cards.map((c) => ({ ...c, isFaceDown: false }));

    // Simuler le tour du dealer selon la stratégie H17
    const finalDealerCards = simulateDealerTurn(dealerCards, () => draw()!);
    const finalDealerHand = createHand(finalDealerCards);

    dispatch({ type: 'DEALER_TURN', payload: finalDealerHand });

    // Gérer les mains splitées
    if (state.playerHands && state.playerHands.length > 0) {
      let totalPayout = 0;
      const results: Array<{ hand: Hand; outcome: BlackjackOutcome; payout: number }> = [];

      for (let i = 0; i < state.playerHands.length; i++) {
        const playerHand = state.playerHands[i];
        if (!playerHand) continue;

        // Si la main est bust, elle est déjà perdue
        if (playerHand.isBust) {
          results.push({ hand: playerHand, outcome: 'lose', payout: 0 });
          continue;
        }

        const playerValue = calculateHand(playerHand.cards);

        // Dealer bust → toutes les mains non-bust gagnent
        if (finalDealerHand.isBust) {
          const payout = calculatePayout('dealerBust', state.currentBet);
          totalPayout += payout;
          results.push({ hand: playerHand, outcome: 'dealerBust', payout });
        } else {
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
          totalPayout += payout;
          results.push({ hand: playerHand, outcome, payout });
        }
      }

      // Créditer le total des gains
      if (totalPayout > 0) {
        playerStore.receiveWin(totalPayout);
      }

      // Enregistrer chaque main splitée dans la DB via recordRound
      const currentBalance = useAuthStore.getState().currentUser?.balance ?? 0;
      for (const result of results) {
        const round: import('@/types').GameResult = {
          id: `bj_${uuid()}`,
          gameId: 'blackjack' as const,
          timestamp: Date.now(),
          wagered: state.currentBet,
          won: result.payout,
          netProfit: result.payout - state.currentBet,
          isWin: result.payout > state.currentBet,
          details: {
            playerHand: result.hand.cards.map((c) => `${c.rank}${c.suit[0]}`),
            dealerHand: finalDealerHand.cards.map((c) => `${c.rank}${c.suit[0]}`),
            playerTotal: result.hand.total,
            dealerTotal: finalDealerHand.total,
            outcome: result.outcome,
            isBlackjack: result.hand.isBlackjack,
            isDouble: false,
            isSplit: true,
          },
        };
        useAuthStore.getState().recordRound({
          wagered: state.currentBet,
          won: result.payout,
          netProfit: result.payout - state.currentBet,
          isWin: result.payout > state.currentBet,
          newBalance: currentBalance,
          round,
        });
      }

      isProcessing.current = false;
      return;
    }

    // Main unique (pas de split)
    if (finalDealerHand.isBust) {
      const payout = calculatePayout('dealerBust', state.currentBet);
      settleRound('dealerBust', payout, state.playerHand, finalDealerHand);
    } else {
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
  }, [state.status, state.dealerHand, state.playerHand, state.playerHands, state.currentBet, state.activeHandIndex]);

  /**
   * Enregistre le round terminé et crédite le joueur
   */
  const settleRound = useCallback(
    (
      outcome: BlackjackOutcome,
      payout: number,
      playerHand: Hand | null,
      dealerHand: Hand | null,
      sideBetResults?: SideBetResult[]
    ) => {
      dispatch({ type: 'SETTLE', payload: { outcome, payout, sideBetResults } });

      // Créditer le joueur si gain
      if (payout > 0) {
        playerStore.receiveWin(payout);
      }

      // ELO + stats + historique utilisateur (DB + sync authStore)
      if (!playerHand || !dealerHand) return;

      const totalWagered = state.currentBet + state.perfectPairsBet + state.twentyOnePlusThreeBet;
      const totalWon = payout + (sideBetResults?.reduce((sum, r) => sum + r.payout, 0) ?? 0);

      const round: import('@/types').GameResult = {
        id: `bj_${Date.now()}`,
        gameId: 'blackjack' as const,
        timestamp: Date.now(),
        wagered: totalWagered,
        won: totalWon,
        netProfit: totalWon - totalWagered,
        isWin: totalWon > totalWagered,
        details: {
          playerHand: playerHand.cards.map((c) => `${c.rank}${c.suit[0]}`),
          dealerHand: dealerHand.cards.map((c) => `${c.rank}${c.suit[0]}`),
          playerTotal: playerHand.total,
          dealerTotal: dealerHand.total,
          outcome,
          isBlackjack: playerHand.isBlackjack,
          isDouble: false,
          isSplit: state.playerHands !== null,
        },
      };

      const currentBalance = useAuthStore.getState().currentUser?.balance ?? 0;
      useAuthStore.getState().recordRound({
        wagered: totalWagered,
        won: totalWon,
        netProfit: totalWon - totalWagered,
        isWin: totalWon > totalWagered,
        isBlackjack: playerHand.isBlackjack,
        newBalance: currentBalance,
        round,
      });
    },
    [state.currentBet, state.perfectPairsBet, state.twentyOnePlusThreeBet, state.playerHands, playerStore]
  );

  /**
   * Réinitialise pour une nouvelle partie
   */
  const reset = useCallback(() => {
    clearBJSession();
    dispatch({ type: 'RESET' });
  }, []);

  // ============================================
  // RETOUR DU HOOK
  // ============================================

  return {
    // État
    status: state.status,
    playerHand: state.playerHand,
    playerHands: state.playerHands,
    activeHandIndex: state.activeHandIndex,
    dealerHand: state.dealerHand,
    currentBet: state.currentBet,
    perfectPairsBet: state.perfectPairsBet,
    twentyOnePlusThreeBet: state.twentyOnePlusThreeBet,
    sideBetResults: state.sideBetResults,
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
    split,
    playDealerTurn,
    reset,
  };
}
