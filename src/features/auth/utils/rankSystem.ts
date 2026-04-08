/**
 * Système de ranks inspiré de Valorant.
 * Chaque rank a 3 paliers (sauf Radiant), basé sur l'ELO.
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
  /** ELO mini de ce palier (inclus) */
  minElo: number;
  /** ELO max de ce palier (exclus) — null si Radiant */
  maxElo: number | null;
}

const RANKS: Rank[] = [
  { tier: 'Iron',      division: 1, label: 'Iron 1',      color: '#5C5C5C', glow: '0 0 12px #5C5C5C66', icon: '⛓️', minElo: 0,    maxElo: 100 },
  { tier: 'Iron',      division: 2, label: 'Iron 2',      color: '#5C5C5C', glow: '0 0 12px #5C5C5C66', icon: '⛓️', minElo: 100,  maxElo: 200 },
  { tier: 'Iron',      division: 3, label: 'Iron 3',      color: '#5C5C5C', glow: '0 0 12px #5C5C5C66', icon: '⛓️', minElo: 200,  maxElo: 300 },
  { tier: 'Bronze',    division: 1, label: 'Bronze 1',    color: '#A06A3F', glow: '0 0 14px #A06A3F88', icon: '🥉', minElo: 300,  maxElo: 400 },
  { tier: 'Bronze',    division: 2, label: 'Bronze 2',    color: '#A06A3F', glow: '0 0 14px #A06A3F88', icon: '🥉', minElo: 400,  maxElo: 500 },
  { tier: 'Bronze',    division: 3, label: 'Bronze 3',    color: '#A06A3F', glow: '0 0 14px #A06A3F88', icon: '🥉', minElo: 500,  maxElo: 600 },
  { tier: 'Silver',    division: 1, label: 'Silver 1',    color: '#C0C0C0', glow: '0 0 14px #C0C0C088', icon: '🥈', minElo: 600,  maxElo: 700 },
  { tier: 'Silver',    division: 2, label: 'Silver 2',    color: '#C0C0C0', glow: '0 0 14px #C0C0C088', icon: '🥈', minElo: 700,  maxElo: 800 },
  { tier: 'Silver',    division: 3, label: 'Silver 3',    color: '#C0C0C0', glow: '0 0 14px #C0C0C088', icon: '🥈', minElo: 800,  maxElo: 900 },
  { tier: 'Gold',      division: 1, label: 'Gold 1',      color: '#F5B814', glow: '0 0 16px #F5B81499', icon: '🥇', minElo: 900,  maxElo: 1000 },
  { tier: 'Gold',      division: 2, label: 'Gold 2',      color: '#F5B814', glow: '0 0 16px #F5B81499', icon: '🥇', minElo: 1000, maxElo: 1100 },
  { tier: 'Gold',      division: 3, label: 'Gold 3',      color: '#F5B814', glow: '0 0 16px #F5B81499', icon: '🥇', minElo: 1100, maxElo: 1200 },
  { tier: 'Platinum',  division: 1, label: 'Platinum 1',  color: '#3FBFBF', glow: '0 0 16px #3FBFBF99', icon: '💎', minElo: 1200, maxElo: 1300 },
  { tier: 'Platinum',  division: 2, label: 'Platinum 2',  color: '#3FBFBF', glow: '0 0 16px #3FBFBF99', icon: '💎', minElo: 1300, maxElo: 1400 },
  { tier: 'Platinum',  division: 3, label: 'Platinum 3',  color: '#3FBFBF', glow: '0 0 16px #3FBFBF99', icon: '💎', minElo: 1400, maxElo: 1500 },
  { tier: 'Diamond',   division: 1, label: 'Diamond 1',   color: '#B36AE6', glow: '0 0 18px #B36AE6AA', icon: '💠', minElo: 1500, maxElo: 1600 },
  { tier: 'Diamond',   division: 2, label: 'Diamond 2',   color: '#B36AE6', glow: '0 0 18px #B36AE6AA', icon: '💠', minElo: 1600, maxElo: 1700 },
  { tier: 'Diamond',   division: 3, label: 'Diamond 3',   color: '#B36AE6', glow: '0 0 18px #B36AE6AA', icon: '💠', minElo: 1700, maxElo: 1800 },
  { tier: 'Ascendant', division: 1, label: 'Ascendant 1', color: '#3FD17C', glow: '0 0 18px #3FD17CAA', icon: '🌟', minElo: 1800, maxElo: 1900 },
  { tier: 'Ascendant', division: 2, label: 'Ascendant 2', color: '#3FD17C', glow: '0 0 18px #3FD17CAA', icon: '🌟', minElo: 1900, maxElo: 2000 },
  { tier: 'Ascendant', division: 3, label: 'Ascendant 3', color: '#3FD17C', glow: '0 0 18px #3FD17CAA', icon: '🌟', minElo: 2000, maxElo: 2100 },
  { tier: 'Immortal',  division: 1, label: 'Immortal 1',  color: '#D4286B', glow: '0 0 20px #D4286BBB', icon: '👑', minElo: 2100, maxElo: 2200 },
  { tier: 'Immortal',  division: 2, label: 'Immortal 2',  color: '#D4286B', glow: '0 0 20px #D4286BBB', icon: '👑', minElo: 2200, maxElo: 2300 },
  { tier: 'Immortal',  division: 3, label: 'Immortal 3',  color: '#D4286B', glow: '0 0 20px #D4286BBB', icon: '👑', minElo: 2300, maxElo: 2400 },
  { tier: 'Radiant',   division: null, label: 'Radiant',  color: '#FFF4B0', glow: '0 0 24px #FFF4B0DD', icon: '☀️', minElo: 2400, maxElo: null },
];

const FALLBACK_RANK: Rank = RANKS[0]!;

export function getRankFromElo(elo: number): Rank {
  for (const r of RANKS) {
    if (r.maxElo === null) {
      if (elo >= r.minElo) return r;
    } else if (elo >= r.minElo && elo < r.maxElo) {
      return r;
    }
  }
  return FALLBACK_RANK;
}

/**
 * Progression dans le palier courant en pourcentage [0..100].
 */
export function getRankProgress(elo: number): number {
  const rank = getRankFromElo(elo);
  if (rank.maxElo === null) return 100;
  const span = rank.maxElo - rank.minElo;
  return Math.min(100, Math.max(0, ((elo - rank.minElo) / span) * 100));
}

export function getAllRanks(): readonly Rank[] {
  return RANKS;
}
