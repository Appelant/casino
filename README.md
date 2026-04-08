# ZéroVirguleChance - Casino Fictif

Application web de casino fictif (Roulette & Blackjack) avec classement synchronisé multi-appareils.

## Architecture

- **Frontend** : React + TypeScript + Vite + Tailwind
- **Backend** : Node.js + Express + SQLite (better-sqlite3)
- **Synchronisation** : API REST pour synchroniser les données entre appareils

## Démarrage rapide

### Option 1 : Script batch (Windows)

```bash
start-server.bat
```

Ce script démarre :
1. Le serveur backend (port 3001) dans une nouvelle fenêtre
2. Le serveur frontend (port 3000)

### Option 2 : Commandes manuelles

**Terminal 1 - Backend :**
```bash
npm run server
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

## URLs d'accès

- Frontend : http://localhost:3000
- Backend API : http://localhost:3001
- Health check : http://localhost:3001/health

## API Endpoints

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

### Utilisateur
- `GET /api/users/:id` - Récupérer les données utilisateur + historique
- `PATCH /api/users/:id` - Mettre à jour (balance, elo, stats)
- `POST /api/users/:id/rounds` - Ajouter un round à l'historique
- `DELETE /api/users/:id/rounds` - Effacer l'historique

### Classement
- `GET /api/leaderboard?limit=50` - Top joueurs par ELO

## Base de données

Les données sont stockées dans `data/zvc.db` (SQLite).

Pour réinitialiser complètement :
```bash
curl -X DELETE http://localhost:3001/api/admin/clear-all
```

## Synchronisation multi-appareils

Le leaderboard et les comptes sont synchronisés via le backend. Pour accéder au même compte depuis plusieurs appareils :
1. Créez un compte sur le premier appareil
2. Connectez-vous avec le même pseudo/mot de passe sur les autres appareils
3. Les données sont partagées automatiquement
