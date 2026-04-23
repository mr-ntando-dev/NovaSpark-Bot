/**
 * ⚡ NovaSpark Bot v8.0 — Bot Instructions ZIP
 * .zip / .botzip / .guide / .instructions
 * Sends a ZIP file containing:
 *   - COMMANDS.txt  (full command list)
 *   - SETUP.txt     (setup guide)
 *   - FEATURES.txt  (all features)
 *   - FAQ.txt       (common questions)
 * Generates the ZIP in-memory and sends as document
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const { execSync } = require('child_process');
const fs       = require('fs');
const path     = require('path');
const os       = require('os');

function buildInstructionsZip() {
  const P = config.prefix || '.';
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'novaspark-'));
  const zipPath = path.join(os.tmpdir(), `NovaSpark-Bot-Guide-${Date.now()}.zip`);

  // ── COMMANDS.txt ──────────────────────────────────────────────────────────
  const commands = `
╔══════════════════════════════════════════════════╗
  ⚡  NOVASPARK BOT v8 — FULL COMMAND REFERENCE
╚══════════════════════════════════════════════════╝

PREFIX: ${P}
Bot Name: ${config.botName}
Version: ${config.botVersion || '8.0.0'}

═══════════════════════════════════════
🤖  AI & INTELLIGENCE
═══════════════════════════════════════
${P}gpt <msg>            — ChatGPT AI chat
${P}gemini <msg>         — Google Gemini AI
${P}character <n> <msg>  — AI persona (luffy/naruto/batman)
${P}autochat on/off      — Auto AI replies to every message
${P}imagine <prompt>     — AI image generation (free)
${P}imagine2 <prompt>    — Alt AI image engine
${P}remini               — AI photo enhancer (reply to image)
${P}removebg             — Remove background from image
${P}genmusic <prompt>    — AI music generation

═══════════════════════════════════════
📚  STUDY & SCHOOL
═══════════════════════════════════════
${P}homework <question>  — Detailed AI answer
${P}essay <topic>        — Full structured essay
${P}summarize <text>     — Bullet summary
${P}translate <lang> <text> — Translate any language
${P}studytips <subject>  — AI study tips
${P}math <problem>       — Step-by-step math
${P}pdf                  — Generate PDF document

═══════════════════════════════════════
🎮  GAMES & CHALLENGES
═══════════════════════════════════════
${P}wordle               — 5-letter word guessing game
${P}trivia               — Live trivia quiz (Open Trivia DB)
${P}hangman              — Classic hangman with ASCII art
${P}rps rock/paper/scissors — RPS with score tracking
${P}8ball <question>     — Magic 8-ball
${P}dice [N]             — Roll dice
${P}flip                 — Coin flip
${P}roulette             — Russian roulette (joke)
${P}truth / ${P}dare     — Truth or Dare
${P}wouldyourather       — Would You Rather
${P}twotruth             — Two Truths & a Lie
${P}nhie                 — Never Have I Ever

═══════════════════════════════════════
😂  FUN & SOCIAL
═══════════════════════════════════════
${P}joke                 — Random joke
${P}meme                 — Meme image
${P}riddle               — Brain teaser
${P}roast @user          — AI savage roast
${P}insult @user         — Funny insult
${P}flirt [@user]        — Flirt message
${P}compliment [@user]   — Genuine compliment
${P}ship @u1 @u2         — Love compatibility %
${P}couple @u1 @u2       — Couple name generator
${P}vibe                 — Check your vibe level
${P}rate <anything>      — Rate anything /10
${P}zodiac <sign>        — Zodiac reading
${P}horoscope <sign>     — Daily horoscope
${P}confess <msg>        — Anonymous confession
${P}waifu                — Random anime waifu
${P}gayrate [@user]      — Joke gaydar

═══════════════════════════════════════
🔧  TOOLS & UTILITIES
═══════════════════════════════════════
${P}weather <city>       — 3-day weather forecast
${P}news [topic]         — Latest headlines
${P}qr <text>            — QR code generator
${P}calc <expr>          — Scientific calculator (sin/cos/sqrt/log)
${P}bmi <kg> <cm>        — BMI calculator
${P}age <DD/MM/YYYY>     — Age calculator
${P}time [timezone]      — World clock (10 cities or custom)
${P}countdown <date>     — Countdown timer
${P}currency 100 USD ZAR — Real-time exchange rates
${P}convert <v> <f> <t>  — Unit converter
${P}color <hex/name>     — Color info (HEX/RGB/HSL)
${P}password [length]    — Generate secure password
${P}poll Q | A | B       — Create a group poll
${P}fact                 — Verified random fact
${P}urban <word>         — Urban Dictionary
${P}nasa                 — NASA Astronomy Picture of the Day
${P}textart <style> <text> — Fancy text (bold/italic/bubble/square)
${P}zip / ${P}botzip     — Get this instructions ZIP

═══════════════════════════════════════
📥  MEDIA & DOWNLOADS
═══════════════════════════════════════
${P}sticker              — Reply to image/video → sticker
${P}tiktok <url>         — TikTok video downloader (no watermark)
${P}yt <query>           — YouTube search (top result)
${P}tts [lang] <text>    — Text to voice note

═══════════════════════════════════════
🛡️  GROUP ADMIN COMMANDS
═══════════════════════════════════════
${P}warn @user [reason]  — Warn a member
${P}warns @user          — Check warnings
${P}clearwarn @user      — Clear warnings
${P}setwarnlimit N       — Set auto-kick threshold
${P}kick @user           — Remove member
${P}promote @user        — Make admin
${P}demote @user         — Remove admin
${P}mute / ${P}unmute    — Lock/unlock group
${P}tagall [msg]         — Tag all members
${P}antilink on/off      — Block all links
${P}antiword on/off/add/remove — Bad word filter
${P}antitoxic on/off     — AI toxic filter
${P}nightmode on [HH:MM] [HH:MM] — Night schedule
${P}vip on/off/add/remove/list — VIP-only mode
${P}ghost on/off         — Ghost mode (no typing/read receipts)
${P}stealth on/off       — Maximum stealth mode
${P}autoreact on/off     — Auto emoji reactions
${P}welcome on/off [msg] — Custom welcome messages
${P}goodbye on/off [msg] — Custom goodbye messages
${P}groupstats           — Analytics dashboard
${P}autopin on/off       — Auto-pin admin messages
${P}autopin keyword <word> — Auto-pin by keyword
${P}autoquote on/off     — Auto quote-reply to triggers
${P}autonuke on/off      — Spam destroyer
${P}autopollclose on/off — Auto-close polls with results
${P}autotranslate on <lang> — Translate all incoming messages
${P}autoschedule add HH:MM <msg> — Schedule daily messages

═══════════════════════════════════════
👑  OWNER COMMANDS
═══════════════════════════════════════
${P}setpremium add/remove/list @user — Manage premium members
${P}antidelete on/off    — Catch deleted messages
${P}botstats             — Full server statistics
${P}broadcast <msg>      — Broadcast to all groups
${P}autoforward set <src> <dst> — Forward messages between chats
${P}autostatus on/off    — Auto-save contact statuses
${P}autobirthday / ${P}birthday — Birthday wish system
${P}autosuggest on/off   — Auto command suggestions
${P}restart              — Restart bot
${P}shutdown             — Shutdown bot
${P}eval <code>          — Execute JS (DANGEROUS)
${P}maintenance on/off   — Maintenance mode
${P}joingroup <link>     — Join a group via invite link
${P}listgroups           — List all groups bot is in

═══════════════════════════════════════
💎  PREMIUM COMMANDS
═══════════════════════════════════════
${P}examprep <subject>   — Full exam revision guide
${P}code <lang> <task>   — Generate working code
${P}remind <time> <msg>  — Set real reminders
${P}mystats              — Personal analytics
${P}autostudy on <subj>  — Daily AI study tips
${P}setpersona <desc>    — Custom AI persona

─────────────────────────────────────
  Total Commands: 100+
  Version: ${config.botVersion || '8.0.0'}
  By Dev-Ntando | NovaSpark Bot 2026
─────────────────────────────────────
`.trim();

  // ── SETUP.txt ─────────────────────────────────────────────────────────────
  const setup = `
╔══════════════════════════════════════════════════╗
  ⚡  NOVASPARK BOT v8 — SETUP GUIDE
╚══════════════════════════════════════════════════╝

─── OPTION A: OFFICIAL HOSTING (Recommended) ────────

1. Go to: https://host-ladybugnodes.onrender.com
   (or your hosted NovaSpark Nodes URL)
2. Sign up for a free account
3. Click "New Session" → paste your SESSION_ID
4. Hit START — your bot is live in 30 seconds!
5. No technical knowledge needed.

─── OPTION B: SELF-HOST ON RENDER.COM ───────────────

1. Fork this repo: https://github.com/dev-modder/NovaSpark-Bot
2. Go to render.com → New → Web Service
3. Connect your GitHub repo
4. Set environment variables:
   SESSION_ID=your_session_string
   OPENAI_API_KEY=optional (improves AI quality)
   REMOVE_BG_API_KEY=optional (remove.bg API)
5. Click Deploy

─── OPTION C: LOCAL INSTALL ─────────────────────────

Requirements: Node.js v18+, npm

  git clone https://github.com/dev-modder/NovaSpark-Bot.git
  cd NovaSpark-Bot
  npm install
  node index.js

─── GETTING YOUR SESSION ID ─────────────────────────

1. Run the bot locally (node index.js)
2. A QR code appears in terminal
3. Open WhatsApp → Linked Devices → Link a Device
4. Scan the QR code
5. The session is saved in the "session" folder
6. To get a session string, use:
   https://host-ladybugnodes.onrender.com/auth/qr

─── CONFIGURATION (config.js) ───────────────────────

ownerNumber: ['263771234567']   // Your WhatsApp number (no +)
ownerName:   ['Your Name']
botName:     'NovaSpark Bot'
prefix:      '.'                // Command prefix
sessionID:   ''                 // Leave blank to scan QR
timezone:    'Africa/Harare'

─── ENVIRONMENT VARIABLES ───────────────────────────

SESSION_ID          — Your WhatsApp session string
OPENAI_API_KEY      — OpenAI (optional, enhances AI)
REMOVE_BG_API_KEY   — Remove.bg (optional)
CHANNEL_LINK        — Your WhatsApp channel URL
RENDER_URL          — Your Render.com service URL

─────────────────────────────────────
  NovaSpark Bot v8.0 | By Dev-Ntando
─────────────────────────────────────
`.trim();

  // ── FEATURES.txt ──────────────────────────────────────────────────────────
  const features = `
╔══════════════════════════════════════════════════╗
  ⚡  NOVASPARK BOT v8 — ALL FEATURES
╚══════════════════════════════════════════════════╝

✅ 100+ commands across 10 categories
✅ AI integration (GPT, Gemini, image gen)
✅ Ghost Mode — completely invisible operation
✅ Stealth Mode — maximum invisibility layer
✅ Night Mode — auto mute/unmute on schedule
✅ VIP Mode — restrict chat to VIP members only
✅ Auto React — emoji reactions to messages
✅ Auto Translate — translate all messages live
✅ Auto Schedule — daily timed messages
✅ Auto Forward — forward msgs between chats
✅ Auto Pin — auto-pin admin messages / keywords
✅ Auto Nuke — spam destroyer with auto-kick
✅ Auto Poll Close — announces results + closes polls
✅ Auto Birthday — birthday wishes with custom msgs
✅ Auto Quote Reply — human-like moderator replies
✅ Auto Status Saver — saves all contact statuses
✅ Auto Command Suggestions — fuzzy command matching
✅ Anti-Toxic AI filter — heuristic hate speech detection
✅ Anti-Link — blocks all URLs in groups
✅ Anti-Flood — rate limits spam flooding
✅ Anti-Raid — detects mass join attacks
✅ Anti-Delete — catches deleted messages
✅ Anti-Call — blocks all incoming calls
✅ Anti-Fake — detects unofficial WhatsApp clients
✅ Anti-Word — per-group custom bad word filter
✅ Welcome/Goodbye messages with variables
✅ Full warn system with configurable limits
✅ Group analytics dashboard
✅ TikTok downloader (no watermark)
✅ YouTube search with thumbnails
✅ AI background remover
✅ AI photo enhancer (Remini)
✅ Text-to-speech in 10+ languages
✅ Wordle, Trivia, Hangman, RPS games
✅ Scientific calculator
✅ World clock / time zones
✅ Real-time weather (3-day)
✅ Live news headlines
✅ QR code generator
✅ Currency converter (real-time)
✅ Unit converter
✅ Profile cards with stats
✅ Premium member system
✅ Love compatibility (ship)
✅ Truth or Dare
✅ 100% FREE — no paid plan required for core features

─────────────────────────────────────
  NovaSpark Bot v8.0 | By Dev-Ntando
─────────────────────────────────────
`.trim();

  // ── FAQ.txt ────────────────────────────────────────────────────────────────
  const faq = `
╔══════════════════════════════════════════════════╗
  ⚡  NOVASPARK BOT v8 — FAQ
╚══════════════════════════════════════════════════╝

Q: How do I start the bot?
A: Type ${P}menu in any chat the bot is in.

Q: The bot isn't responding. What's wrong?
A: 1) Make sure you're using the right prefix (${P})
   2) The bot may be in maintenance mode
   3) Check if Ghost/Stealth mode is blocking output
   4) Try ${P}ping to test if bot is alive

Q: How do I make someone a premium member?
A: Owner only: ${P}setpremium add @user

Q: How do I set a custom welcome message?
A: ${P}welcome on Welcome to @group, @user! You are member #@count.
   Variables: @user @group @count @date

Q: How do I stop the bot from showing online?
A: Use ${P}stealth on for maximum invisibility
   Or ${P}ghost on for basic ghost mode

Q: Can the bot be banned by WhatsApp?
A: There is always a risk when using unofficial bots.
   Use stealth/ghost mode to reduce detection.
   Avoid spamming and mass messaging.

Q: How do I update the bot?
A: cd NovaSpark-Bot && git pull && npm install

Q: The QR code expired. What do I do?
A: Delete the "session" folder and restart: node index.js

Q: How do I add my own auto-reply keywords?
A: ${P}autoquote add <word> <reply text>
   Or edit the autoReplyKeywords section in config.js

Q: Can I run multiple bots?
A: Yes! Use NovaSpark Nodes hosting dashboard.
   Each session runs as a separate bot instance.

Q: How do I schedule a daily message?
A: ${P}autoschedule add HH:MM <your message>
   Example: ${P}autoschedule add 08:00 Good morning!

Q: How do I get support?
A: Contact Dev-Ntando via WhatsApp channel.
   GitHub: https://github.com/dev-modder/NovaSpark-Bot

─────────────────────────────────────
  NovaSpark Bot v8.0 | By Dev-Ntando
─────────────────────────────────────
`.trim();

  // Write files
  fs.writeFileSync(path.join(tmpDir, 'COMMANDS.txt'), commands);
  fs.writeFileSync(path.join(tmpDir, 'SETUP.txt'), setup);
  fs.writeFileSync(path.join(tmpDir, 'FEATURES.txt'), features);
  fs.writeFileSync(path.join(tmpDir, 'FAQ.txt'), faq);

  // Create ZIP
  try {
    execSync(`cd "${tmpDir}" && zip -r "${zipPath}" .`);
  } catch (e) {
    // fallback: just concatenate as txt if zip not available
    return null;
  }

  const zipBuffer = fs.readFileSync(zipPath);
  // Cleanup
  try { fs.rmSync(tmpDir, { recursive: true }); fs.unlinkSync(zipPath); } catch {}
  return zipBuffer;
}

module.exports = {
  name: 'botzip',
  aliases: ['zip', 'guide', 'instructions', 'manual', 'botguide'],
  description: 'Download full bot instructions as a ZIP file',
  category: 'free',

  execute: async ({ sock, msg, from, reply }) => {
    await reply('📦 Generating your NovaSpark Bot guide ZIP... Please wait a moment.');

    try {
      const zipBuffer = buildInstructionsZip();

      if (!zipBuffer) {
        // Fallback: send as plain text
        return reply(
          '📋 *NovaSpark Bot Guide*\n\n' +
          'ZIP generation unavailable. Here\'s the quick summary:\n\n' +
          `Type \`${config.prefix}menu\` for the full command menu.\n` +
          'Visit: https://github.com/dev-modder/NovaSpark-Bot for full docs.'
        );
      }

      await sock.sendMessage(from, {
        document: zipBuffer,
        mimetype: 'application/zip',
        fileName: `NovaSpark-Bot-v${config.botVersion || '8.0'}-Guide.zip`,
        caption: `📦 *NovaSpark Bot v${config.botVersion || '8.0'} — Complete Guide*\n\n` +
          'This ZIP contains:\n' +
          '• 📜 COMMANDS.txt — All 100+ commands\n' +
          '• ⚙️ SETUP.txt — Setup & deployment guide\n' +
          '• ✨ FEATURES.txt — All features list\n' +
          '• ❓ FAQ.txt — Frequently asked questions\n\n' +
          '_By Dev-Ntando | NovaSpark 2026_ ⚡',
      }, { quoted: msg });
    } catch (err) {
      return reply('❌ Error generating ZIP. Please try again.');
    }
  },
};
