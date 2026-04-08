/**
 * Barrel export — tous les types du projet
 *
 * Usage: import type { Player, GameType, RouletteBet } from '@/types'
 */

// Player types
export type {
  Currency,
  BetHistory,
  Player,
  PlayerStats,
  PlayerState,
} from './player.types';

// Game types
export type {
  GameType,
  GameStatus,
  GameResult,
  RouletteRoundDetails,
  BlackjackRoundDetails,
  DiceRoundDetails,
  RouletteBetSummary,
  RoundStatus,
} from './game.types';

// Dice types
export type {
  DiceFace,
  DiceBet,
  DiceResult,
} from './dice.types';

// Roulette types
export type {
  RouletteColor,
  BetType,
  RouletteNumber,
  RouletteBet,
  SpinResult,
  RouletteLimits,
  RouletteSessionStats,
} from './roulette.types';

// Blackjack types
export type {
  Rank,
  Suit,
  Card,
  Hand,
  BlackjackAction,
  BlackjackOutcome,
  BlackjackResult,
  Shoe,
  BlackjackConfig,
} from './blackjack.types';

// Store types
export type {
  PlayerStore,
  StatsState,
  StatsSelectors,
  StatsStore,
  HistoryState,
  HistoryActions,
  HistorySelectors,
  HistoryStore,
  UIState,
  UIActions,
  UIStore,
  Toast,
} from './store.types';

// UI types
export type {
  Theme,
  ToastLevel,
  ModalType,
  AnimationVariant,
  AnimationConfig,
  LoadingState,
  Size,
  ButtonVariant,
  CommonUIProps,
} from './ui.types';
