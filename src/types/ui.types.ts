import type { Variants } from 'framer-motion';

/**
 * Thèmes de couleur disponibles
 */
export type Theme = 'dark' | 'light';

/**
 * Niveaux de notification toast
 */
export type ToastLevel = 'success' | 'error' | 'info' | 'warning';

/**
 * Types de modales disponibles
 */
export type ModalType =
  | 'settings'
  | 'stats'
  | 'history'
  | 'profile'
  | 'confirm'
  | 'blackjack'
  | 'roulette'
  | null;

/**
 * Variantes d'animation Framer Motion prédéfinies
 */
export type AnimationVariant =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'scaleOut'
  | 'flip'
  | 'rotate'
  | 'bounce';

/**
 * Configuration d'une animation
 */
export interface AnimationConfig {
  variants:   Variants;
  transition?: {
    duration?: number;
    ease?:    string;
    delay?:   number;
  };
}

/**
 * États de chargement de l'application
 */
export type LoadingState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Tailles disponibles pour les composants UI
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Variantes de boutons
 */
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';

/**
 * Props communes à tous les composants UI
 */
export interface CommonUIProps {
  className?: string;
  children?:  React.ReactNode;
  disabled?:  boolean;
  onClick?:   () => void;
}
