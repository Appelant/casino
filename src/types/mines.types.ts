/**
 * Types pour le jeu Mines
 *
 * Architecture anti-triche :
 * - Les positions des mines ne sont JAMAIS envoyées au client tant que la partie est active
 * - Toute la logique de validation vit côté serveur
 * - Le client ne reçoit que l'état public (MinesRoundPublic)
 */

// ── État d'une case ───────────────────────────────────────────────────────────

export type TileState =
  | 'hidden'    // Pas encore révélée
  | 'safe'      // Révélée — pas de mine
  | 'mine'      // Révélée — mine (fin de partie)
  | 'mine_safe' // Mine révélée en fin de partie (cases non cliquées)

// ── FSM d'une partie ─────────────────────────────────────────────────────────

export type MinesStatus =
  | 'active'      // Partie en cours — le joueur révèle des cases
  | 'cashed_out'  // Le joueur a encaissé ses gains
  | 'exploded'    // Le joueur a touché une mine

// ── Tuile individuelle (vue client) ──────────────────────────────────────────

export interface MinesTile {
  index: number;    // Position 0-24 dans la grille 5×5
  state: TileState;
}

// ── État public d'une partie (envoyé au client) ───────────────────────────────
// NB : minePositions n'est inclus QUE quand status !== 'active'

export interface MinesRoundPublic {
  id:                string;
  status:            MinesStatus;
  mineCount:         number;           // 1–24
  wager:             number;           // centimes ZVC
  tiles:             MinesTile[];      // 25 tuiles — seules les révélées ont state != 'hidden'
  revealedSafe:      number;           // nombre de cases sûres révélées
  currentMultiplier: number;           // multiplicateur actuel
  nextMultiplier:    number;           // multiplicateur si prochaine case est sûre
  potentialPayout:   number;           // wager × currentMultiplier (centimes)
  // Présents uniquement en fin de partie :
  minePositions?:    number[];
  wonAmount?:        number;           // centimes reçus (0 si explosion)
  netProfit?:        number;           // wonAmount - wager
}

// ── Détails enregistrés dans GameResult ──────────────────────────────────────

export interface MinesRoundDetails {
  mineCount:     number;
  revealedCount: number;
  minePositions: number[];   // révélé à la fin uniquement
  multiplier:    number;
  outcome:       'cashout' | 'exploded';
}

// ── Paramètres de création d'une partie ──────────────────────────────────────

export interface MinesStartParams {
  userId:    string;
  mineCount: number;   // 1–24
  wager:     number;   // centimes ZVC
}

// ── Paramètres pour révéler une case ─────────────────────────────────────────

export interface MinesRevealParams {
  roundId:   string;
  userId:    string;
  tileIndex: number;   // 0–24
}

// ── Paramètres pour encaisser ─────────────────────────────────────────────────

export interface MinesCashoutParams {
  roundId: string;
  userId:  string;
}
