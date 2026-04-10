/**
 * Serveur backend ZéroVirguleChance
 * Base de données SQLite centralisée pour synchroniser les utilisateurs
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, '../data/zvc.db');

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-06-30.basil',
});

// Packs boutique — zvcCents = montant crédité en centimes ZVC, eurCents = prix Stripe en centimes EUR
const SHOP_PACKS: Record<string, { zvcCents: number; eurCents: number; label: string }> = {
  starter:  { zvcCents: 1_000_000,  eurCents: 100,  label: 'Pack Débutant'  },
  standard: { zvcCents: 5_000_000,  eurCents: 500,  label: 'Pack Standard'  },
  premium:  { zvcCents: 20_000_000, eurCents: 2000, label: 'Pack Premium'   },
  vip:      { zvcCents: 50_000_000, eurCents: 5000, label: 'Pack VIP'       },
};

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for local dev
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// ============================================
// BASE DE DONNÉES
// ============================================

// Créer le dossier data s'il n'existe pas
import fs from 'fs';
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'));
}

const db = new Database(DB_PATH);

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

// Créer les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    balance INTEGER DEFAULT 1000000,
    elo INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_wagered INTEGER DEFAULT 0,
    total_won INTEGER DEFAULT 0,
    biggest_win INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_login_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rounds (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    wagered INTEGER NOT NULL,
    won INTEGER NOT NULL,
    net_profit INTEGER NOT NULL,
    is_win INTEGER NOT NULL,
    details TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_rounds_user ON rounds(user_id);
  CREATE INDEX IF NOT EXISTS idx_rounds_timestamp ON rounds(timestamp);
  CREATE INDEX IF NOT EXISTS idx_users_elo ON users(elo DESC);

  CREATE TABLE IF NOT EXISTS mines_rounds (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    mine_count INTEGER NOT NULL,
    wager INTEGER NOT NULL,
    mine_positions TEXT NOT NULL,
    revealed_safe TEXT NOT NULL DEFAULT '[]',
    last_revealed INTEGER,
    won_amount INTEGER,
    created_at INTEGER NOT NULL,
    ended_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_mines_user ON mines_rounds(user_id);
`);

console.log('Base de données initialisée:', DB_PATH);

// ============================================
// HELPERS
// ============================================

function getDbUser(id: string) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
}

function getUserByUsername(username: string) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase()) as any;
}

/** Converts a raw SQLite user row (snake_case) to camelCase for the API response */
function toCamelUser(row: any) {
  return {
    id: row.id,
    username: row.username,
    balance: row.balance,
    elo: row.elo,
    totalGames: row.total_games,
    totalWins: row.total_wins,
    totalLosses: row.total_losses,
    totalWagered: row.total_wagered,
    totalWon: row.total_won,
    biggestWin: row.biggest_win,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

// ============================================
// ROUTES
// ============================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * S'inscrire - crée un nouvel utilisateur
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
    }

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      return res.status(400).json({ error: 'Le pseudo doit faire entre 3 et 20 caractères' });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return res.status(400).json({ error: 'Pseudo invalide (lettres, chiffres, _ et - uniquement)' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 4 caractères' });
    }

    // Vérifier si le pseudo existe déjà
    const existing = getUserByUsername(trimmed);
    if (existing) {
      return res.status(409).json({ error: 'Ce pseudo est déjà utilisé' });
    }

    // Hash du mot de passe (SHA-256 simple pour MVP)
    const crypto = await import('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.createHash('sha256').update(password + salt).digest('hex');

    const now = Date.now();
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO users (id, username, password_hash, salt, balance, elo, created_at, updated_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, trimmed.toLowerCase(), passwordHash, salt, 1000000, 0, now, now, now);

    const user = getDbUser(id);

    res.status(201).json({ user: toCamelUser(user), token: id });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Se connecter
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
    }

    const user = getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Pseudo ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const crypto = await import('crypto');
    const expectedHash = crypto.createHash('sha256').update(password + user.salt).digest('hex');

    if (expectedHash !== user.password_hash) {
      return res.status(401).json({ error: 'Pseudo ou mot de passe incorrect' });
    }

    // Mettre à jour last_login_at
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(Date.now(), user.id);

    res.json({ user: toCamelUser(user), token: user.id });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Récupérer les données d'un utilisateur
 */
app.get('/api/users/:id', (req, res) => {
  try {
    const user = getDbUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer les rounds (200 derniers)
    const rounds = db.prepare(`
      SELECT * FROM rounds
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT 200
    `).all(req.params.id);

    res.json({ user: toCamelUser(user), rounds });
  } catch (error) {
    console.error('Erreur fetch user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Mettre à jour un utilisateur (balance, elo, stats)
 */
app.patch('/api/users/:id', (req, res) => {
  try {
    const user = getDbUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { balance, elo, totalGames, totalWins, totalLosses, totalWagered, totalWon, biggestWin } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (balance !== undefined) { updates.push('balance = ?'); values.push(balance); }
    if (elo !== undefined) { updates.push('elo = ?'); values.push(elo); }
    if (totalGames !== undefined) { updates.push('total_games = ?'); values.push(totalGames); }
    if (totalWins !== undefined) { updates.push('total_wins = ?'); values.push(totalWins); }
    if (totalLosses !== undefined) { updates.push('total_losses = ?'); values.push(totalLosses); }
    if (totalWagered !== undefined) { updates.push('total_wagered = ?'); values.push(totalWagered); }
    if (totalWon !== undefined) { updates.push('total_won = ?'); values.push(totalWon); }
    if (biggestWin !== undefined) { updates.push('biggest_win = ?'); values.push(biggestWin); }

    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(req.params.id);

    const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    const updated = getDbUser(req.params.id);
    res.json({ user: toCamelUser(updated) });
  } catch (error) {
    console.error('Erreur update user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Ajouter un round à l'historique
 */
app.post('/api/users/:id/rounds', (req, res) => {
  try {
    const user = getDbUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { round } = req.body;
    if (!round) {
      return res.status(400).json({ error: 'Round requis' });
    }

    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO rounds (id, user_id, game_id, timestamp, wagered, won, net_profit, is_win, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      req.params.id,
      round.gameId,
      round.timestamp,
      round.wagered,
      round.won,
      round.netProfit,
      round.isWin ? 1 : 0,
      JSON.stringify(round.details)
    );

    // Nettoyer les anciens rounds (garder 200 max)
    db.prepare(`
      DELETE FROM rounds
      WHERE user_id = ? AND id NOT IN (
        SELECT id FROM rounds
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT 200
      )
    `).run(req.params.id, req.params.id);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Erreur add round:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Effacer l'historique d'un utilisateur
 */
app.delete('/api/users/:id/rounds', (req, res) => {
  try {
    const user = getDbUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    db.prepare('DELETE FROM rounds WHERE user_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur clear rounds:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Leaderboard - top utilisateurs par ELO
 */
app.get('/api/leaderboard', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const players = db.prepare(`
      SELECT id, username, balance, elo, total_games, total_wins, total_losses, total_wagered, total_won, biggest_win
      FROM users
      ORDER BY balance DESC, total_won DESC
      LIMIT ?
    `).all(limit);

    res.json({ players });
  } catch (error) {
    console.error('Erreur leaderboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// MINES — helpers
// ============================================

const MINES_GRID = 25;
const MINES_HOUSE_EDGE = 0.01;

/** Entier crypto-sécurisé dans [0, max[ */
function minesRandInt(max: number): number {
  return randomBytes(4).readUInt32BE(0) % max;
}

/** Génère mineCount positions uniques sur 25 cases (Fisher-Yates crypto) */
function generateMinePositions(mineCount: number): number[] {
  const pool = Array.from({ length: MINES_GRID }, (_, i) => i);
  for (let i = MINES_GRID - 1; i > 0; i--) {
    const j = minesRandInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, mineCount);
}

/** Multiplicateur pour k cases sûres révélées avec m mines */
function minesMultiplier(mineCount: number, revealedSafe: number): number {
  if (revealedSafe === 0) return 1.0;
  const safe = MINES_GRID - mineCount;
  let prob = 1;
  for (let i = 0; i < revealedSafe; i++) {
    prob *= (safe - i) / (MINES_GRID - i);
  }
  if (prob <= 0) return 0;
  return Math.round((1 / prob) * (1 - MINES_HOUSE_EDGE) * 10_000) / 10_000;
}

/** Construit la vue publique d'une partie (sans positions de mines si active) */
function buildPublicRound(row: any) {
  const minePositions: number[] = JSON.parse(row.mine_positions);
  const revealedSafe: number[] = JSON.parse(row.revealed_safe);
  const isActive = row.status === 'active';

  const tiles = Array.from({ length: MINES_GRID }, (_, i) => {
    if (revealedSafe.includes(i)) return { index: i, state: 'safe' };
    if (!isActive && minePositions.includes(i)) {
      return { index: i, state: revealedSafe.includes(i) ? 'safe' : 'mine_safe' };
    }
    return { index: i, state: 'hidden' };
  });

  // Si explosé, marquer la case qui a tué comme 'mine'
  if (row.status === 'exploded' && row.last_revealed != null) {
    const idx = row.last_revealed as number;
    if (tiles[idx]) tiles[idx] = { index: idx, state: 'mine' };
  }

  const currentMultiplier = minesMultiplier(row.mine_count, revealedSafe.length);
  const nextMultiplier = minesMultiplier(row.mine_count, revealedSafe.length + 1);
  const potentialPayout = Math.floor(row.wager * currentMultiplier);

  const result: any = {
    id: row.id,
    status: row.status,
    mineCount: row.mine_count,
    wager: row.wager,
    tiles,
    revealedSafe: revealedSafe.length,
    currentMultiplier,
    nextMultiplier,
    potentialPayout,
  };

  if (!isActive) {
    result.minePositions = minePositions;
    result.wonAmount = row.won_amount ?? 0;
    result.netProfit = (row.won_amount ?? 0) - row.wager;
  }

  return result;
}

// ============================================
// MINES — routes
// ============================================

/**
 * POST /api/mines/start
 * Body: { userId, mineCount, wager }
 */
app.post('/api/mines/start', (req, res) => {
  try {
    const { userId, mineCount, wager } = req.body as {
      userId: string; mineCount: number; wager: number;
    };

    if (!userId || !mineCount || !wager) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    if (!Number.isInteger(mineCount) || mineCount < 1 || mineCount > 24) {
      return res.status(400).json({ error: 'mineCount doit être entre 1 et 24' });
    }
    if (!Number.isInteger(wager) || wager <= 0) {
      return res.status(400).json({ error: 'Mise invalide' });
    }

    const user = getDbUser(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    if (user.balance < wager) return res.status(400).json({ error: 'Solde insuffisant' });

    // Annuler toute partie active précédente (abandon)
    db.prepare(`UPDATE mines_rounds SET status = 'abandoned', ended_at = ? WHERE user_id = ? AND status = 'active'`)
      .run(Date.now(), userId);

    // Générer les mines
    const minePositions = generateMinePositions(mineCount);
    const id = uuidv4();
    const now = Date.now();

    db.prepare(`
      INSERT INTO mines_rounds (id, user_id, status, mine_count, wager, mine_positions, revealed_safe, created_at)
      VALUES (?, ?, 'active', ?, ?, ?, '[]', ?)
    `).run(id, userId, mineCount, wager, JSON.stringify(minePositions), now);

    // Déduire la mise
    db.prepare('UPDATE users SET balance = balance - ?, updated_at = ? WHERE id = ?')
      .run(wager, now, userId);

    const row = db.prepare('SELECT * FROM mines_rounds WHERE id = ?').get(id) as any;
    res.status(201).json({ round: buildPublicRound(row) });
  } catch (err) {
    console.error('mines/start error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/mines/reveal
 * Body: { roundId, userId, tileIndex }
 */
app.post('/api/mines/reveal', (req, res) => {
  try {
    const { roundId, userId, tileIndex } = req.body as {
      roundId: string; userId: string; tileIndex: number;
    };

    if (!roundId || !userId || tileIndex === undefined) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    if (!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= MINES_GRID) {
      return res.status(400).json({ error: 'Case invalide' });
    }

    const round = db.prepare('SELECT * FROM mines_rounds WHERE id = ?').get(roundId) as any;
    if (!round) return res.status(404).json({ error: 'Partie non trouvée' });
    if (round.user_id !== userId) return res.status(403).json({ error: 'Non autorisé' });
    if (round.status !== 'active') return res.status(400).json({ error: 'Partie terminée' });

    const minePositions: number[] = JSON.parse(round.mine_positions);
    const revealedSafe: number[] = JSON.parse(round.revealed_safe);

    if (revealedSafe.includes(tileIndex)) {
      return res.status(400).json({ error: 'Case déjà révélée' });
    }

    const now = Date.now();

    if (minePositions.includes(tileIndex)) {
      // MINE — fin de partie, pas de gain
      db.prepare(`
        UPDATE mines_rounds
        SET status = 'exploded', ended_at = ?, last_revealed = ?, won_amount = 0
        WHERE id = ?
      `).run(now, tileIndex, roundId);

      // Enregistrer le round dans l'historique
      const roundRecord = {
        id: `mines_${uuidv4()}`,
        gameId: 'mines',
        timestamp: now,
        wagered: round.wager,
        won: 0,
        netProfit: -round.wager,
        isWin: false,
        details: {
          mineCount: round.mine_count,
          revealedCount: revealedSafe.length,
          minePositions,
          multiplier: minesMultiplier(round.mine_count, revealedSafe.length),
          outcome: 'exploded',
        },
      };
      db.prepare(`
        INSERT INTO rounds (id, user_id, game_id, timestamp, wagered, won, net_profit, is_win, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(roundRecord.id, userId, 'mines', now, round.wager, 0, -round.wager, 0, JSON.stringify(roundRecord.details));

      // Mettre à jour stats
      db.prepare(`
        UPDATE users SET total_games = total_games + 1, total_losses = total_losses + 1,
        total_wagered = total_wagered + ?, updated_at = ? WHERE id = ?
      `).run(round.wager, now, userId);
    } else {
      // SAFE — ajouter à la liste
      revealedSafe.push(tileIndex);
      db.prepare(`UPDATE mines_rounds SET revealed_safe = ? WHERE id = ?`)
        .run(JSON.stringify(revealedSafe), roundId);
    }

    const updated = db.prepare('SELECT * FROM mines_rounds WHERE id = ?').get(roundId) as any;
    const user = getDbUser(userId);
    res.json({ round: buildPublicRound(updated), newBalance: user.balance });
  } catch (err) {
    console.error('mines/reveal error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/mines/cashout
 * Body: { roundId, userId }
 */
app.post('/api/mines/cashout', (req, res) => {
  try {
    const { roundId, userId } = req.body as { roundId: string; userId: string };

    if (!roundId || !userId) return res.status(400).json({ error: 'Paramètres manquants' });

    const round = db.prepare('SELECT * FROM mines_rounds WHERE id = ?').get(roundId) as any;
    if (!round) return res.status(404).json({ error: 'Partie non trouvée' });
    if (round.user_id !== userId) return res.status(403).json({ error: 'Non autorisé' });
    if (round.status !== 'active') return res.status(400).json({ error: 'Partie déjà terminée' });

    const revealedSafe: number[] = JSON.parse(round.revealed_safe);
    if (revealedSafe.length === 0) {
      return res.status(400).json({ error: 'Révélez au moins une case avant de retirer' });
    }

    const multiplier = minesMultiplier(round.mine_count, revealedSafe.length);
    const wonAmount = Math.floor(round.wager * multiplier);
    const now = Date.now();

    // Créditer le gain
    db.prepare('UPDATE users SET balance = balance + ?, updated_at = ? WHERE id = ?')
      .run(wonAmount, now, userId);

    // Clore la partie
    db.prepare(`
      UPDATE mines_rounds SET status = 'cashed_out', ended_at = ?, won_amount = ? WHERE id = ?
    `).run(now, wonAmount, roundId);

    // Enregistrer le round
    const minePositions: number[] = JSON.parse(round.mine_positions);
    const netProfit = wonAmount - round.wager;
    const roundRecord = {
      id: `mines_${uuidv4()}`,
      gameId: 'mines',
      timestamp: now,
      wagered: round.wager,
      won: wonAmount,
      netProfit,
      isWin: wonAmount > round.wager,
      details: {
        mineCount: round.mine_count,
        revealedCount: revealedSafe.length,
        minePositions,
        multiplier,
        outcome: 'cashout',
      },
    };
    db.prepare(`
      INSERT INTO rounds (id, user_id, game_id, timestamp, wagered, won, net_profit, is_win, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(roundRecord.id, userId, 'mines', now, round.wager, wonAmount, netProfit, wonAmount > round.wager ? 1 : 0, JSON.stringify(roundRecord.details));

    // Mettre à jour stats
    db.prepare(`
      UPDATE users SET
        total_games = total_games + 1,
        total_wins = total_wins + ?,
        total_wagered = total_wagered + ?,
        total_won = total_won + ?,
        biggest_win = MAX(biggest_win, ?),
        updated_at = ?
      WHERE id = ?
    `).run(wonAmount > round.wager ? 1 : 0, round.wager, wonAmount, netProfit > 0 ? netProfit : 0, now, userId);

    const updated = db.prepare('SELECT * FROM mines_rounds WHERE id = ?').get(roundId) as any;
    const user = getDbUser(userId);
    res.json({ round: buildPublicRound(updated), newBalance: user.balance });
  } catch (err) {
    console.error('mines/cashout error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/mines/:id
 */
app.get('/api/mines/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM mines_rounds WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ error: 'Partie non trouvée' });
    res.json({ round: buildPublicRound(row) });
  } catch (err) {
    console.error('mines/get error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// BOUTIQUE STRIPE
// ============================================

/**
 * Crée un PaymentIntent Stripe pour un pack donné.
 * Body: { packId: string, userId: string }
 * Returns: { clientSecret: string }
 */
app.post('/api/shop/create-payment-intent', async (req, res) => {
  try {
    const { packId, userId } = req.body as { packId: string; userId: string };

    const pack = SHOP_PACKS[packId];
    if (!pack) {
      return res.status(400).json({ error: 'Pack inconnu' });
    }

    const user = getDbUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pack.eurCents,
      currency: 'eur',
      metadata: { packId, userId, zvcCents: String(pack.zvcCents) },
      description: `ZVC Casino — ${pack.label}`,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Erreur create-payment-intent:', error);
    res.status(500).json({ error: 'Erreur serveur Stripe' });
  }
});

/**
 * Confirme un paiement réussi et crédite la balance du joueur.
 * Body: { paymentIntentId: string, userId: string }
 * Returns: { newBalance: number }
 */
app.post('/api/shop/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, userId } = req.body as { paymentIntentId: string; userId: string };

    // Vérifier avec Stripe que le paiement est bien réussi
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Paiement non confirmé' });
    }

    // Vérifier que le userId correspond à celui stocké dans les métadonnées
    if (intent.metadata.userId !== userId) {
      return res.status(403).json({ error: 'Utilisateur non autorisé' });
    }

    const zvcCents = parseInt(intent.metadata.zvcCents, 10);
    if (isNaN(zvcCents) || zvcCents <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    // Créditer la balance
    db.prepare('UPDATE users SET balance = balance + ?, updated_at = ? WHERE id = ?')
      .run(zvcCents, Date.now(), userId);

    const updated = getDbUser(userId);
    res.json({ newBalance: updated.balance });
  } catch (error) {
    console.error('Erreur confirm-payment:', error);
    res.status(500).json({ error: 'Erreur serveur Stripe' });
  }
});

/**
 * Effacer tout l'historique (pour tests)
 */
app.delete('/api/admin/clear-all', (req, res) => {
  try {
    db.prepare('DELETE FROM rounds').run();
    db.prepare('DELETE FROM users').run();
    res.json({ success: true, message: 'Toutes les données ont été effacées' });
  } catch (error) {
    console.error('Erreur clear all:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// DÉMARRAGE
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════╗
║     ZéroVirguleChance - Serveur Backend        ║
╠════════════════════════════════════════════════╣
║  Port: ${PORT}
║  URL:  http://localhost:${PORT}
║  DB:   ${DB_PATH}
╚════════════════════════════════════════════════╝
  `);
});
