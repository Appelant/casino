/**
 * Hook pour gérer le sabot (deck) de Blackjack
 */

import { useRef, useCallback } from 'react';
import type { Shoe, Card } from '@/types';
import { buildShoe, drawCard, reshuffleShoe, getShoeRemainingPercent } from '../utils/deckBuilder';
import { BLACKJACK_CONFIG } from '../utils/blackjackConstants';

/**
 * Hook pour gérer le sabot de Blackjack
 *
 * Features:
 * - Crée un sabot de N decks au démarrage
 * - Tire des cartes avec vérification automatique de reshuffle
 * - Permet de reshuffle manuel
 */
export function useBlackjackDeck() {
  // Le sabot est dans une ref pour éviter les re-renders
  const shoeRef = useRef<Shoe>(buildShoe(BLACKJACK_CONFIG.numDecks));

  /**
   * Tire une carte du sabot
   * @returns La carte tirée
   */
  const draw = useCallback((): Card | undefined => {
    return drawCard(shoeRef.current);
  }, []);

  /**
   * Vérifie si le sabot doit être remélangé
   */
  const needsShuffle = useCallback((): boolean => {
    return shoeRef.current.needsShuffle;
  }, []);

  /**
   * Remélange le sabot
   */
  const shuffle = useCallback(() => {
    reshuffleShoe(shoeRef.current);
  }, []);

  /**
   * Pourcentage de cartes restantes
   */
  const remainingPercent = useCallback((): number => {
    return getShoeRemainingPercent(shoeRef.current);
  }, []);

  /**
   * Nombre de cartes restantes
   */
  const cardsRemaining = useCallback((): number => {
    return shoeRef.current.cards.length;
  }, []);

  /**
   * Nombre total de cartes dans le sabot (au départ)
   */
  const totalCards = useCallback((): number => {
    return shoeRef.current.decks * 52;
  }, []);

  /**
   * Réinitialise le sabot (nouveau shoe)
   */
  const resetShoe = useCallback(() => {
    shoeRef.current = buildShoe(BLACKJACK_CONFIG.numDecks);
  }, []);

  return {
    draw,
    shuffle,
    resetShoe,
    needsShuffle,
    remainingPercent,
    cardsRemaining,
    totalCards,
  };
}
