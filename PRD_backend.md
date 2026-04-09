# PRD --- ZéroVirguleChance (ZVC) --- FULL DEV READY (UPDATED BACKEND)

## 1. Contexte produit

Application de casino en ligne 100% argent fictif (ZVC\$). Architecture
avec frontend + backend local (self-hosted).

Objectif : expérience immersive sans risque financier.

------------------------------------------------------------------------

## 2. Architecture globale

### Frontend

-   React + TypeScript
-   UI, interactions, affichage

### Backend

-   Node.js (Express recommandé)
-   Gère logique métier + RNG + persistence

### Communication

-   API REST locale (http://localhost)

------------------------------------------------------------------------

## 3. Contraintes globales

-   Argent fictif uniquement
-   Aucune monétisation
-   Aucune donnée personnelle sensible
-   RNG sécurisé obligatoire

------------------------------------------------------------------------

## 4. Data Models

``` ts
type Rank = "bronze" | "silver" | "gold" | "platinum" | "diamond"

type Player = {
  pseudo: string
  balance: number
  rank: Rank
  totalBet: number
  totalWin: number
}

type GameHistoryEntry = {
  id: string
  game: "roulette" | "blackjack"
  bet: number
  result: "win" | "loss"
  payout: number
  timestamp: number
}
```

------------------------------------------------------------------------

## 5. RNG

``` ts
function getRandomInt(max: number): number {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0] % max
}
```

------------------------------------------------------------------------

## 6. API ENDPOINTS

### Player

-   GET /player
-   POST /player/reset

### Roulette

-   POST /roulette/spin

### Blackjack

-   POST /blackjack/start
-   POST /blackjack/action

------------------------------------------------------------------------

## 7. Roulette Logic

-   Wheel: 0--36
-   Bets:
    -   straight (35:1)
    -   red/black (1:1)
    -   even/odd (1:1)

Flow: 1. Receive bets 2. Generate number 3. Calculate payout 4. Return
result

------------------------------------------------------------------------

## 8. Blackjack Logic

-   6 decks
-   dealer hits soft 17

Flow: 1. Start game 2. Player actions 3. Dealer plays 4. Compute result

------------------------------------------------------------------------

## 9. Storage

-   Backend stores state in memory or JSON file
-   Frontend fetches via API

------------------------------------------------------------------------

## 10. Rank System

-   Based on totalWin
-   Only increases

------------------------------------------------------------------------

## 11. UX Rules

-   Response \< 200ms
-   Result clear
-   Balance always visible

------------------------------------------------------------------------

## 12. Success Metrics

-   Session \> 5 min
-   Return rate \> 25%

------------------------------------------------------------------------

## 13. Forbidden

-   Real money
-   External APIs
-   Ads
