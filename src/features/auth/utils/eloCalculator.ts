/**
 * Calcul du delta ELO après un round de jeu.
 *
 * Principe :
 * - La progression dépend du résultat (win/lose/push/blackjack) ET de la mise relative.
 * - On ne descend jamais en-dessous de 0.
 * - Cap par round pour éviter les pics.
 */

const ELO_MIN = 0;
const MAX_GAIN_PER_ROUND = 80;
const MAX_LOSS_PER_ROUND = 60;

export interface EloDeltaInput {
  /** Mise totale du round, en centimes */
  wagered: number;
  /** Gain net du round, en centimes (peut être négatif) */
  netProfit: number;
  /** Victoire ? */
  isWin: boolean;
  /** Bonus blackjack naturel */
  isBlackjack?: boolean;
}

/**
 * Retourne le delta ELO à appliquer (peut être négatif).
 */
export function computeEloDelta({
  wagered,
  netProfit,
  isWin,
  isBlackjack = false,
}: EloDeltaInput): number {
  if (wagered <= 0) return 0;

  // Ratio gain/mise — plus la prise de risque est récompensée, plus l'ELO grimpe.
  const ratio = netProfit / wagered;

  if (isWin) {
    // Base : 15 points + bonus proportionnel au ratio
    let delta = 15 + Math.round(ratio * 20);
    if (isBlackjack) delta += 25;
    return Math.min(MAX_GAIN_PER_ROUND, delta);
  }

  // Défaite : pénalité douce, scaled sur la perte
  const loss = Math.abs(ratio); // entre 0 et 1
  const delta = -Math.round(10 + loss * 20);
  return Math.max(-MAX_LOSS_PER_ROUND, delta);
}

/**
 * Applique un delta à un ELO en clampant à 0.
 */
export function applyEloDelta(currentElo: number, delta: number): number {
  return Math.max(ELO_MIN, currentElo + delta);
}
