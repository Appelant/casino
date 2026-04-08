/**
 * Système de ranks basé sur le total ZVC$ gagnés (totalWon).
 * Chaque rank a 3 paliers (sauf Radiant).
 */

export type RankTier =
  | 'Iron'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Ascendant'
  | 'Immortal'
  | 'Radiant';

export interface Rank {
  tier: RankTier;
  /** 1, 2 ou 3 — null pour Radiant */
  division: 1 | 2 | 3 | null;
  /** Nom complet ex: "Gold 2" */
  label: string;
  /** Couleur hex pour l'UI */
  color: string;
  /** Glow CSS box-shadow */
  glow: string;
  /** Emoji représentatif */
  icon: string;
  /** ZVC$ gagnés minimum pour ce palier (inclus) */
  minAmount: number;
  /** ZVC$ gagnés maximum pour ce palier (exclus) — null si Radiant */
  maxAmount: number | null;
}

// Tous les seuils sont en centimes (×100 par rapport aux ZVC$ affichés)
// Bronze 1 = 20 000 ZVC$ = 2 000 000 centimes
const RANKS: Rank[] = [
  { tier: 'Iron',      division: 1, label: 'Iron 1',      color: '#5C5C5C', glow: '0 0 12px #5C5C5C66', icon: '⛓️', minAmount: 0,             maxAmount: 500_000 },
  { tier: 'Iron',      division: 2, label: 'Iron 2',      color: '#5C5C5C', glow: '0 0 12px #5C5C5C66', icon: '⛓️', minAmount: 500_000,        maxAmount: 1_200_000 },
  { tier: 'Iron',      division: 3, label: 'Iron 3',      color: '#5C5C5C', glow: '0 0 12px #5C5C5C66', icon: '⛓️', minAmount: 1_200_000,      maxAmount: 2_000_000 },
  { tier: 'Bronze',    division: 1, label: 'Bronze 1',    color: '#A06A3F', glow: '0 0 14px #A06A3F88', icon: '🥉', minAmount: 2_000_000,      maxAmount: 3_500_000 },
  { tier: 'Bronze',    division: 2, label: 'Bronze 2',    color: '#A06A3F', glow: '0 0 14px #A06A3F88', icon: '🥉', minAmount: 3_500_000,      maxAmount: 5_500_000 },
  { tier: 'Bronze',    division: 3, label: 'Bronze 3',    color: '#A06A3F', glow: '0 0 14px #A06A3F88', icon: '🥉', minAmount: 5_500_000,      maxAmount: 8_000_000 },
  { tier: 'Silver',    division: 1, label: 'Silver 1',    color: '#C0C0C0', glow: '0 0 14px #C0C0C088', icon: '🥈', minAmount: 8_000_000,      maxAmount: 12_000_000 },
  { tier: 'Silver',    division: 2, label: 'Silver 2',    color: '#C0C0C0', glow: '0 0 14px #C0C0C088', icon: '🥈', minAmount: 12_000_000,     maxAmount: 17_000_000 },
  { tier: 'Silver',    division: 3, label: 'Silver 3',    color: '#C0C0C0', glow: '0 0 14px #C0C0C088', icon: '🥈', minAmount: 17_000_000,     maxAmount: 25_000_000 },
  { tier: 'Gold',      division: 1, label: 'Gold 1',      color: '#F5B814', glow: '0 0 16px #F5B81499', icon: '🥇', minAmount: 25_000_000,     maxAmount: 37_500_000 },
  { tier: 'Gold',      division: 2, label: 'Gold 2',      color: '#F5B814', glow: '0 0 16px #F5B81499', icon: '🥇', minAmount: 37_500_000,     maxAmount: 50_000_000 },
  { tier: 'Gold',      division: 3, label: 'Gold 3',      color: '#F5B814', glow: '0 0 16px #F5B81499', icon: '🥇', minAmount: 50_000_000,     maxAmount: 75_000_000 },
  { tier: 'Platinum',  division: 1, label: 'Platinum 1',  color: '#3FBFBF', glow: '0 0 16px #3FBFBF99', icon: '💎', minAmount: 75_000_000,     maxAmount: 100_000_000 },
  { tier: 'Platinum',  division: 2, label: 'Platinum 2',  color: '#3FBFBF', glow: '0 0 16px #3FBFBF99', icon: '💎', minAmount: 100_000_000,    maxAmount: 150_000_000 },
  { tier: 'Platinum',  division: 3, label: 'Platinum 3',  color: '#3FBFBF', glow: '0 0 16px #3FBFBF99', icon: '💎', minAmount: 150_000_000,    maxAmount: 200_000_000 },
  { tier: 'Diamond',   division: 1, label: 'Diamond 1',   color: '#B36AE6', glow: '0 0 18px #B36AE6AA', icon: '💠', minAmount: 200_000_000,    maxAmount: 300_000_000 },
  { tier: 'Diamond',   division: 2, label: 'Diamond 2',   color: '#B36AE6', glow: '0 0 18px #B36AE6AA', icon: '💠', minAmount: 300_000_000,    maxAmount: 450_000_000 },
  { tier: 'Diamond',   division: 3, label: 'Diamond 3',   color: '#B36AE6', glow: '0 0 18px #B36AE6AA', icon: '💠', minAmount: 450_000_000,    maxAmount: 650_000_000 },
  { tier: 'Ascendant', division: 1, label: 'Ascendant 1', color: '#3FD17C', glow: '0 0 18px #3FD17CAA', icon: '🌟', minAmount: 650_000_000,    maxAmount: 900_000_000 },
  { tier: 'Ascendant', division: 2, label: 'Ascendant 2', color: '#3FD17C', glow: '0 0 18px #3FD17CAA', icon: '🌟', minAmount: 900_000_000,    maxAmount: 1_200_000_000 },
  { tier: 'Ascendant', division: 3, label: 'Ascendant 3', color: '#3FD17C', glow: '0 0 18px #3FD17CAA', icon: '🌟', minAmount: 1_200_000_000,  maxAmount: 1_700_000_000 },
  { tier: 'Immortal',  division: 1, label: 'Immortal 1',  color: '#D4286B', glow: '0 0 20px #D4286BBB', icon: '👑', minAmount: 1_700_000_000,  maxAmount: 2_500_000_000 },
  { tier: 'Immortal',  division: 2, label: 'Immortal 2',  color: '#D4286B', glow: '0 0 20px #D4286BBB', icon: '👑', minAmount: 2_500_000_000,  maxAmount: 4_000_000_000 },
  { tier: 'Immortal',  division: 3, label: 'Immortal 3',  color: '#D4286B', glow: '0 0 20px #D4286BBB', icon: '👑', minAmount: 4_000_000_000,  maxAmount: 6_000_000_000 },
  { tier: 'Radiant',   division: null, label: 'Radiant',  color: '#FFF4B0', glow: '0 0 24px #FFF4B0DD', icon: '☀️', minAmount: 6_000_000_000, maxAmount: null },
];

const FALLBACK_RANK: Rank = RANKS[0]!;

export function getRankFromAmount(totalWon: number): Rank {
  for (const r of RANKS) {
    if (r.maxAmount === null) {
      if (totalWon >= r.minAmount) return r;
    } else if (totalWon >= r.minAmount && totalWon < r.maxAmount) {
      return r;
    }
  }
  return FALLBACK_RANK;
}

/** Progression dans le palier courant en pourcentage [0..100]. */
export function getRankProgress(totalWon: number): number {
  const rank = getRankFromAmount(totalWon);
  if (rank.maxAmount === null) return 100;
  const span = rank.maxAmount - rank.minAmount;
  return Math.min(100, Math.max(0, ((totalWon - rank.minAmount) / span) * 100));
}

export function getAllRanks(): readonly Rank[] {
  return RANKS;
}

/** Alias pour la compatibilité — utilise totalWon comme métrique. */
export const getRankFromElo = getRankFromAmount;
