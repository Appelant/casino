/**
 * Barrel export — tous les stores du projet
 */

export { usePlayerStore } from './player/playerStore';
export { selectCanBet, selectNetProfit, selectBalance, selectUsername, selectAvatar } from './player/playerStore.selectors';

export { useStatsStore } from './stats/statsStore';
export { selectRTP, selectWinRate, selectSessionDuration, selectStreakStatus, selectAverageBet, formatSessionDuration } from './stats/statsStore.selectors';

export { useUserStatsStore, calculateUserStats } from './stats/userStatsStore';
export type { UserStats } from './stats/userStatsStore';

export { useHistoryStore } from './history/historyStore';
export { selectLastRound, selectRoundsByGame, selectRecentTrend, selectLast10Rounds, selectTotalRounds, selectRecentRTP } from './history/historyStore.selectors';

export { useUIStore } from './ui/uiStore';
