/**
 * Serveur backend ZéroVirguleChance
 * Base de données SQLite centralisée pour synchroniser les utilisateurs
 */

import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, '../data/zvc.db');

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
      ORDER BY elo DESC, total_won DESC
      LIMIT ?
    `).all(limit);

    res.json({ players });
  } catch (error) {
    console.error('Erreur leaderboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
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
