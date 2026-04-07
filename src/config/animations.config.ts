/**
 * Configuration centralisée des animations Framer Motion
 *
 * TOUS les variants d'animation doivent être définis ici.
 * Jamais de variants inline dans les composants.
 */

import type { Variants } from 'framer-motion';

// ============================================
// TRANSITIONS DE BASE
// ============================================

export const transitionFast = { duration: 0.15 };
export const transitionBase = { duration: 0.2 };
export const transitionSlow = { duration: 0.3 };
export const transitionSpring = { type: 'spring' as const, stiffness: 300, damping: 20 };

// ============================================
// FADE
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitionBase },
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0, transition: transitionBase },
};

// ============================================
// SLIDE
// ============================================

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: transitionSlow },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: transitionSlow },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: transitionSlow },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: transitionSlow },
};

// ============================================
// SCALE
// ============================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: transitionSpring },
};

export const scaleOut: Variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.8, transition: transitionBase },
};

export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },
};

// ============================================
// FLIP 3D (pour les cartes)
// ============================================

export const flip3D: Variants = {
  faceDown: { rotateY: 180 },
  faceUp: { rotateY: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const flip3DReduced: Variants = {
  faceDown: { opacity: 0 },
  faceUp: { opacity: 1, transition: { duration: 0.1 } },
};

// ============================================
// DEAL CARD (cascade pour distribution cartes)
// ============================================

export const dealCard: Variants = {
  hidden: { opacity: 0, y: -40, rotate: -5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

// ============================================
// TOAST NOTIFICATION
// ============================================

export const toastSlide: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: transitionSlow },
  exit: { opacity: 0, x: 100, transition: { duration: 0.2 } },
};

// ============================================
// MODAL
// ============================================

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitionBase },
  exit: { opacity: 0, transition: transitionBase },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: transitionSpring },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: transitionBase },
};

// ============================================
// ROULETTE WHEEL SPIN
// ============================================

export const rouletteSpin: Variants = {
  idle: { rotate: 0 },
  spinning: {
    rotate: 1440, // 4 tours complets
    transition: {
      duration: 4.5,
      ease: [0.25, 0.1, 0.25, 1], // ease-out-quart
    },
  },
};

export const rouletteSpinReduced: Variants = {
  idle: { rotate: 0 },
  spinning: {
    rotate: 90,
    transition: { duration: 0.1 },
  },
};

// ============================================
// BUTTON PRESS
// ============================================

export const buttonPress: Variants = {
  idle: { scale: 1 },
  pressed: { scale: 0.96 },
  hovered: { scale: 1.02 },
};

// ============================================
// LIST STAGGER (pour les listes animées)
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: transitionBase },
};

// ============================================
// CHIP PLACE (pour les jetons sur le tapis)
// ============================================

export const chipPlace: Variants = {
  hidden: { opacity: 0, scale: 1.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },
};

// ============================================
// UTILITY: CHECK REDUCED MOTION
// ============================================

/**
 * Vérifie si l'utilisateur préfère réduire les animations
 * (accessibilité - prefers-reduced-motion)
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Retourne la version appropriée d'un variant selon la préférence
 */
export function getMotionVariant(full: Variants, reduced: Variants): Variants {
  return prefersReducedMotion() ? reduced : full;
}
