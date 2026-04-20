/**
 * ⚡ NovaSpark Bot — Admin Panel Server
 * Express.js web server with session-based authentication
 * Username: novaspark | Password: ntando
 */

'use strict';

const express      = require('express');
const session      = require('express-session');
const path         = require('path');
const fs           = require('fs');
const os           = require('os');

const app  = express();
const PORT = process.env.ADMIN_PORT || process.env.PORT || 3000;

// ── Credentials (override via env vars for security) ──────────────────────────
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'novaspark';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ntando';
const SESSION_SECRET = process.env.SESSION_SECRET || 'novaspark-secret-2026';

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 6 * 60 * 60 * 1000 }, // 6h
}));

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.redirect('/login');
}

// ── Routes ─────────────────────────────────────────────────────────────────────

// Login page
app.get('/login', (req, res) => {
  if (req.session && req.session.authenticated) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    req.session.user = username;
    return res.redirect('/');
  }
  res.redirect('/login?error=1');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Root → dashboard
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── API endpoints ──────────────────────────────────────────────────────────────

// System stats
app.get('/api/stats', requireAuth, (req, res) => {
  const uptime      = process.uptime();
  const memUsed     = process.memoryUsage();
  const totalMem    = os.totalmem();
  const freeMem     = os.freemem();
  const cpuLoad     = os.loadavg();

  // Try reading database counts
  let premiumCount = 0;
  let warnCount    = 0;
  const dbPath     = path.join(__dirname, '..', 'database.json');
  if (fs.existsSync(dbPath)) {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      premiumCount = db.premium ? Object.keys(db.premium).length : 0;
      warnCount    = db.warnings ? Object.keys(db.warnings).length : 0;
    } catch (_) {}
  }

  res.json({
    uptime:       Math.floor(uptime),
    memory: {
      used:       Math.round((memUsed.heapUsed / 1024 / 1024) * 100) / 100,
      rss:        Math.round((memUsed.rss      / 1024 / 1024) * 100) / 100,
      total:      Math.round((totalMem         / 1024 / 1024) * 100) / 100,
      free:       Math.round((freeMem          / 1024 / 1024) * 100) / 100,
    },
    cpu:          cpuLoad[0].toFixed(2),
    platform:     os.platform(),
    nodeVersion:  process.version,
    premiumUsers: premiumCount,
    warnedUsers:  warnCount,
    botName:      process.env.BOT_NAME  || 'NovaSpark Bot',
    botVersion:   '3.0.0',
    owner:        'Dev-Ntando',
  });
});

// Config viewer (env vars, no secrets)
app.get('/api/config', requireAuth, (req, res) => {
  const cfgPath = path.join(__dirname, '..', 'config.js');
  let cfg = {};
  try {
    cfg = require(cfgPath);
  } catch (_) {}
  res.json({
    botName:     cfg.botName    || 'NovaSpark Bot',
    prefix:      cfg.prefix     || '.',
    timezone:    cfg.timezone   || 'Africa/Harare',
    ownerName:   cfg.ownerName  || [],
    sessionSet:  !!(cfg.sessionID || process.env.SESSION_ID),
    openaiSet:   !!(process.env.OPENAI_API_KEY),
    deepaiSet:   !!(process.env.DEEPAI_API_KEY),
  });
});

// Premium users list
app.get('/api/premium', requireAuth, (req, res) => {
  const dbPath = path.join(__dirname, '..', 'database.json');
  if (!fs.existsSync(dbPath)) return res.json({ users: [] });
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const users = db.premium ? Object.entries(db.premium).map(([jid, data]) => ({
      jid, ...data,
    })) : [];
    res.json({ users });
  } catch (e) {
    res.json({ users: [], error: e.message });
  }
});

// Warnings list
app.get('/api/warnings', requireAuth, (req, res) => {
  const dbPath = path.join(__dirname, '..', 'database.json');
  if (!fs.existsSync(dbPath)) return res.json({ warnings: [] });
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const warnings = db.warnings ? Object.entries(db.warnings).map(([jid, data]) => ({
      jid, ...data,
    })) : [];
    res.json({ warnings });
  } catch (e) {
    res.json({ warnings: [], error: e.message });
  }
});

// Bot logs (last 100 lines of stdout log if it exists)
app.get('/api/logs', requireAuth, (req, res) => {
  const logFile = path.join(__dirname, '..', 'bot.log');
  if (!fs.existsSync(logFile)) return res.json({ lines: [] });
  try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines   = content.split('\n').filter(Boolean).slice(-100);
    res.json({ lines });
  } catch (e) {
    res.json({ lines: [], error: e.message });
  }
});

// Health check (public — used by Render)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', bot: 'NovaSpark Bot', version: '3.0.0' });
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌐  Admin Panel running → http://localhost:${PORT}`);
  console.log(`🔐  Login: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}\n`);
});

module.exports = app;
