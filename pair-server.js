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
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const { spawn } = require('child_process');
const pino  = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const PORT       = process.env.PORT || process.env.PAIR_PORT || 3001;
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
<title>NovaSpark Bot — Connect WhatsApp</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#06060e;
  --surface:#0f0f1c;
  --card:#13131f;
  --border:#1e1e32;
  --border-light:#2a2a42;
  --primary:#7c5cfc;
  --primary-glow:rgba(124,92,252,0.25);
  --accent:#00e5c0;
  --accent-glow:rgba(0,229,192,0.2);
  --red:#ff4f6a;
  --green:#00e5a0;
  --text:#eeeef5;
  --muted:#7070a0;
  --radius:20px;
}

html{scroll-behavior:smooth}

body{
  background:var(--bg);
  color:var(--text);
  font-family:'DM Sans',system-ui,sans-serif;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:40px 20px 80px;
  position:relative;
  overflow-x:hidden;
}

/* Background blobs */
body::before,body::after{
  content:'';position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0;
}
body::before{
  width:500px;height:500px;
  background:radial-gradient(circle,rgba(124,92,252,0.12),transparent 70%);
  top:-100px;left:-100px;
}
body::after{
  width:400px;height:400px;
  background:radial-gradient(circle,rgba(0,229,192,0.08),transparent 70%);
  bottom:-80px;right:-80px;
}

.page{position:relative;z-index:1;width:100%;max-width:560px}

/* ── Header ── */
.header{text-align:center;margin-bottom:40px}
.logo-icon{
  width:64px;height:64px;
  background:linear-gradient(135deg,var(--primary),var(--accent));
  border-radius:18px;
  display:inline-flex;align-items:center;justify-content:center;
  font-size:28px;
  margin-bottom:18px;
  box-shadow:0 0 40px var(--primary-glow);
}
.header h1{
  font-family:'Syne',sans-serif;
  font-size:2.2rem;font-weight:800;
  background:linear-gradient(135deg,#fff 30%,var(--primary) 70%,var(--accent));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  line-height:1.1;margin-bottom:10px;
}
.header p{
  color:var(--muted);font-size:.95rem;line-height:1.5;
}

/* ── Trial banner ── */
.trial{
  background:linear-gradient(135deg,rgba(124,92,252,0.12),rgba(0,229,192,0.08));
  border:1px solid rgba(124,92,252,0.3);
  border-radius:14px;
  padding:14px 20px;
  text-align:center;
  font-size:.88rem;
  color:#c4b5fd;
  margin-bottom:32px;
  line-height:1.6;
}
.trial strong{color:#fff}

/* ── Steps ── */
.steps-label{
  font-family:'Syne',sans-serif;
  font-size:.7rem;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);
  margin-bottom:14px;
}
.steps{display:flex;flex-direction:column;gap:0;margin-bottom:36px}

.step{
  display:flex;align-items:flex-start;gap:16px;
  padding:18px 20px;
  background:var(--card);
  border:1px solid var(--border);
  position:relative;
}
.step:first-child{border-radius:var(--radius) var(--radius) 0 0}
.step:last-child{border-radius:0 0 var(--radius) var(--radius);border-top:none}
.step:not(:first-child):not(:last-child){border-top:none}

.step-icon{
  width:40px;height:40px;flex-shrink:0;
  background:var(--surface);
  border:1px solid var(--border-light);
  border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;
  margin-top:1px;
}
.step-body{flex:1}
.step-num{
  font-size:.7rem;font-weight:700;
  color:var(--primary);
  text-transform:uppercase;letter-spacing:.08em;
  margin-bottom:3px;
}
.step-title{
  font-family:'Syne',sans-serif;
  font-size:.98rem;font-weight:700;
  color:var(--text);margin-bottom:4px;
}
.step-desc{
  font-size:.83rem;color:var(--muted);line-height:1.55;
}
.step-desc em{
  color:#c4b5fd;font-style:normal;
  background:rgba(124,92,252,0.12);
  border-radius:6px;padding:1px 6px;
  font-size:.8rem;
}
.step-desc code{
  color:var(--accent);background:rgba(0,229,192,0.08);
  border-radius:5px;padding:1px 5px;font-size:.78rem;
}

/* ── Form card ── */
.form-card{
  background:var(--card);
  border:1px solid var(--border-light);
  border-radius:var(--radius);
  padding:28px 28px 24px;
}

.field-label{
  font-size:.82rem;font-weight:600;
  color:var(--muted);
  margin-bottom:8px;display:flex;align-items:center;gap:6px;
}
.field-label span{color:var(--text)}

.phone-wrap{position:relative;margin-bottom:16px}
.phone-flag{
  position:absolute;left:16px;top:50%;transform:translateY(-50%);
  font-size:1.1rem;pointer-events:none;
}
input[type=tel]{
  width:100%;
  padding:14px 16px 14px 46px;
  background:var(--surface);
  border:1.5px solid var(--border-light);
  border-radius:14px;
  color:var(--text);
  font-family:'DM Sans',sans-serif;
  font-size:1rem;
  outline:none;
  transition:border-color .2s,box-shadow .2s;
}
input[type=tel]:focus{
  border-color:var(--primary);
  box-shadow:0 0 0 4px var(--primary-glow);
}
input[type=tel]::placeholder{color:var(--muted)}

.hint{font-size:.76rem;color:var(--muted);margin-bottom:20px;display:flex;align-items:center;gap:5px}
.hint::before{content:'ℹ️';font-size:.7rem}

#pairBtn{
  width:100%;
  padding:15px;
  background:linear-gradient(135deg,var(--primary),#9b6fff);
  border:none;border-radius:14px;
  color:#fff;
  font-family:'Syne',sans-serif;
  font-size:1rem;font-weight:700;
  letter-spacing:.02em;
  cursor:pointer;
  transition:opacity .2s,transform .1s,box-shadow .2s;
  box-shadow:0 4px 20px var(--primary-glow);
  display:flex;align-items:center;justify-content:center;gap:8px;
}
#pairBtn:hover{opacity:.9;box-shadow:0 6px 28px rgba(124,92,252,0.4)}
#pairBtn:active{transform:scale(.98)}
#pairBtn:disabled{opacity:.4;cursor:not-allowed;transform:none}

/* ── Output states ── */
#output{margin-top:20px}

.status-msg{
  display:flex;align-items:center;gap:12px;
  padding:16px 18px;
  background:rgba(0,229,192,0.06);
  border:1px solid rgba(0,229,192,0.2);
  border-radius:14px;
  color:var(--accent);
  font-size:.88rem;
}

/* ── Code display ── */
.code-box{
  background:var(--surface);
  border:2px solid var(--primary);
  border-radius:16px;
  padding:24px;
  text-align:center;
  margin-bottom:16px;
  box-shadow:0 0 30px var(--primary-glow);
}
.code-label{
  font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:var(--primary);margin-bottom:12px;
}
.code{
  font-size:2.8rem;font-weight:700;
  letter-spacing:10px;
  background:linear-gradient(135deg,var(--primary),var(--accent));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  font-family:'Syne',monospace;
  line-height:1;margin-bottom:12px;
}
.code-steps{
  background:rgba(255,255,255,0.03);
  border-radius:10px;padding:12px 14px;
  text-align:left;
}
.code-step{
  display:flex;align-items:center;gap:8px;
  font-size:.8rem;color:var(--muted);
  padding:4px 0;
}
.code-step-num{
  width:20px;height:20px;
  background:var(--primary);border-radius:50%;
  color:#fff;font-size:.65rem;font-weight:700;
  display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
}
.waiting-msg{
  display:flex;align-items:center;gap:10px;
  padding:14px 16px;
  background:rgba(0,229,192,0.05);
  border:1px solid rgba(0,229,192,0.15);
  border-radius:12px;
  color:var(--accent);font-size:.84rem;margin-top:0;
}

/* ── Success state ── */
.success-box{
  background:var(--surface);
  border:2px solid var(--green);
  border-radius:16px;
  padding:24px;
  box-shadow:0 0 30px rgba(0,229,160,0.15);
}
.success-header{
  display:flex;align-items:center;gap:12px;margin-bottom:14px;
}
.success-icon{
  width:44px;height:44px;
  background:linear-gradient(135deg,var(--green),var(--accent));
  border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;flex-shrink:0;
}
.success-title{
  font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;
  color:var(--text);margin-bottom:2px;
}
.success-sub{font-size:.82rem;color:var(--green)}
.success-body{
  font-size:.83rem;color:var(--muted);line-height:1.6;
  margin-bottom:16px;
  padding:12px 14px;
  background:rgba(255,255,255,0.03);
  border-radius:10px;
}
.success-body code{color:var(--accent);background:rgba(0,229,192,0.08);border-radius:4px;padding:1px 5px;font-size:.78rem}
.session-area textarea{
  width:100%;padding:10px 12px;
  background:#0a0a14;border:1px solid var(--border-light);border-radius:10px;
  color:var(--accent);font-family:monospace;font-size:.7rem;
  resize:vertical;min-height:70px;outline:none;
}
.copy-btn{
  margin-top:10px;width:100%;
  padding:11px;
  background:rgba(0,229,192,0.1);
  border:1px solid rgba(0,229,192,0.3);
  border-radius:10px;
  color:var(--accent);font-family:'DM Sans',sans-serif;
  font-size:.84rem;font-weight:600;
  cursor:pointer;transition:.2s;
  display:flex;align-items:center;justify-content:center;gap:6px;
}
.copy-btn:hover{background:rgba(0,229,192,0.18)}

/* ── Error state ── */
.error-box{
  padding:14px 16px;
  background:rgba(255,79,106,0.08);
  border:1px solid rgba(255,79,106,0.3);
  border-radius:12px;
  color:var(--red);
  font-size:.85rem;
  display:flex;align-items:flex-start;gap:8px;
}

/* ── Spinner ── */
.spinner{
  display:inline-block;width:16px;height:16px;
  border:2.5px solid rgba(0,229,192,0.2);
  border-top:2.5px solid var(--accent);
  border-radius:50%;
  animation:spin .75s linear infinite;
  flex-shrink:0;
}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── Fade in ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.page{animation:fadeUp .5s ease both}

/* ── Footer ── */
.footer{
  margin-top:40px;text-align:center;
  font-size:.75rem;color:var(--muted);
  opacity:.6;
}

/* ── Responsive ── */
@media(max-width:480px){
  .header h1{font-size:1.8rem}
  .code{font-size:2.2rem;letter-spacing:6px}
  .form-card{padding:22px 18px 20px}
  .step{padding:16px}
}
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo-icon">⚡</div>
    <h1>NovaSpark Bot</h1>
    <p>Connect your WhatsApp in 60 seconds — no QR code needed</p>
  </div>

  <!-- Trial Banner -->
  <div class="trial">
    🎁 <strong>7-Day Free Trial</strong> — After connecting, your bot runs fully for 7 days at no cost.<br/>
    Message the owner to extend your access.
  </div>

  <!-- How it works -->
  <p class="steps-label">How it works</p>
  <div class="steps">
    <div class="step">
      <div class="step-icon">📱</div>
      <div class="step-body">
        <div class="step-num">Step 1</div>
        <div class="step-title">Enter your phone number</div>
        <div class="step-desc">Type your WhatsApp number with country code. No + sign or spaces — just digits.<br/>
          Example: <em>263786831091</em> for Zimbabwe, <em>27821234567</em> for South Africa
        </div>
      </div>
    </div>
    <div class="step">
      <div class="step-icon">✨</div>
      <div class="step-body">
        <div class="step-num">Step 2</div>
        <div class="step-title">Click "Get Pairing Code"</div>
        <div class="step-desc">We'll generate an 8-digit code for you within a few seconds. Keep this page open.</div>
      </div>
    </div>
    <div class="step">
      <div class="step-icon">📲</div>
      <div class="step-body">
        <div class="step-num">Step 3</div>
        <div class="step-title">Open WhatsApp on your phone</div>
        <div class="step-desc">
          Go to <em>Settings</em> → <em>Linked Devices</em> → <em>Link a Device</em> → <em>Link with phone number</em>
        </div>
      </div>
    </div>
    <div class="step">
      <div class="step-icon">🔑</div>
      <div class="step-body">
        <div class="step-num">Step 4</div>
        <div class="step-title">Enter the code — you're done!</div>
        <div class="step-desc">Type the 8-digit code into WhatsApp. The bot connects and starts automatically. No restarts needed.</div>
      </div>
    </div>
  </div>

  <!-- Form -->
  <div class="form-card">
    <div class="field-label">📞 <span>Your WhatsApp Number</span></div>
    <div class="phone-wrap">
      <span class="phone-flag">🌍</span>
      <input id="phone" type="tel" placeholder="e.g. 263786831091" autocomplete="tel" inputmode="numeric"/>
    </div>
    <p class="hint">Include country code, no + or spaces (e.g. 263 for Zimbabwe)</p>
    <button id="pairBtn" onclick="requestPair()">
      <span>⚡</span> Get Pairing Code
    </button>
    <div id="output"></div>
  </div>

  <div class="footer">NovaSpark Bot v11 &nbsp;·&nbsp; By Dev-Ntando</div>
</div>

<script>
async function requestPair(){
  const phone = document.getElementById('phone').value.replace(/\D/g,'').trim();
  if(!phone||phone.length<7){alert('Please enter a valid phone number with country code.');return;}
  document.getElementById('pairBtn').disabled=true;
  document.getElementById('output').innerHTML='<div class="status-msg"><span class="spinner"></span>Connecting to WhatsApp&hellip;</div>';
  try{
    const r=await fetch('/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});
    const d=await r.json();
    if(d.code){
      document.getElementById('output').innerHTML=\`
        <div class="code-box">
          <div class="code-label">Your pairing code</div>
          <div class="code">\${d.code}</div>
          <div class="code-steps">
            <div class="code-step"><span class="code-step-num">1</span>Open WhatsApp on your phone</div>
            <div class="code-step"><span class="code-step-num">2</span>Settings → Linked Devices → Link a Device</div>
            <div class="code-step"><span class="code-step-num">3</span>Tap "Link with phone number"</div>
            <div class="code-step"><span class="code-step-num">4</span>Enter the code above</div>
          </div>
        </div>
        <div class="waiting-msg"><span class="spinner"></span>Waiting for you to enter the code in WhatsApp&hellip;</div>
      \`;
      pollSession();
    }else{
      document.getElementById('output').innerHTML='<div class="error-box">⚠️ '+escHtml(d.error||'Something went wrong. Please try again.')+'</div>';
      document.getElementById('pairBtn').disabled=false;
    }
  }catch(e){
    document.getElementById('output').innerHTML='<div class="error-box">⚠️ Could not reach the server: '+escHtml(e.message)+'</div>';
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
        document.getElementById('output').innerHTML=\`
          <div class="success-box">
            <div class="success-header">
              <div class="success-icon">🎉</div>
              <div>
                <div class="success-title">Bot Connected!</div>
                <div class="success-sub">✅ Starting automatically in the background…</div>
              </div>
            </div>
            <div class="success-body">
              Your bot is now launching. You can close this page.<br/><br/>
              <strong style="color:#eeeef5">Keep this SESSION_ID as a backup.</strong> If your bot ever loses its session, paste it into the <code>SESSION_ID</code> env var in your Render dashboard to restore it instantly.
            </div>
            <div class="session-area">
              <textarea id="sid" readonly>\${escHtml(d.sessionID)}</textarea>
              <button class="copy-btn" onclick="copySID()">📋 Copy SESSION_ID</button>
            </div>
          </div>
        \`;
        const w=document.querySelector('.waiting-msg');if(w)w.remove();
        return;
      }
      if(d.status==='error'){
        document.getElementById('output').innerHTML+='<div class="error-box">⚠️ '+escHtml(d.error||'Pairing failed. Please try again.')+'</div>';
        document.getElementById('pairBtn').disabled=false;
        return;
      }
    }catch{}
  }
  document.getElementById('output').innerHTML+='<div class="error-box">⏰ The code expired. Refresh the page and try again.</div>';
  document.getElementById('pairBtn').disabled=false;
}
function copySID(){
  const t=document.getElementById('sid');
  t.select();
  try{navigator.clipboard.writeText(t.value);}catch{document.execCommand('copy');}
  const btn=document.querySelector('.copy-btn');
  if(btn){btn.textContent='✅ Copied!';setTimeout(()=>{btn.innerHTML='📋 Copy SESSION_ID';},2000);}
}
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
</script>
</body>
</html>`;

// ── Save SESSION_ID to Render env var so it survives restarts ────────────────
// Requires RENDER_API_KEY and RENDER_SERVICE_ID env vars.
// Get them from: Render dashboard → Account Settings → API Keys
//                Render dashboard → Your Service → Settings → Service ID
function saveSessionToRender(sessionID) {
  return new Promise((resolve) => {
    const apiKey    = process.env.RENDER_API_KEY;
    const serviceId = process.env.RENDER_SERVICE_ID;
    if (!apiKey || !serviceId) {
      console.log('[SESSION] ⚠️  RENDER_API_KEY or RENDER_SERVICE_ID not set — skipping env var update.');
      console.log('[SESSION] ℹ️  Set these in Render dashboard to enable auto-persist across restarts.');
      return resolve(false);
    }
    const body = JSON.stringify([{ key: 'SESSION_ID', value: sessionID }]);
    const req = https.request({
      hostname: 'api.render.com',
      path:     `/v1/services/${serviceId}/env-vars`,
      method:   'PUT',
      headers:  {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('[SESSION] ✅ SESSION_ID saved to Render env vars — bot will auto-start on restart!');
          resolve(true);
        } else {
          console.log(`[SESSION] ⚠️  Render API returned ${res.statusCode}: ${data.slice(0, 120)}`);
          resolve(false);
        }
      });
    });
    req.on('error', (e) => {
      console.log('[SESSION] ⚠️  Failed to update Render env var:', e.message);
      resolve(false);
    });
    req.setTimeout(8000, () => { req.destroy(); resolve(false); });
    req.write(body);
    req.end();
  });
}

// ── Launch the bot as a child process (clean, no circular require) ────────────
function launchBot(sessionID) {
  console.log('[PAIR] 🚀 Launching bot process now...');
  const env = {
    ...process.env,
    SESSION_ID: sessionID,
    // Tell the bot it was launched by the pair server — skip web pairing fallback
    LAUNCHED_BY_PAIR_SERVER: '1',
    // Unset PORT so the bot doesn't try to bind an HTTP server
    PORT: '',
    PAIR_PORT: '',
  };
  const child = spawn(process.execPath, ['index.js'], {
    cwd:   path.join(__dirname),
    env,
    stdio: 'inherit',
    detached: false,
  });
  child.on('error', (e) => {
    console.error('[PAIR] ⚠️  Failed to launch bot:', e.message);
  });
  child.on('exit', (code) => {
    if (code && code !== 0) console.log(`[PAIR] Bot process exited with code ${code}`);
  });
  return child;
}
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

        // ── Auto-start: set SESSION_ID in env, persist to Render, launch bot ──
        try {
          // 1. Set in current process env so launchBot() inherits it
          process.env.SESSION_ID = sid;

          // 2. Try to persist to Render env vars (survives future restarts)
          saveSessionToRender(sid).then((saved) => {
            if (!saved) {
              console.log('[PAIR] ⚠️  SESSION_ID not auto-saved to Render.');
              console.log('[PAIR] ℹ️  Copy the SESSION_ID from the browser panel and set it as');
              console.log('[PAIR] ℹ️  the SESSION_ID env var in your Render service settings.');
            }
          });

          // 3. Launch the bot as a separate child process (no circular require)
          console.log('[PAIR] ✅ Session ready. Starting bot in 3 seconds...');
          setTimeout(() => launchBot(sid), 3000);

        } catch (e) {
          console.error('[PAIR] ⚠️  Auto-start failed:', e.message);
          console.log('[PAIR] ℹ️  Copy the SESSION_ID from the browser and set it in Render env vars.');
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

  // ── GET /health  (also accept /api/health for Render health-check compat) ──
  if (method === 'GET' && (reqUrl === '/health' || reqUrl === '/api/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: '11.0.0', uptime: Math.floor(process.uptime()) + 's' }));
    return;
  }

  // ── GET /admin  → redirect to main panel (hosted separately) ───────────────
  if (method === 'GET' && (reqUrl === '/admin' || reqUrl === '/admin/')) {
    res.writeHead(302, { 'Location': '/' });
    res.end();
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
