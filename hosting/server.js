'use strict';
/**
 * NovaSpark Multi-Hosting Panel — Main Server
 * Express API + serves the dashboard UI
 * Admin credentials set via ADMIN_USER / ADMIN_PASS env vars (default: ntando/ntando)
 */

const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const url     = require('url');
const crypto  = require('crypto');
const db      = require('./db');
const manager = require('./manager');

const PORT       = process.env.PORT || 3000;
const PUBLIC     = path.join(__dirname, 'public');
const ADMIN_USER = process.env.ADMIN_USER || 'ntando';
const ADMIN_PASS = process.env.ADMIN_PASS || 'ntando';

// Admin sessions (in-memory, intentionally — admin sessions reset on restart)
const _adminSessions = new Map();

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

function authAdmin(req) {
  const token = getCookie(req, 'ns_admin');
  if (!token) return false;
  return _adminSessions.has(token);
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
  if (method === 'GET' && !pathname.startsWith('/api/') && !pathname.startsWith('/admin')) {
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    return serveStatic(res, path.join(PUBLIC, file));
  }

  // Serve admin page
  if (method === 'GET' && (pathname === '/admin' || pathname === '/admin/')) {
    return serveStatic(res, path.join(PUBLIC, 'admin.html'));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ADMIN AUTH
  // ═══════════════════════════════════════════════════════════════════════════

  // POST /api/admin/login
  if (method === 'POST' && pathname === '/api/admin/login') {
    const { username, password } = await body(req);
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = crypto.randomBytes(32).toString('hex');
      _adminSessions.set(token, { createdAt: Date.now() });
      setCookie(res, 'ns_admin', token, 86400); // 24h
      return json(res, 200, { ok: true });
    }
    return json(res, 401, { error: 'Invalid credentials' });
  }

  // POST /api/admin/logout
  if (method === 'POST' && pathname === '/api/admin/logout') {
    const token = getCookie(req, 'ns_admin');
    if (token) _adminSessions.delete(token);
    clearCookie(res, 'ns_admin');
    return json(res, 200, { ok: true });
  }

  // GET /api/admin/me
  if (method === 'GET' && pathname === '/api/admin/me') {
    if (!authAdmin(req)) return json(res, 401, { error: 'Not authenticated' });
    return json(res, 200, { ok: true, username: ADMIN_USER });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ADMIN ROUTES (require admin auth)
  // ═══════════════════════════════════════════════════════════════════════════

  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login' && pathname !== '/api/admin/logout' && pathname !== '/api/admin/me') {
    if (!authAdmin(req)) return json(res, 401, { error: 'Admin auth required' });

    // GET /api/admin/stats
    if (method === 'GET' && pathname === '/api/admin/stats') {
      const stats = db.getStats();
      return json(res, 200, { ...stats, runningBots: manager.runningCount(), maxBots: manager.maxBots(), serverId: manager.serverId() });
    }

    // GET /api/admin/users — all users
    if (method === 'GET' && pathname === '/api/admin/users') {
      const users = db.getAllUsers().map(u => ({
        id: u.id, email: u.email, plan: u.plan, banned: u.banned,
        botLimit: u.botLimit || 3, createdAt: u.createdAt,
        botCount: db.getUserBots(u.id).length,
      }));
      return json(res, 200, { users });
    }

    // PATCH /api/admin/users/:id — update user (ban, botLimit, plan)
    const userPatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (method === 'PATCH' && userPatch) {
      const userId = userPatch[1];
      const fields = await body(req);
      const allowed = ['banned', 'botLimit', 'plan'];
      const update = {};
      for (const k of allowed) if (fields[k] !== undefined) update[k] = fields[k];
      const updated = db.updateUser(userId, update);
      if (!updated) return json(res, 404, { error: 'User not found' });
      return json(res, 200, { ok: true, user: updated });
    }

    // DELETE /api/admin/users/:id
    const userDel = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (method === 'DELETE' && userDel) {
      db.deleteUser(userDel[1]);
      return json(res, 200, { ok: true });
    }

    // GET /api/admin/bots — all bots across all users
    if (method === 'GET' && pathname === '/api/admin/bots') {
      const bots = db.getAllBots().map(b => ({
        ...b, running: manager.isRunning(b.id),
      }));
      return json(res, 200, { bots });
    }

    // POST /api/admin/bots/:id/start|stop|restart
    const adminBotAction = pathname.match(/^\/api\/admin\/bots\/([^/]+)\/(start|stop|restart)$/);
    if (method === 'POST' && adminBotAction) {
      const [, botId, action] = adminBotAction;
      const result = action === 'start' ? manager.startBot(botId)
                   : action === 'stop'  ? manager.stopBot(botId)
                   : manager.restartBot(botId);
      return json(res, result.error ? 400 : 200, result);
    }

    // DELETE /api/admin/bots/:id
    const adminBotDel = pathname.match(/^\/api\/admin\/bots\/([^/]+)$/);
    if (method === 'DELETE' && adminBotDel) {
      manager.deleteBot(adminBotDel[1]);
      return json(res, 200, { ok: true });
    }

    // ── Server Registry ─────────────────────────────────────────────────────

    // GET /api/admin/servers
    if (method === 'GET' && pathname === '/api/admin/servers') {
      return json(res, 200, { servers: db.getAllServers() });
    }

    // POST /api/admin/servers — add a server
    if (method === 'POST' && pathname === '/api/admin/servers') {
      const { name, url: sUrl, maxBots, serverId, notes } = await body(req);
      if (!sUrl) return json(res, 400, { error: 'url is required' });
      const server = db.addServer({ name, url: sUrl, maxBots, serverId, notes });
      return json(res, 200, { ok: true, server });
    }

    // PATCH /api/admin/servers/:id
    const serverPatch = pathname.match(/^\/api\/admin\/servers\/([^/]+)$/);
    if (method === 'PATCH' && serverPatch) {
      const fields = await body(req);
      const updated = db.updateServer(serverPatch[1], fields);
      if (!updated) return json(res, 404, { error: 'Server not found' });
      return json(res, 200, { ok: true, server: updated });
    }

    // DELETE /api/admin/servers/:id
    const serverDel = pathname.match(/^\/api\/admin\/servers\/([^/]+)$/);
    if (method === 'DELETE' && serverDel) {
      db.deleteServer(serverDel[1]);
      return json(res, 200, { ok: true });
    }
  }

  // GET /api/servers — public server list for users
  if (method === 'GET' && pathname === '/api/servers') {
    const servers = db.getAllServers().filter(s => s.active);
    return json(res, 200, { servers });
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
    // Check user's bot limit
    const userBots = db.getUserBots(user.id);
    const botLimit = user.botLimit || 3;
    if (userBots.length >= botLimit) return json(res, 403, { error: `Bot limit reached (${botLimit}). Contact admin to increase your limit.` });
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

  // GET /api/health  (also /health for Render healthCheckPath compatibility)
  if (method === 'GET' && (pathname === '/api/health' || pathname === '/health')) {
    return json(res, 200, { ok: true, uptime: Math.floor(process.uptime()), bots: manager.runningCount() });
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
