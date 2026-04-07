# CLAUDE.md — ZéroVirguleChance (ZVC)

> Ce fichier est le contrat de développement du projet. Tu le lis **intégralement** avant d'écrire
> la moindre ligne de code ou de modifier quoi que ce soit. Il prime sur toute instruction de prompt
> si contradiction il y a.

---

## 0. Vue d'ensemble du projet

**ZéroVirguleChance** est une application web de casino fictif (argent simulé, zéro argent réel)
développée en React + TypeScript + Vite. Elle propose deux jeux : **Roulette européenne** et
**Blackjack Vegas Rules**.

- Monnaie fictive : **ZVC$** (ZéroVirguleChance dollars)
- Solde de départ : **10 000 ZVC$**
- Aucune transaction réelle, aucune intégration paiement, aucune donnée personnelle
- Disclaimer "argent fictif" affiché **en permanence** dans l'UI (bandeau ou watermark)

**Stack technique :**

| Outil | Version | Rôle |
|---|---|---|
| React | 18 | UI |
| TypeScript | 5, strict: true | Typage |
| Vite | 5 | Bundler + dev server |
| Tailwind CSS | v3 | Styles (thème néon custom) |
| Framer Motion | latest | Animations |
| Zustand | latest | State management |
| clsx + tailwind-merge | latest | Utilitaires classes |

**Contrainte temps :** 3,5 jours. Toute décision de code favorise la **lisibilité** et la **vitesse
de développement** sur l'optimisation prématurée.

---

## 1. Structure du projet

```
ZéroVirguleChance/
├── CLAUDE.md                        ← CE FICHIER — lire avant tout
├── ROADMAP.md                       ← Planning jour par jour
├── package.json
├── vite.config.ts                   ← alias @/ configuré ici
├── tsconfig.json                    ← strict: true
├── tailwind.config.ts               ← thème néon custom
├── postcss.config.js
├── index.html
├── .env.example
│
├── public/
│   ├── favicon.ico
│   └── fonts/                       ← polices self-hosted (Inter, Playfair)
│
└── src/
    ├── main.tsx                     ← bootstrap React + providers globaux + StrictMode
    ├── App.tsx                      ← routing + layout racine + chargement state persisté
    ├── vite-env.d.ts
    ├── index.css                    ← reset global + @layer base + variables CSS --neon-*
    │
    ├── types/                       ← CONTRAT DE L'APP — à créer EN PREMIER
    │   ├── index.ts                 ← re-export barrel de tous les types
    │   ├── player.types.ts          ← Player, PlayerStats, BetHistory, Currency
    │   ├── game.types.ts            ← GameType, GameResult, GameStatus, RoundResult
    │   ├── roulette.types.ts        ← RouletteNumber, BetType, RouletteBet, SpinResult
    │   ├── blackjack.types.ts       ← Card, Suit, Rank, Hand, BlackjackAction, BlackjackResult
    │   ├── store.types.ts           ← Shapes Zustand : PlayerState, StatsState, HistoryState
    │   └── ui.types.ts              ← AnimationVariant, ModalType, ToastLevel, Theme
    │
    ├── stores/
    │   ├── index.ts                 ← re-export barrel de tous les stores
    │   ├── player/
    │   │   ├── playerStore.ts       ← balance, username, avatar | placeBet, win, lose, reset
    │   │   ├── playerStore.selectors.ts   ← canBet, netProfit, winRate (mémoïsés)
    │   │   └── playerStore.middleware.ts  ← persist → LocalStorage
    │   ├── stats/
    │   │   ├── statsStore.ts        ← totalWagered, totalWon, biggestWin, streaks, sessionStart
    │   │   └── statsStore.selectors.ts   ← RTP réel, sessionDuration, streakStatus
    │   ├── history/
    │   │   ├── historyStore.ts      ← rounds[] 50 entrées max | addRound, clearHistory
    │   │   └── historyStore.selectors.ts ← lastRound, roundsByGame, recentTrend
    │   └── ui/
    │       └── uiStore.ts           ← activeModal, toasts[], soundEnabled, animSpeed
    │
    ├── utils/                       ← logique PURE — zéro React, zéro JSX
    │   ├── index.ts
    │   ├── rng/
    │   │   ├── rng.ts               ← CSPRNG via crypto.getRandomValues (Math.random INTERDIT)
    │   │   ├── rng.test.ts          ← tests distribution Chi-carré (priorité basse)
    │   │   └── shuffle.ts           ← Fisher-Yates avec rng.ts
    │   ├── payouts/
    │   │   ├── roulettePayout.ts    ← table mises→ratios (Plein 35:1, Cheval 17:1…)
    │   │   ├── blackjackPayout.ts   ← BJ 3:2, Insurance 2:1, Push remboursement
    │   │   └── payout.types.ts      ← PayoutRatio, BetResult, PayoutCalculation
    │   ├── storage/
    │   │   ├── localStorage.ts      ← wrappers typés get/set/remove + try/catch
    │   │   └── storageKeys.ts       ← enum STORAGE_KEYS (ZVC_PLAYER, ZVC_STATS…)
    │   ├── currency.ts              ← formatCurrency(n) → "1 234 ZVC$"
    │   ├── math.ts                  ← clamp, roundTo, percentOf, oddsToProb
    │   ├── time.ts                  ← formatSessionDuration, relativeTimestamp
    │   └── validators.ts            ← isBetValid, isWithinBalance, isBetInRange
    │
    ├── features/
    │   │
    │   ├── roulette/
    │   │   ├── index.ts             ← barrel export de la feature
    │   │   ├── components/
    │   │   │   ├── RouletteTable.tsx     ← layout principal : roue + tapis + contrôles
    │   │   │   ├── RouletteWheel.tsx     ← roue SVG animée Framer Motion, 37 cases EU
    │   │   │   ├── BettingGrid.tsx       ← tapis interactif numéros 0-36 + zones ext.
    │   │   │   ├── BettingChip.tsx       ← jeton draggable (1/5/25/100/500 ZVC$)
    │   │   │   ├── BetDisplay.tsx        ← récap mises actives + total + effacer
    │   │   │   ├── SpinButton.tsx        ← disabled si aucune mise ou spin en cours
    │   │   │   ├── ResultBanner.tsx      ← numéro gagnant, couleur, gain/perte animé
    │   │   │   ├── RouletteHistory.tsx   ← 20 derniers numéros avec code couleur
    │   │   │   ├── RouletteBall.tsx      ← bille animée (MVP : marqueur simple)
    │   │   │   └── StatsBadge.tsx        ← badges Hot/Cold basés sur historique session
    │   │   ├── hooks/
    │   │   │   ├── useRouletteEngine.ts  ← FSM : idle→betting→spinning→result
    │   │   │   ├── useRouletteBets.ts    ← addBet, removeBet, clearBets, totalBet
    │   │   │   ├── useRouletteAnimation.ts ← durée spin, easing, callback onLanded
    │   │   │   └── useRouletteStats.ts   ← hot/cold numbers, fréquences, séquences
    │   │   └── utils/
    │   │       ├── rouletteNumbers.ts    ← config 37 numéros EU (couleur, position, voisins)
    │   │       ├── betResolver.ts        ← détermine mises gagnantes selon numéro tiré
    │   │       ├── wheelGeometry.ts      ← angles SVG par case (360°/37)
    │   │       └── rouletteConstants.ts  ← BET_LIMITS, POCKETS_ORDER EU, COLORS_MAP
    │   │
    │   └── blackjack/
    │       ├── index.ts
    │       ├── components/
    │       │   ├── BlackjackTable.tsx    ← layout : feutre vert glassmorphisme
    │       │   ├── DealerHand.tsx        ← main croupier, carte cachée face-down
    │       │   ├── PlayerHand.tsx        ← main(s) joueur, total, statut split
    │       │   ├── PlayingCard.tsx       ← carte SVG avec flip 3D Framer Motion
    │       │   ├── BettingTable.tsx      ← zone mise initiale avant distribution
    │       │   ├── ActionPanel.tsx       ← Hit/Stand/Double/Split (contextuels)
    │       │   ├── ScoreDisplay.tsx      ← score temps réel (As 1/11, Bust en rouge)
    │       │   └── ResultOverlay.tsx     ← WIN/LOSE/PUSH/BLACKJACK + montant
    │       ├── hooks/
    │       │   ├── useBlackjackEngine.ts ← FSM : idle→bet→deal→player→dealer→settle
    │       │   ├── useBlackjackDeck.ts   ← sabot 6 decks, tirage, shuffle point, reshuffle
    │       │   ├── useBlackjackActions.ts ← hit, stand, doubleDown, split + validations
    │       │   └── useBlackjackAnimation.ts ← deal cascade staggeré, flip, bust shake
    │       └── utils/
    │           ├── handCalculator.ts     ← valeur main (As 1/11, Bust, Soft/Hard)
    │           ├── dealerStrategy.ts     ← Vegas H17 : hit sur Soft 17, stand Hard 17+
    │           ├── deckBuilder.ts        ← génère sabot N×52 cartes typées Card
    │           ├── actionValidator.ts    ← canDouble, canSplit (surrender hors MVP)
    │           └── blackjackConstants.ts ← NUM_DECKS=6, BJ_PAYOUT=3/2, SHUFFLE_THRESHOLD=0.25
    │
    ├── components/
    │   ├── layout/
    │   │   ├── CasinoLayout.tsx     ← shell global : header + sidebar + fond sombre
    │   │   ├── Header.tsx           ← logo ZVC, balance, bouton son, lien lobby
    │   │   ├── Sidebar.tsx          ← nav latérale : icônes jeux + stats + historique
    │   │   └── GameLobby.tsx        ← page accueil : cards jeux avec preview animée
    │   ├── ui/
    │   │   ├── GlassCard.tsx        ← conteneur glassmorphisme (backdrop-blur + border néon)
    │   │   ├── NeonButton.tsx       ← glow néon 3 variantes : purple / cyan / gold
    │   │   ├── CurrencyDisplay.tsx  ← solde avec animation useCountUp
    │   │   ├── ToastNotification.tsx ← WIN +X / LOSE -X, auto-dismiss 3s
    │   │   ├── Modal.tsx            ← modale générique + backdrop AnimatePresence
    │   │   ├── LoadingSpinner.tsx   ← spinner néon
    │   │   └── ConfirmDialog.tsx    ← confirmation reset solde / quitter
    │   ├── stats/
    │   │   ├── StatsPanel.tsx       ← winrate, RTP réel, biggest win, session time
    │   │   ├── HistoryPanel.tsx     ← rounds paginés avec filtres par jeu
    │   │   └── StreakBadge.tsx      ← 🔥 Win Streak x4 / ❄️ Cold Streak x7
    │   └── player/
    │       ├── PlayerProfile.tsx    ← avatar, pseudo, solde, rang (Bronze→Diamant)
    │       └── BalanceReset.tsx     ← reset à 10 000 ZVC$ avec ConfirmDialog
    │
    ├── hooks/
    │   ├── useCountUp.ts            ← animation compteur numérique A→B
    │   ├── useLocalStorage.ts       ← hook générique get/set LS synchronisé avec state
    │   ├── useSound.ts              ← lecture effets sonores + volume + mute
    │   ├── useMediaQuery.ts         ← isMobile, isTablet pour layout adaptatif
    │   └── useGameSession.ts        ← durée session, auto-save périodique
    │
    ├── config/
    │   ├── animations.config.ts     ← variants Framer Motion réutilisables centralisés
    │   ├── theme.config.ts          ← couleurs néon, breakpoints, z-index scale
    │   └── game.config.ts           ← STARTING_BALANCE, MIN_BET, MAX_BET, CHIP_VALUES
    │
    └── assets/
        ├── sounds/                  ← chip_place.mp3, wheel_spin.mp3, card_deal.mp3, win_fanfare.mp3
        └── images/                  ← logo ZVC SVG, dos de carte, texture felt
```

---

## 2. Conventions de code — RÈGLES ABSOLUES

### 2.1 TypeScript

- **`strict: true`** dans tsconfig.json — aucune exception, aucun `// @ts-ignore`
- **Zéro `any`** — utilise `unknown` + narrowing si type inconnu
- **Interfaces pour objets de données, types pour unions et primitives** :

  ```ts
  // ✅ Correct
  interface Player {
    id: string;
    balance: number;
    username: string;
  }

  type GameStatus = 'idle' | 'betting' | 'spinning' | 'result';
  type Currency = number; // toujours en centimes ZVC (pas de float)

  // ❌ Interdit
  const result: any = resolvebet(bets, number);
  ```

- **Tous les types dans `src/types/`** — jamais de types inline dans un composant sauf triviaux
- **Imports via barrel `@/types`** — pas d'import direct d'un fichier type individuel

### 2.2 Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composants React | PascalCase | `RouletteWheel.tsx` |
| Hooks | camelCase + préfixe `use` | `useRouletteEngine.ts` |
| Stores Zustand | camelCase + suffixe `Store` | `playerStore.ts` |
| Utilitaires | camelCase | `betResolver.ts` |
| Types / Interfaces | PascalCase | `SpinResult`, `BlackjackAction` |
| Constantes | SCREAMING_SNAKE_CASE | `BET_LIMITS`, `POCKETS_ORDER` |
| Fichiers config | camelCase | `game.config.ts` |

### 2.3 Ordre d'imports — strict

```ts
// 1. React
import { useState, useCallback, useReducer } from 'react';

// 2. Libs externes
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { clsx } from 'clsx';

// 3. Imports internes alias @/
import type { Player, SpinResult } from '@/types';
import { usePlayerStore } from '@/stores';
import { formatCurrency } from '@/utils/currency';
import { fadeIn } from '@/config/animations.config';

// 4. Imports relatifs (composants frères/enfants)
import { BettingChip } from './BettingChip';
import { ResultBanner } from './ResultBanner';
```

### 2.4 Composants React

- **Functional components uniquement** — aucune class component
- **Props typées explicitement avec interface dédiée** :

  ```tsx
  interface RouletteWheelProps {
    isSpinning: boolean;
    targetNumber: number | null;
    onSpinComplete: (number: number) => void;
    className?: string;
  }

  export function RouletteWheel({
    isSpinning,
    targetNumber,
    onSpinComplete,
    className,
  }: RouletteWheelProps) {
    // ...
  }
  ```

- **Export nommé uniquement** — jamais `export default` (sauf `App.tsx` et `main.tsx`)
- **Un composant par fichier** — pas d'exception
- **Zéro logique métier dans les composants** — toute la logique vit dans les hooks ou utils
- **Les composants orchestrent, les hooks calculent**

### 2.5 Hooks

- Un hook = une responsabilité unique et claire
- **Retourner un objet nommé** (jamais un tableau sauf convention `useState`-like) :

  ```ts
  // ✅
  return { bets, totalBet, addBet, removeBet, clearBets };

  // ❌
  return [bets, totalBet, addBet, removeBet, clearBets];
  ```

- Toute logique asynchrone est dans les hooks, jamais dans les composants
- Les hooks de feature (`useRouletteEngine`, `useBlackjackEngine`) sont les seuls à accéder
  directement aux stores Zustand

### 2.6 Stores Zustand — structure standard

```ts
// Exemple : playerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerState } from '@/types';
import { STORAGE_KEYS } from '@/utils/storage/storageKeys';
import { GAME_CONFIG } from '@/config/game.config';

const INITIAL_STATE = {
  balance: GAME_CONFIG.STARTING_BALANCE,
  username: 'Joueur',
  avatar: 'default',
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      placeBet: (amount) =>
        set((s) => ({ balance: s.balance - amount })),

      receiveWin: (amount) =>
        set((s) => ({ balance: s.balance + amount })),

      reset: () => set(INITIAL_STATE),
    }),
    { name: STORAGE_KEYS.PLAYER }
  )
);
```

---

## 3. Logique métier — Règles critiques

### 3.1 RNG — NON NÉGOCIABLE

**`Math.random()` est INTERDIT dans tout le projet sans exception.**

Seul générateur autorisé (`src/utils/rng/rng.ts`) :

```ts
/**
 * Génère un float dans [0, 1) via CSPRNG navigateur.
 * Math.random() est INTERDIT — ne pas utiliser.
 */
export function secureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xFFFF_FFFF + 1);
}

/**
 * Entier aléatoire sécurisé dans [min, max] inclus.
 */
export function secureRandomInt(min: number, max: number): number {
  return Math.floor(secureRandom() * (max - min + 1)) + min;
}
```

Toute fonction utilisant du hasard **importe depuis `@/utils/rng`**.

### 3.2 Roulette européenne — Règles du jeu

**37 cases** : 0 (vert), 1–36 (rouge/noir).

**Ordre sur la roue** (sens horaire, position 0 en haut) :
```
0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
```

**Numéros rouges** : 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36

**Table des payouts** :

| Type de mise | Cases couvertes | Payout |
|---|---|---|
| Plein | 1 | 35:1 |
| Cheval | 2 | 17:1 |
| Transversale pleine | 3 | 11:1 |
| Carré | 4 | 8:1 |
| Transversale simple | 6 | 5:1 |
| Colonne | 12 | 2:1 |
| Douzaine | 12 | 2:1 |
| Pair / Impair | 18 | 1:1 |
| Rouge / Noir | 18 | 1:1 |
| Manque (1–18) / Passe (19–36) | 18 | 1:1 |

**La case 0 fait perdre toutes les mises simples** — pas de règle "en prison" (hors MVP).

### 3.3 Blackjack — Vegas Rules

| Règle | Valeur |
|---|---|
| Nombre de decks | 6 |
| Payout Blackjack naturel | 3:2 |
| Dealer | Hit on Soft 17 (H17) |
| Double | Autorisé sur toutes les 2 premières cartes |
| Split | Autorisé sur paires identiques, 1 fois |
| Surrender | Hors scope MVP |
| Insurance | Proposée si dealer montre un As, payout 2:1 |
| Shuffle point | < 25% du sabot restant |

**Algorithme de calcul de la main** (`handCalculator.ts`) :
```
1. Compter toutes les cartes à leur valeur nominale (As = 11, Figures = 10)
2. Si total > 21 ET au moins un As compte à 11 → recompter cet As à 1
3. Répéter jusqu'à total ≤ 21 ou plus d'As à 11
4. Soft hand = main avec As compté à 11
5. Hard hand = tout le reste
6. Bust = total > 21 après toutes les recomptages
7. Blackjack naturel = As + Figure en exactement 2 cartes (première donne uniquement)
```

### 3.4 Machines à états (FSM) — impératif

**Jamais de booleans empilés pour modéliser l'état d'un jeu.** On utilise `useReducer` avec des
actions typées.

**FSM Roulette :**
```
         placeBet()        spin()         resolve()        reset()
  idle ──────────────▶ betting ──────▶ spinning ──────▶ result ──────▶ idle
   ▲                                                        │
   └────────────────────────── reset() ────────────────────┘
```

**FSM Blackjack :**
```
         bet()       deal()        action()              stand()/bust
  idle ──────▶ bet ──────▶ deal ──────▶ playerTurn ──────────────▶ dealerTurn
   ▲                                        │                           │
   │                                   blackjack                    settle()
   └─────────────────────── reset() ────────────────────────────────────┘
```

Chaque état détermine quels boutons sont actifs dans l'UI. Le composant lit l'état courant de la
FSM et affiche/désactive les boutons en conséquence — aucun calcul de condition dans le JSX.

---

## 4. Design System

### 4.1 Palette de couleurs (tailwind.config.ts)

```ts
colors: {
  // Fonds
  'casino-dark':    '#0a0a0f',  // fond principal de la page
  'casino-surface': '#12121a',  // surfaces : cartes, panels, modales
  'casino-border':  '#1e1e2e',  // bordures subtiles

  // Néon — couleurs primaires du thème
  'neon-purple': '#8B5CF6',     // couleur principale (CTA, focus)
  'neon-cyan':   '#06B6D4',     // accent secondaire (info, hover)
  'neon-gold':   '#F59E0B',     // gains, récompenses, Blackjack
  'neon-red':    '#EF4444',     // pertes, erreurs, bust
  'neon-green':  '#10B981',     // succès, victoires, solde positif

  // Spécifiques roulette
  'roulette-red':   '#DC2626',
  'roulette-black': '#1F1F1F',
  'roulette-green': '#16A34A',  // zéro
}
```

### 4.2 Variables CSS globales (index.css)

```css
:root {
  --neon-purple: #8B5CF6;
  --neon-cyan:   #06B6D4;
  --neon-gold:   #F59E0B;
  --neon-red:    #EF4444;
  --neon-green:  #10B981;

  /* Glows (box-shadow) */
  --glow-purple: 0 0 20px rgba(139, 92, 246, 0.4);
  --glow-cyan:   0 0 20px rgba(6, 182, 212, 0.4);
  --glow-gold:   0 0 20px rgba(245, 158, 11, 0.4);
  --glow-red:    0 0 20px rgba(239, 68, 68, 0.4);
}
```

### 4.3 Composants atomiques — usage

| Composant | Quand l'utiliser |
|---|---|
| `GlassCard` | Tout conteneur qui a besoin de backdrop-blur + border néon |
| `NeonButton` | Tout bouton d'action primaire (3 variantes: purple / cyan / gold) |
| `CurrencyDisplay` | Affichage du solde (inclut useCountUp) |
| `Modal` | Toute modale (wrappe AnimatePresence) |
| `ToastNotification` | Feedback win/lose (auto-dismiss 3s) |
| `ConfirmDialog` | Actions destructives (reset solde, quitter partie) |

### 4.4 Glassmorphisme — classes Tailwind

```tsx
// Recette glassmorphisme standard
<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">

// Avec glow néon (hover ou état actif)
<div className="border border-neon-purple/30 shadow-[var(--glow-purple)]">
```

---

## 5. Animations Framer Motion

### 5.1 Variants centralisés — NE PAS dupliquer

**Tous les variants Framer Motion** sont dans `src/config/animations.config.ts`.
On **n'écrit jamais de variants inline** dans un composant.

```ts
// animations.config.ts
import type { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const slideUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const bounceIn: Variants = {
  hidden:  { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

export const flip3D: Variants = {
  faceDown: { rotateY: 180 },
  faceUp:   { rotateY: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const dealCard: Variants = {
  hidden:  { opacity: 0, y: -40, rotate: -5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { delay: i * 0.15, duration: 0.3, ease: 'easeOut' },
  }),
};

export const toastSlide: Variants = {
  hidden:  { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 100, transition: { duration: 0.2 } },
};
```

### 5.2 Priorité des animations pour le MVP

| Priorité | Animation | Fichier responsable |
|---|---|---|
| 🔴 HAUTE | Rotation roue + décélération physique | `useRouletteAnimation.ts` |
| 🔴 HAUTE | Flip 3D carte face-down → face-up | `PlayingCard.tsx` |
| 🔴 HAUTE | Deal en cascade (stagger delay) | `useBlackjackAnimation.ts` |
| 🟡 MOYENNE | Toasts WIN/LOSE slide+fade | `ToastNotification.tsx` |
| 🟡 MOYENNE | Compteur solde animé | `useCountUp.ts` + `CurrencyDisplay.tsx` |
| 🟢 BASSE | Bille roulette trajectoire physique | `RouletteBall.tsx` — simplifier si temps manque |
| ⚪ HORS MVP | Confettis / particules victoire | Différer post-livraison |

### 5.3 Accessibilité des animations — obligatoire

```ts
// Dans chaque hook d'animation
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const spinDuration = prefersReducedMotion ? 0.1 : 4.5;
const flipDuration = prefersReducedMotion ? 0   : 0.4;
```

---

## 6. State — Persistance et cycle de vie

### 6.1 Clés de stockage (storageKeys.ts)

```ts
export const STORAGE_KEYS = {
  PLAYER:   'ZVC_PLAYER',
  STATS:    'ZVC_STATS',
  HISTORY:  'ZVC_HISTORY',
  UI_PREFS: 'ZVC_UI_PREFS',
} as const;
```

### 6.2 Limites de l'historique

- **50 rounds maximum** : quand on ajoute un round et que length === 50, on supprime le plus ancien
- La fenêtre glissante est gérée dans `historyStore.ts`, pas dans les composants

### 6.3 Accès LocalStorage

**Toujours wrappé dans try/catch** :

```ts
// localStorage.ts
export function getItem<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail si quota dépassé
  }
}
```

---

## 7. Configuration du jeu

```ts
// src/config/game.config.ts
export const GAME_CONFIG = {
  STARTING_BALANCE:   10_000,          // ZVC$ de départ
  MIN_BET:            1,               // mise minimale
  MAX_BET:            5_000,           // mise maximale par round
  CHIP_VALUES:        [1, 5, 25, 100, 500] as const,
  HISTORY_MAX_ROUNDS: 50,
  SOUND_ENABLED_DEFAULT: true,

  // Blackjack
  BJ_NUM_DECKS:       6,
  BJ_PAYOUT:          1.5,             // 3:2
  BJ_INSURANCE_PAYOUT:2,               // 2:1
  BJ_SHUFFLE_THRESHOLD:0.25,           // reshuffle si < 25% restant

  // Session
  AUTO_SAVE_INTERVAL_MS: 30_000,       // auto-save toutes les 30s
} as const;
```

---

## 8. Ordre de développement — IMPÉRATIF

**Ne jamais commencer une couche avant que la précédente soit solide et testée manuellement.**

```
══════════════════════════════════════════════════════
JOUR 1
══════════════════════════════════════════════════════

MATIN
  □ Vite + React + TypeScript — vite.config.ts, tsconfig.json
  □ Tailwind thème néon : tailwind.config.ts, postcss.config.js
  □ Alias @/ + index.css (reset + variables CSS --neon-*)
  □ Dépendances npm : framer-motion, zustand, clsx, tailwind-merge

  □ src/types/*.ts ← PRIORITÉ ABSOLUE
    Ordre : player.types.ts → game.types.ts → roulette.types.ts
            → blackjack.types.ts → store.types.ts → ui.types.ts → index.ts

APRÈS-MIDI
  □ src/utils/rng/rng.ts (CSPRNG) + shuffle.ts
  □ src/config/game.config.ts
  □ src/utils/storage/ (storageKeys.ts + localStorage.ts)
  □ Stores Zustand :
      playerStore.ts + middleware (persist)
      statsStore.ts
      historyStore.ts
      uiStore.ts
  □ Sélecteurs mémoïsés pour chaque store

SOIR
  □ src/features/roulette/utils/ :
      rouletteConstants.ts → rouletteNumbers.ts → wheelGeometry.ts
      → roulettePayout.ts → betResolver.ts → validators.ts
  □ src/features/roulette/hooks/ :
      useRouletteBets.ts → useRouletteEngine.ts (FSM)

══════════════════════════════════════════════════════
JOUR 2
══════════════════════════════════════════════════════

MATIN
  □ src/features/blackjack/utils/ :
      blackjackConstants.ts → deckBuilder.ts → handCalculator.ts
      → dealerStrategy.ts → actionValidator.ts → blackjackPayout.ts
  □ src/features/blackjack/hooks/ :
      useBlackjackDeck.ts → useBlackjackActions.ts → useBlackjackEngine.ts (FSM)

APRÈS-MIDI
  □ src/config/animations.config.ts (tous les variants centralisés)
  □ src/components/layout/ : CasinoLayout, Header, Sidebar, GameLobby
  □ src/components/ui/ : GlassCard, NeonButton, CurrencyDisplay, Modal, ToastNotification

SOIR
  □ src/features/roulette/components/ (câblage complet) :
      BettingGrid → BettingChip → BetDisplay → RouletteWheel (statique)
      → SpinButton → ResultBanner → RouletteHistory
  □ Brancher useRouletteEngine + playerStore → JEU ROULETTE FONCTIONNEL

══════════════════════════════════════════════════════
JOUR 3
══════════════════════════════════════════════════════

MATIN
  □ src/features/blackjack/components/ (câblage complet) :
      PlayingCard → DealerHand → PlayerHand → ScoreDisplay
      → BettingTable → ActionPanel → ResultOverlay
  □ Brancher useBlackjackEngine + playerStore → JEU BLACKJACK FONCTIONNEL

APRÈS-MIDI
  □ Animations priorité HAUTE :
      useRouletteAnimation.ts (rotation roue + décélération)
      PlayingCard.tsx flip 3D (rotateY via Framer Motion)
      useBlackjackAnimation.ts (deal cascade staggeré)
  □ Vérification prefers-reduced-motion dans chaque animation

SOIR
  □ ToastNotification.tsx (AnimatePresence slide+fade)
  □ useCountUp.ts + CurrencyDisplay.tsx (animation solde)
  □ Transitions de page lobby ↔ jeu (Framer layout animations dans App.tsx)

══════════════════════════════════════════════════════
JOUR 3.5
══════════════════════════════════════════════════════

MATIN
  □ useSound.ts + intégration effets (chip, spin, deal, win)
  □ useMediaQuery.ts + layout responsive (table lisible sur 375px)
  □ StatsPanel.tsx, HistoryPanel.tsx, StreakBadge.tsx
  □ PlayerProfile.tsx + BalanceReset.tsx

APRÈS-MIDI (QA + finitions)
  □ Disclaimer "argent fictif" permanent dans Header ou bandeau global
  □ aria-labels sur tous les boutons interactifs
  □ Tests manuels handCalculator (edge cases : As, Blackjack, Bust)
  □ Tests manuels betResolver (toutes les combinaisons de mise)
  □ useGameSession.ts (auto-save, durée session)
  □ Lazy loading minimal : React.lazy() sur les deux features de jeu
  □ Build Vite final : vite build → vérifier 0 erreur TypeScript

══════════════════════════════════════════════════════
HORS SCOPE MVP — NE PAS IMPLÉMENTER
══════════════════════════════════════════════════════

  ✗ Tests Chi-carré RNG (rng.test.ts peut rester stub)
  ✗ InsuranceDialog.tsx et ShoeIndicator.tsx
  ✗ basicStrategy.ts (hint mode)
  ✗ Surrender au blackjack
  ✗ Confettis / particules de victoire élaborées
  ✗ Code splitting avancé par feature
  ✗ Audit accessibilité complet (aria-labels de base suffisent)
```

---

## 9. Anti-patterns — NE JAMAIS FAIRE

```tsx
// ❌ Math.random() — interdit dans tout le projet
const drawnNumber = Math.floor(Math.random() * 37);

// ❌ any — zéro tolérance
const result: any = resolvebet(bets, number);
function process(data: any) {}

// ❌ Logique métier dans un composant
export function RouletteWheel() {
  const winningBets = bets.filter(b => b.numbers.includes(drawnNumber)); // → dans useRouletteEngine
  const payout = winningBets.reduce((acc, b) => acc + b.amount * 35, 0); // → dans betResolver
}

// ❌ Variants Framer Motion inline (les mettre dans animations.config.ts)
<motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}>

// ❌ Types inline non triviaux dans les composants
function Foo({ data }: { data: { id: string; values: number[]; meta: Record<string,unknown> }[] }) {}
// → créer RouletteDataItem dans player.types.ts

// ❌ Booleans empilés pour l'état d'un jeu
const [isSpinning, setIsSpinning] = useState(false);
const [isResolving, setIsResolving] = useState(false);
const [hasResult, setHasResult] = useState(false);
// → une FSM avec useReducer, état typé GameStatus

// ❌ export default dans les features (sauf App.tsx et main.tsx)
export default function BettingGrid() {}

// ❌ Fetch / API externe de toute nature
fetch('https://some-casino-api.com/spin'); // INTERDIT — tout est local

// ❌ Cross-contamination de features
// Dans src/features/blackjack/, n'importe jamais depuis src/features/roulette/

// ❌ Accès direct au localStorage sans passer par les utilitaires
localStorage.setItem('balance', '10000'); // → passer par setItem() de storage/localStorage.ts

// ❌ Clés LocalStorage en dur (strings)
localStorage.getItem('ZVC_PLAYER'); // → STORAGE_KEYS.PLAYER

// ❌ Argent réel — toute référence à des paiements réels est hors scope absolu
```

---

## 10. Checklist avant chaque fichier

Avant de créer ou modifier un fichier, vérifie :

**Typage**
- [ ] Toutes les fonctions ont un type de retour explicite
- [ ] Zéro `any`, zéro `// @ts-ignore`
- [ ] Les nouveaux types sont dans `src/types/` et exportés depuis le barrel

**Logique**
- [ ] Aucun `Math.random()` — seul `secureRandom()` de `@/utils/rng`
- [ ] Aucune logique métier dans les composants
- [ ] Les constantes sont dans `*Constants.ts` ou `game.config.ts`

**Imports**
- [ ] Ordre : React → libs → @/ → relatifs
- [ ] Pas d'import cross-feature (roulette ↔ blackjack)
- [ ] Les clés storage viennent de `STORAGE_KEYS`

**Animations**
- [ ] Les variants Framer Motion sont dans `animations.config.ts`, pas inline
- [ ] `prefers-reduced-motion` est respecté dans chaque animation

**Architecture**
- [ ] Le fichier est dans le bon dossier (feature ou composant partagé)
- [ ] Un composant par fichier, export nommé

---

## 11. FAQ développement

**Q : Dois-je écrire les tests avant de coder ?**
R : Non. Les seuls tests prioritaires sont `handCalculator` et `betResolver` (tests manuels dans la
console suffisent). Ne bloque jamais une feature pour écrire des tests.

**Q : La bille de roulette est complexe à animer — je simplifie ?**
R : Oui. Un marqueur de position sur la roue suffit pour le MVP. La trajectoire physique de la
bille est en basse priorité. Si tu as du temps en fin de jour 3, tu l'ajoutes.

**Q : Tailwind vs CSS custom ?**
R : Tailwind en priorité absolue. CSS custom seulement pour les variables `--neon-*` dans
`index.css` et les keyframes non faisables avec Tailwind.

**Q : Responsive — à quel degré ?**
R : La table de jeu doit être utilisable sur 375px de large. Pas de perfection mobile exigée,
juste de la fonctionnalité. `useMediaQuery` gère les breakpoints.

**Q : Comment gérer une partie en cours au reload de page ?**
R : Le state Zustand est persisté via `persist` middleware. `useGameSession` récupère le state au
montage. Si le jeu était en cours (état non-idle), on remet à l'état `idle` avec les mises annulées.

**Q : Faut-il gérer l'historique des rounds par session ou de façon permanente ?**
R : Permanent (LocalStorage), fenêtre glissante de 50 rounds. L'utilisateur peut effacer via
`clearHistory()` dans le store.

**Q : Le disclaimer "argent fictif" — où le mettre ?**
R : Bandeau permanent en bas du `CasinoLayout` ou watermark discret dans le `Header`. Il doit
être visible à tout moment, pas seulement au démarrage.
