/**
 * Construction et gestion du sabot (deck) de Blackjack
 */

import type { Card, Shoe, Rank, Suit } from '@/types';
import { shuffle } from '@/utils/rng/shuffle';
import { BLACKJACK_CONFIG } from './blackjackConstants';

/**
 * Toutes les ranks possibles dans un deck
 */
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/**
 * Toutes les enseignes
 */
export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * Crée un deck standard de 52 cartes
 */
export function buildDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        value: getCardValue(rank),
        isFaceDown: false,
      });
    }
  }

  return deck;
}

/**
 * Retourne la valeur numérique d'une rank
 */
export function getCardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

/**
 * Crée un sabot complet avec N decks
 * @param numDecks - Nombre de decks (défaut: 6 pour Vegas)
 */
export function buildShoe(numDecks: number = BLACKJACK_CONFIG.numDecks): Shoe {
  const cards: Card[] = [];

  // Empiler N decks
  for (let i = 0; i < numDecks; i++) {
    cards.push(...buildDeck());
  }

  // Mélanger le sabot
  shuffle(cards);

  return {
    decks: numDecks,
    cards,
    dealtCount: 0,
    needsShuffle: false,
  };
}

/**
 * Tire une carte du sabot
 * @returns La carte tirée ou undefined si sabot vide
 */
export function drawCard(shoe: Shoe): Card | undefined {
  if (shoe.cards.length === 0) {
    return undefined;
  }

  const card = shoe.cards.pop();
  if (card) {
    shoe.dealtCount++;
    checkShuffleNeeded(shoe);
  }

  return card;
}

/**
 * Vérifie si le sabot doit être remélangé
 * (quand il reste moins de 25% des cartes)
 */
export function checkShuffleNeeded(shoe: Shoe): void {
  const totalCards = shoe.decks * 52;
  const remainingCards = shoe.cards.length;
  const remainingRatio = remainingCards / totalCards;

  shoe.needsShuffle = remainingRatio < BLACKJACK_CONFIG.shuffleThreshold;
}

/**
 * Remélange le sabot (quand il est bas)
 */
export function reshuffleShoe(shoe: Shoe): void {
  shoe.cards = [];
  shoe.dealtCount = 0;
  shoe.needsShuffle = false;

  // Reconstruire et mélanger
  for (let i = 0; i < shoe.decks; i++) {
    shoe.cards.push(...buildDeck());
  }
  shuffle(shoe.cards);
}

/**
 * Pourcentage de cartes restantes dans le sabot
 */
export function getShoeRemainingPercent(shoe: Shoe): number {
  const totalCards = shoe.decks * 52;
  return (shoe.cards.length / totalCards) * 100;
}
