'use strict';
/**
 * NovaSpark Multi-Hosting Panel — Main Server
 * Express API + serves the dashboard UI
 */

const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const url     = require('url');
const db      = require('./db');
const manager = require('./manager');

const PORT    = process.env.PORT || 3000;
const PUBLIC  = path.join(__dirname, 'public');

// ── Cookie helpers ───────────────────────────────────────────────────────────
function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const match  = header.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function setCookie(res, name, value, maxAgeSec = 604800) {
  res.setHeader('Set-Cookie', `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Max-Age=${maxAgeSec}; SameSite=Strict`);
}

function clearCookie(res, name) {
  res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`);
}

// ── Auth middleware ───────────────────────────────────────────────────────────
function authUser(req) {
  const token = getCookie(req, 'ns_token');
  if (!token) return null;
  return db.getSession(token);
}

// ── JSON response helpers ─────────────────────────────────────────────────────
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function body(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

// ── Serve static files ────────────────────────────────────────────────────────
function serveStatic(res, filePath) {
  try {
    const ext  = path.extname(filePath);
    const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon' };
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsed  = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method   = req.method;

  // ── Static assets ──────────────────────────────────────────────────────────
  if (method === 'GET' && !pathname.startsWith('/api/')) {
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    return serveStatic(res, path.join(PUBLIC, file));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  AUTH
  // ═══════════════════════════════════════════════════════════════════════════

  // POST /api/auth/register
  if (method === 'POST' && pathname === '/api/auth/register') {
    const { email, password } = await body(req);
    if (!email || !password || password.length < 6) return json(res, 400, { error: 'Email and password (min 6 chars) required' });
    const user = db.createUser(email.toLowerCase().trim(), password);
    if (!user) return json(res, 409, { error: 'Email already registered' });
    const token = db.createSession(user.id);
    setCookie(res, 'ns_token', token);
    return json(res, 200, { ok: true, user: { id: user.id, email: user.email, plan: user.plan } });
  }

  // POST /api/auth/login
  if (method === 'POST' && pathname === '/api/auth/login') {
    const { email, password } = await body(req);
    const user = db.verifyUser(email?.toLowerCase().trim(), password);
    if (!user) return json(res, 401, { error: 'Invalid email or password' });
    const token = db.createSession(user.id);
    setCookie(res, 'ns_token', token);
    return json(res, 200, { ok: true, user: { id: user.id, email: user.email, plan: user.plan } });
  }

  // POST /api/auth/logout
  if (method === 'POST' && pathname === '/api/auth/logout') {
    const token = getCookie(req, 'ns_token');
    if (token) db.deleteSession(token);
    clearCookie(res, 'ns_token');
    return json(res, 200, { ok: true });
  }

  // GET /api/auth/me
  if (method === 'GET' && pathname === '/api/auth/me') {
    const user = authUser(req);
    if (!user) return json(res, 401, { error: 'Not authenticated' });
    return json(res, 200, { user: { id: user.id, email: user.email, plan: user.plan } });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  BOTS (auth required)
  // ═══════════════════════════════════════════════════════════════════════════

  const user = authUser(req);
  if (pathname.startsWith('/api/bots') && !user) return json(res, 401, { error: 'Not authenticated' });

  // GET /api/bots — list user's bots
  if (method === 'GET' && pathname === '/api/bots') {
    const bots = db.getUserBots(user.id).map(b => ({
      id: b.id, botName: b.botName, ownerNumber: b.ownerNumber,
      prefix: b.prefix, status: b.status, pairCode: b.pairCode,
      lastSeen: b.lastSeen, error: b.error, createdAt: b.createdAt,
      running: manager.isRunning(b.id),
    }));
    return json(res, 200, { bots });
  }

  // POST /api/bots — create new bot
  if (method === 'POST' && pathname === '/api/bots') {
    const { botName, ownerNumber, prefix } = await body(req);
    if (!ownerNumber) return json(res, 400, { error: 'ownerNumber is required' });
    const result = db.createBot(user.id, { botName, ownerNumber, prefix });
    if (result.error) return json(res, 403, { error: result.error });
    return json(res, 200, { bot: result });
  }

  // Match /api/bots/:id/*
  const botMatch = pathname.match(/^\/api\/bots\/([a-f0-9]+)(\/(.+))?$/);
  if (botMatch) {
    const botId  = botMatch[1];
    const action = botMatch[3] || '';
    const bot    = db.getBot(botId);

    if (!bot) return json(res, 404, { error: 'Bot not found' });
    if (bot.userId !== user.id) return json(res, 403, { error: 'Forbidden' });

    // GET /api/bots/:id — get bot status
    if (method === 'GET' && !action) {
      return json(res, 200, { bot: { ...bot, running: manager.isRunning(botId) } });
    }

    // POST /api/bots/:id/start
    if (method === 'POST' && action === 'start') {
      const result = manager.startBot(botId);
      return json(res, result.error ? 400 : 200, result);
    }

    // POST /api/bots/:id/stop
    if (method === 'POST' && action === 'stop') {
      const result = manager.stopBot(botId);
      return json(res, result.error ? 400 : 200, result);
    }

    // POST /api/bots/:id/restart
    if (method === 'POST' && action === 'restart') {
      const result = manager.restartBot(botId);
      return json(res, 200, result);
    }

    // DELETE /api/bots/:id
    if (method === 'DELETE' && !action) {
      manager.deleteBot(botId);
      return json(res, 200, { ok: true });
    }

    // PATCH /api/bots/:id — update bot settings
    if (method === 'PATCH' && !action) {
      const fields = await body(req);
      const allowed = ['botName', 'ownerNumber', 'prefix'];
      const update  = {};
      for (const k of allowed) if (fields[k] !== undefined) update[k] = fields[k];
      db.updateBot(botId, update);
      return json(res, 200, { ok: true });
    }
  }

  // GET /api/stats — global stats (public)
  if (method === 'GET' && pathname === '/api/stats') {
    return json(res, 200, db.getStats());
  }

  // GET /api/health
  if (method === 'GET' && pathname === '/api/health') {
    return json(res, 200, { ok: true, uptime: process.uptime(), bots: manager.runningCount() });
  }

  // GET /api/server-info — capacity info for this Render instance
  if (method === 'GET' && pathname === '/api/server-info') {
    return json(res, 200, {
      serverId:    manager.serverId(),
      maxBots:     manager.maxBots(),
      runningBots: manager.runningCount(),
      available:   manager.maxBots() - manager.runningCount(),
      totalBots:   db.getAllBots().length,
    });
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════╗
  ⚡  N O V A S P A R K   H O S T I N G
╚══════════════════════════════════════════════╝

   🌐  Panel: http://localhost:${PORT}
   🤖  Managing up to 80 bots on this server
   ✅  Panel is LIVE — ready for deployments!
`);
  // Auto-restore bots that were online before restart
  manager.autoRestoreOnlineBots();
});

module.exports = server;
