/**
 * Géométrie de la roue de roulette pour le rendu SVG
 */

import { WHEEL_ORDER } from './rouletteNumbers';

/**
 * Nombre total de cases sur la roue européenne
 */
export const POCKET_COUNT = 37;

/**
 * Angle entre chaque case (en degrés)
 */
export const POCKET_ANGLE = 360 / POCKET_COUNT;

/**
 * Rayon extérieur de la roue (en unités SVG)
 */
export const OUTER_RADIUS = 200;

/**
 * Rayon intérieur de la zone des numéros
 */
export const INNER_RADIUS = 140;

/**
 * Rayon du centre (zone décorative)
 */
export const CENTER_RADIUS = 60;

/**
 * Calcule les coordonnées polaires vers cartésiennes
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Crée un arc SVG pour une case de la roue
 */
export function createArc(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const startOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const endOuter = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const startInner = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const endInner = polarToCartesian(centerX, centerY, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    'M', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 0, startInner.x, startInner.y,
    'Z',
  ].join(' ');
}

/**
 * Retourne l'angle de départ pour une position donnée sur la roue
 */
export function getAngleForPosition(position: number): number {
  return position * POCKET_ANGLE;
}

/**
 * Retourne l'angle pour un numéro spécifique
 */
export function getAngleForNumber(number: number): number {
  const position = WHEEL_ORDER.indexOf(number as never);
  return getAngleForPosition(position);
}

/**
 * Calcule la rotation nécessaire pour amener un numéro en position de gagnant (en haut)
 */
export function getRotationForWinningNumber(number: number): number {
  const angle = getAngleForNumber(number);
  // On veut que le numéro soit en haut (0 degrés), donc on rotate de -angle
  return -angle;
}

/**
 * Calcule l'angle du centre pour afficher un numéro
 */
export function getCenterTextAngle(angle: number): number {
  return angle + POCKET_ANGLE / 2;
}
