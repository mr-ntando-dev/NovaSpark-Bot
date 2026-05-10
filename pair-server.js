/**
 * ⚡ NovaSpark Bot v11 — Web Pairing Server
 * Pair your WhatsApp via browser (no QR scan needed)
 * Just enter your phone number and approve the 6-digit code in WhatsApp
 *
 * USAGE:  node pair-server.js
 *         Then open  http://localhost:3001  in your browser.
 *
 * Works 100% FREE — no API keys, no subscriptions.
 * Powered by Baileys pairing-code flow.
 *
 * By Dev-Ntando | NovaSpark Bot v11.0.0
 */
'use strict';

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const pino  = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const PORT       = process.env.PAIR_PORT || 3001;
const SESSION_DIR = path.join(__dirname, 'pair_session');

// ── Keep a reference to the active socket so we can reuse it ─────────────────
let _sock       = null;
let _sessionStr = null;  // the generated SESSION_ID string
let _pairState  = 'idle'; // idle | waiting | done | error
let _pairCode   = null;
let _pairError  = null;

// ── HTML UI ───────────────────────────────────────────────────────────────────
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>NovaSpark Bot — Pair</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0a0a0f;color:#e0e0e0;font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
  h1{font-size:2rem;background:linear-gradient(135deg,#a855f7,#6366f1,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px;text-align:center}
  p.sub{color:#888;font-size:.9rem;margin-bottom:24px;text-align:center}
  .card{background:#12121a;border:1px solid #2a2a3a;border-radius:16px;padding:32px;max-width:480px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,.6)}
  label{font-size:.85rem;color:#aaa;margin-bottom:6px;display:block}
  input{width:100%;padding:12px 16px;background:#1e1e2e;border:1px solid #3a3a5a;border-radius:10px;color:#fff;font-size:1rem;outline:none;transition:border .2s}
  input:focus{border-color:#6366f1}
  button{margin-top:14px;width:100%;padding:13px;background:linear-gradient(135deg,#6366f1,#a855f7);border:none;border-radius:10px;color:#fff;font-size:1rem;font-weight:600;cursor:pointer;transition:opacity .2s}
  button:hover{opacity:.85}
  button:disabled{opacity:.4;cursor:not-allowed}
  .code-box{margin-top:20px;background:#0d1117;border:2px solid #6366f1;border-radius:12px;padding:20px;text-align:center}
  .code{font-size:2.6rem;font-weight:700;letter-spacing:8px;background:linear-gradient(135deg,#a855f7,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-family:monospace}
  .code-hint{font-size:.8rem;color:#888;margin-top:8px}
  .session-box{margin-top:20px;background:#0d1117;border:2px solid #22d3ee;border-radius:12px;padding:16px}
  .session-box h3{color:#22d3ee;font-size:.9rem;margin-bottom:8px}
  textarea{width:100%;padding:10px;background:#111;border:1px solid #2a2a3a;border-radius:8px;color:#22d3ee;font-family:monospace;font-size:.7rem;resize:vertical;min-height:80px}
  .copy-btn{margin-top:8px;padding:8px 16px;background:#22d3ee;border:none;border-radius:8px;color:#000;font-weight:700;cursor:pointer;font-size:.8rem}
  .error{margin-top:16px;padding:12px 16px;background:#2a1010;border:1px solid #f87171;border-radius:8px;color:#f87171;font-size:.85rem}
  .status{margin-top:16px;padding:10px 14px;background:#0f1f1a;border:1px solid #34d399;border-radius:8px;color:#34d399;font-size:.85rem}
  .spinner{display:inline-block;width:18px;height:18px;border:3px solid #6366f140;border-top:3px solid #a855f7;border-radius:50%;animation:spin .8s linear infinite;vertical-align:middle;margin-right:8px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .steps{margin-bottom:24px;counter-reset:step}
  .step{display:flex;gap:10px;margin-bottom:10px;font-size:.85rem;color:#aaa}
  .step-num{width:22px;height:22px;background:#6366f1;border-radius:50%;color:#fff;font-weight:700;font-size:.75rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
  .trial-banner{background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #a855f740;border-radius:10px;padding:12px 16px;font-size:.82rem;color:#d8b4fe;margin-bottom:18px;text-align:center;line-height:1.5}
</style>
</head>
<body>
<h1>⚡ NovaSpark Bot</h1>
<p class="sub">Web Pairing Panel v11 — Link WhatsApp without scanning a QR code</p>
<div class="card">
  <div class="trial-banner">
    🎁 <strong>7-Day Free Trial</strong> — After pairing, the bot is fully functional for <strong>7 days</strong> at no cost. Contact the owner to extend.
  </div>
  <div class="steps">
    <div class="step"><span class="step-num">1</span><span>Enter your WhatsApp number below (with country code, no + or spaces)</span></div>
    <div class="step"><span class="step-num">2</span><span>Click <strong>Generate Code</strong> and wait a few seconds</span></div>
    <div class="step"><span class="step-num">3</span><span>On your phone: <em>WhatsApp &rarr; Linked Devices &rarr; Link a device &rarr; Link with phone number</em></span></div>
    <div class="step"><span class="step-num">4</span><span>Enter the 8-digit code shown here — bot is now paired!</span></div>
    <div class="step"><span class="step-num">5</span><span>Bot will <strong>auto-start automatically</strong> after pairing! Also copy the SESSION_ID below as a backup for your Render env vars.</span></div>
  </div>
  <label for="phone">WhatsApp Number</label>
  <input id="phone" type="tel" placeholder="e.g. 263786831091" autocomplete="off"/>
  <button id="pairBtn" onclick="requestPair()">⚡ Generate Pairing Code</button>
  <div id="output"></div>
</div>
<script>
async function requestPair(){
  const phone = document.getElementById('phone').value.replace(/\\D/g,'').trim();
  if(!phone||phone.length<7){alert('Enter a valid phone number.');return;}
  document.getElementById('pairBtn').disabled=true;
  document.getElementById('output').innerHTML='<div class="status"><span class="spinner"></span>Connecting to WhatsApp...</div>';
  try{
    const r=await fetch('/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});
    const d=await r.json();
    if(d.code){
      document.getElementById('output').innerHTML=\`
        <div class="code-box">
          <div class="code">\${d.code}</div>
          <div class="code-hint">Enter this code in WhatsApp &rarr; Linked Devices &rarr; Link with phone number</div>
        </div>
        <div class="status"><span class="spinner"></span>Waiting for you to approve on your phone...</div>
      \`;
      pollSession();
    }else{
      document.getElementById('output').innerHTML='<div class="error">❌ '+escHtml(d.error||'Unknown error')+'</div>';
      document.getElementById('pairBtn').disabled=false;
    }
  }catch(e){
    document.getElementById('output').innerHTML='<div class="error">❌ Server error: '+escHtml(e.message)+'</div>';
    document.getElementById('pairBtn').disabled=false;
  }
}
async function pollSession(){
  for(let i=0;i<60;i++){
    await sleep(3000);
    try{
      const r=await fetch('/session');
      const d=await r.json();
      if(d.status==='done'&&d.sessionID){
        document.getElementById('output').innerHTML+=\`
          <div class="session-box">
            <h3>✅ Paired! Copy your SESSION_ID below:</h3>
            <textarea id="sid" readonly>\${escHtml(d.sessionID)}</textarea>
            <button class="copy-btn" onclick="copySID()">📋 Copy SESSION_ID</button>
            <p style="color:#888;font-size:.75rem;margin-top:8px">Paste this as the SESSION_ID env variable when deploying your bot.</p>
          </div>
        \`;
        // Remove spinner
        const s=document.querySelector('.status');if(s)s.remove();
        return;
      }
      if(d.status==='error'){
        document.getElementById('output').innerHTML+='<div class="error">❌ '+escHtml(d.error||'Pairing failed')+'</div>';
        document.getElementById('pairBtn').disabled=false;
        return;
      }
    }catch{}
  }
  document.getElementById('output').innerHTML+='<div class="error">⏰ Timeout — the code expired. Refresh and try again.</div>';
  document.getElementById('pairBtn').disabled=false;
}
function copySID(){const t=document.getElementById('sid');t.select();document.execCommand('copy');alert('SESSION_ID copied!');}
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
</script>
</body>
</html>`;

// ── Encode session to NovaSpark!... string (same format as pairing site) ──────
function encodeSession(creds, sessionDir) {
  try {
    const files = {};
    const entries = fs.readdirSync(sessionDir);
    for (const entry of entries) {
      const fp = path.join(sessionDir, entry);
      try {
        const stat = fs.statSync(fp);
        if (stat.isFile()) {
          files[entry] = fs.readFileSync(fp, 'utf-8');
        }
      } catch {}
    }
    const json    = JSON.stringify(files);
    const encoded = Buffer.from(json).toString('base64');
    return 'NovaSpark!' + encoded;
  } catch (e) {
    console.error('[SESSION ENCODE]', e.message);
    return null;
  }
}

// ── Start a Baileys socket just for pairing ───────────────────────────────────
async function initPairSocket() {
  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  _sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['NovaSpark-Pair', 'Chrome', '120.0.0'],
    syncFullHistory: false,
    connectTimeoutMs: 60000,
  });

  _sock.ev.on('creds.update', async () => {
    await saveCreds();
    // Once authenticated, build the session string
    if (_pairState !== 'done') {
      const sid = encodeSession(null, SESSION_DIR);
      if (sid) {
        _sessionStr = sid;
        _pairState  = 'done';
        console.log('[PAIR] ✅ Session encoded. Ready for download.');
      }
    }
  });

  _sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log('[PAIR] ✅ WhatsApp connected!');
      const sid = encodeSession(null, SESSION_DIR);
      if (sid) {
        _sessionStr = sid;
        _pairState  = 'done';

        // ── Auto-restart: copy session files to the main bot session dir
        //    then restart the process so the bot starts with the new session.
        try {
          const mainSessionDir = path.join(__dirname, 'session');
          if (!fs.existsSync(mainSessionDir)) fs.mkdirSync(mainSessionDir, { recursive: true });
          const entries = fs.readdirSync(SESSION_DIR);
          for (const entry of entries) {
            const src = path.join(SESSION_DIR, entry);
            const dst = path.join(mainSessionDir, entry);
            if (fs.statSync(src).isFile()) {
              fs.copyFileSync(src, dst);
            }
          }
          console.log('[PAIR] ✅ Session copied to main session folder.');
          console.log('[PAIR] 🔄 Restarting bot in 3 seconds...');
          setTimeout(() => {
            console.log('[PAIR] 🚀 Launching bot now!');
            require('./index.js');
          }, 3000);
        } catch (e) {
          console.error('[PAIR] ⚠️  Auto-restart failed:', e.message);
          console.log('[PAIR] Copy the SESSION_ID manually to your Render env vars.');
        }
      }
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        _pairState = 'idle';
        _sock      = null;
      }
    }
  });

  return _sock;
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const { method, url: reqUrl } = req;

  // ── GET /  ─────────────────────────────────────────────────────────────────
  if (method === 'GET' && (reqUrl === '/' || reqUrl === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  // ── GET /session  ──────────────────────────────────────────────────────────
  if (method === 'GET' && reqUrl === '/session') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (_pairState === 'done' && _sessionStr) {
      res.end(JSON.stringify({ status: 'done', sessionID: _sessionStr }));
    } else if (_pairState === 'error') {
      res.end(JSON.stringify({ status: 'error', error: _pairError || 'Pairing failed' }));
    } else {
      res.end(JSON.stringify({ status: _pairState }));
    }
    return;
  }

  // ── GET /health ────────────────────────────────────────────────────────────
  if (method === 'GET' && reqUrl === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: '11.0.0' }));
    return;
  }

  // ── POST /pair  ────────────────────────────────────────────────────────────
  if (method === 'POST' && reqUrl === '/pair') {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', async () => {
      try {
        const { phone } = JSON.parse(body || '{}');
        const cleaned   = String(phone || '').replace(/\D/g, '').trim();
        if (!cleaned || cleaned.length < 7) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid phone number' }));
          return;
        }

        // Reset state
        _pairState  = 'waiting';
        _pairCode   = null;
        _pairError  = null;
        _sessionStr = null;

        // Destroy old socket
        if (_sock) {
          try { _sock.end(); } catch {}
          _sock = null;
        }

        // Wipe old session
        if (fs.existsSync(SESSION_DIR)) {
          fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(SESSION_DIR, { recursive: true });

        const sock = await initPairSocket();

        // Wait a moment for socket to stabilize then request code
        await new Promise(r => setTimeout(r, 2000));

        try {
          _pairCode = await sock.requestPairingCode(cleaned);
          console.log(`[PAIR] Code for ${cleaned}: ${_pairCode}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: _pairCode }));
        } catch (e) {
          _pairState = 'error';
          _pairError = e.message;
          console.error('[PAIR ERROR]', e.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message || 'Failed to request pairing code' }));
        }
      } catch (parseErr) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request body' }));
      }
    });
    return;
  }

  // ── 404 ────────────────────────────────────────────────────────────────────
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════╗
  ⚡  N O V A S P A R K   P A I R I N G
╚══════════════════════════════════════════════╝

   🌐  Open in browser: http://localhost:${PORT}
   📱  Or on your network: http://<YOUR_IP>:${PORT}

   ✅  Web pairing panel is LIVE
   ℹ️   Enter your WhatsApp number to get a pairing code
   ℹ️   No QR scan needed — 100% FREE!
`);
});

module.exports = server;
