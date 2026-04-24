/**
 * NovaSpark Bot v9.0 — NEON-MD Style Menu
 * Image + caption, quoted via fake vCard contact.
 * Time-based greeting, tree-style borders, category sections.
 * By Dev-Ntando
 */
'use strict';

const config   = require('../../config');
const database = require('../../database');
const fs       = require('fs');
const path     = require('path');

// ── Greeting helper ───────────────────────────────────────────────────────
function getGreeting() {
  const tz   = config.timezone || 'Africa/Harare';
  const hour = new Date(new Date().toLocaleString('en-US', { timeZone: tz })).getHours();
  if (hour >= 5  && hour < 12) return '🌅 Good Morning';
  if (hour >= 12 && hour < 17) return '☀️ Good Afternoon';
  if (hour >= 17 && hour < 21) return '🌆 Good Evening';
  return '🌙 Good Night';
}

module.exports = {
  name:        'menu',
  aliases:     ['help', 'cmds', 'commands', 'start', 'h'],
  description: 'Show bot menu — NEON-MD style',
  category:    'free',

  execute: async ({ sock, msg, from, sender, args, reply }) => {

    const P      = config.prefix || '.';
    const isPrem = database.isPremium ? database.isPremium(sender) : false;
    const num    = sender.split('@')[0];
    const plan   = isPrem ? '💸 *Premium Member*' : '🆓 *Free User*';
    const greeting = getGreeting();

    // Uptime
    const up   = process.uptime();
    const upStr = `${Math.floor(up / 3600)}h ${Math.floor((up % 3600) / 60)}m ${Math.floor(up % 60)}s`;

    // Memory
    const memMB  = Math.round(process.memoryUsage().heapUsed  / 1024 / 1024);
    const memTot = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);

    // Date / time
    const now  = new Date().toLocaleString('en-ZA', {
      timeZone: config.timezone || 'Africa/Harare',
      weekday: 'long', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    });

    // ── Borders ──────────────────────────────────────────────────────────
    const TOP  = '╔' + '═'.repeat(33) + '╗';
    const MID  = '╠' + '═'.repeat(33) + '╣';
    const BOT  = '╚' + '═'.repeat(33) + '╝';
    const PIPE = '║';
    const DIV  = '┄'.repeat(33);
    const SEP  = '━'.repeat(33);

    // ── Section builder ──────────────────────────────────────────────────
    const sec = (emoji, title) => `\n${emoji} *${title}*\n${DIV}`;

    // cmd shorthand
    const c = cmd => `  *╰┈➤ ${P}${cmd}*`;

    // ── Menu body ────────────────────────────────────────────────────────
    const menu = [
      TOP,
      `${PIPE}  ⚡ *N O V A S P A R K  B O T*  ⚡  ${PIPE}`,
      `${PIPE}   v${config.botVersion} · 2026 Edition  ${PIPE}`,
      MID,
      `${PIPE}  ${greeting}, *${(config.ownerName[0] || 'User')}*  ${PIPE}`,
      BOT,
      '',
      `> 👤 *+${num}*`,
      `> 📌 ${plan}`,
      `> 🕐 ${now}`,
      `> ⏱️ Uptime: ${upStr}  ·  💾 ${memMB}/${memTot} MB`,
      SEP,

      // ── AI ──────────────────────────────────────────────────────────
      sec('🤖', 'A I   &   I N T E L L I G E N C E'),
      c('gpt <msg>'),
      c('gemini <msg>'),
      c('character <name> <msg>'),
      c('autochat on/off'),
      c('imagine <prompt>'),
      c('imagine2 <prompt>'),
      c('remini'),
      c('removebg'),
      c('genmusic <prompt>'),
      SEP,

      // ── Study ────────────────────────────────────────────────────────
      sec('📚', 'S T U D Y   &   S C H O O L'),
      c('homework <question>'),
      c('essay <topic>'),
      c('summarize <text>'),
      c('studytips <subject>'),
      c('math <problem>'),
      c('translate <lang> <text>'),
      c('pdf'),
      SEP,

      // ── Games ────────────────────────────────────────────────────────
      sec('🎮', 'G A M E S   &   C H A L L E N G E S'),
      c('wordle  🆕'),
      c('trivia'),
      c('hangman'),
      c('rps rock/paper/scissors'),
      c('8ball <question>'),
      c('dice [N]  /  flip  /  roulette'),
      c('truth  /  dare  /  wouldyourather'),
      c('twotruth  /  nhie'),
      c('chess start @user  🆕'),
      c('akinator start  🆕'),
      c('scramble  🆕'),
      c('wyr  /  wyr a/b  🆕'),
      SEP,

      // ── Fun ──────────────────────────────────────────────────────────
      sec('😂', 'F U N   &   S O C I A L'),
      c('joke  /  meme  /  riddle'),
      c('roast @user  /  insult @user'),
      c('flirt [@user]  /  compliment [@user]'),
      c('ship @u1 @u2  /  couple @u1 @u2'),
      c('rate <anything>  /  vibe'),
      c('zodiac <sign>  /  horoscope <sign>'),
      c('confess <msg>  /  waifu  /  gayrate [@user]'),
      c('personality  🆕'),
      SEP,

      // ── Tools ────────────────────────────────────────────────────────
      sec('🔧', 'T O O L S   &   U T I L I T I E S'),
      c('weather <city>  /  news [topic]'),
      c('qr <text>  /  calc <expr>'),
      c('bmi <kg> <cm>  /  age <date>'),
      c('time [zone]  /  countdown <date>'),
      c('currency 100 USD ZAR'),
      c('convert <val> <from> <to>'),
      c('color <hex/name>  /  lyrics <song>'),
      c('tts [lang] <text>  /  textart <style> <text>'),
      c('encode <type> <text>'),
      c('password [len]  /  ip <addr>'),
      c('crypto <coin>  /  shorturl <url>'),
      c('ssweb <url>  /  define  /  urban'),
      c('fact  /  catfact  /  dogfact  /  numberfact <N>'),
      c('motivate  /  advice  /  quote'),
      c('getpp @user  /  tempnumber  /  myactivity'),
      c('reminder set 10m <msg>  🆕'),
      c('note add/list/get/delete  🆕'),
      c('poll2 "Q" "A" "B"  /  vote 1  🆕'),
      c('countdown set "Event" date  🆕'),
      c('timetable add/show/week  🆕'),
      c('coinflip  /  bet heads 100  🆕'),
      c('wallet  /  richlist  /  transfer @u 100  🆕'),
      SEP,

      // ── Downloads ────────────────────────────────────────────────────
      sec('⬇️', 'D O W N L O A D S'),
      c('ytmp3 <query/url>'),
      c('ytmp4 <query/url>'),
      c('tiktok  /  instagram  /  facebook  /  pinterest'),
      c('spotify <query>'),
      SEP,

      // ── Media ────────────────────────────────────────────────────────
      sec('🎬', 'M E D I A   &   V I S U A L S'),
      c('sticker'),
      c('simage <url>  /  viewonce'),
      c('remini  /  removebg'),
      SEP,

      // ── Group ────────────────────────────────────────────────────────
      sec('🛡️', 'G R O U P   M A N A G E M E N T'),
      c('kick  /  promote  /  demote  /  ban  /  unban'),
      c('warn  /  warns  /  clearwarn  /  listwarn  🆕'),
      c('tagall  /  hidetag  /  tagadmins  /  delete'),
      c('mute  /  unmute  /  grouplink  /  resetlink'),
      c('welcome  /  goodbye on/off'),
      c('setrules <rules>  🆕  /  rules  🆕'),
      c('nightmode  /  vip  /  ghost on/off'),
      c('antilink  /  antitoxic  /  antiflood  /  antiraid'),
      c('antiword  /  antifwd  /  antispam on/off'),
      c('autokick  /  autoreact  /  autoreply  /  autonudge'),
      c('groupinfo  /  groupstats  /  membercount  /  topmembers'),
      c('slowmode on 30  🆕  /  slowmode off'),
      c('pin  🆕  /  pins  /  unpin <n>'),
      c('xp  /  xp leaderboard  🆕'),
      c('antiimage  /  antivideo  /  antisticker on/off  🆕'),
      SEP,

      // ── Faith ────────────────────────────────────────────────────────
      sec('✝️', 'F A I T H   &   I N S P I R A T I O N'),
      c('tbj  /  tbj <N>  /  tbj search <topic>'),
      c('tbj quote  /  tbj list'),
      c('bible <ref>'),
      c('verse  /  prayer  /  pray <request>'),
      c('autoverse  /  autoprayer  /  autogm on HH:MM'),
      SEP,

      // ── Auto ─────────────────────────────────────────────────────────
      sec('⚙️', 'A U T O   F E A T U R E S'),
      c('autoonline  /  autotyping  /  autoread'),
      c('autoreply  /  autostatus  /  autobackup'),
      c('autoleave  /  anticall  /  antidelete'),
      c('waprotect  /  pmblocker'),
      c('autoschedule add HH:MM <msg>'),
      c('autoforward set <src> <dst>'),
      c('autopin on/off/keyword <word>'),
      c('autotranslate on <lang>'),
      c('autonuke on/off'),
      c('birthday add @user DD/MM'),
      c('autopollclose on/off  /  autoquote on/off  /  autosuggest on/off'),
      SEP,

      // ── Stealth ──────────────────────────────────────────────────────
      sec('👻', 'S T E A L T H   &   G H O S T'),
      c('ghost on/off'),
      c('stealth on/off'),
      c('stealth delay <min> <max>'),
      c('stealth presence <mode>'),
      SEP,

      // ── Guide ────────────────────────────────────────────────────────
      sec('📦', 'G U I D E   &   D O W N L O A D'),
      c('zip  /  botzip  /  guide'),
      SEP,

      // ── Premium ──────────────────────────────────────────────────────
      sec('💸', 'P R E M I U M'),
      c('examprep <subject>'),
      c('code <lang> <task>'),
      c('remind <time> <msg>'),
      c('mystats  /  setpersona  /  autostudy'),
      c('upgrade'),
      SEP,

      // ── Owner ────────────────────────────────────────────────────────
      sec('👑', 'O W N E R   C O M M A N D S'),
      c('shutdown  /  restart  /  botstats'),
      c('eval <code>'),
      c('broadcast  /  announce  /  dmowner'),
      c('setpremium add/rm/list'),
      c('ban  /  unban  /  banlist  /  cleardb'),
      c('setprefix  /  setprofile  /  setnick'),
      c('listgroups  /  joingroup  /  leavegroup'),
      c('ownerlist  /  addowner  /  removeowner'),
      c('maintenance on/off'),
      c('autoforward set/list/remove'),
      c('autoschedule add/list/remove'),
      c('birthday add/list/remove'),
      c('stealth on/off/status'),
      SEP,

      '',
      `📡 *${config.botName} v${config.botVersion}*`,
      `👑 Owner: ${Array.isArray(config.ownerName) ? config.ownerName.join(' & ') : config.ownerName}`,
      `📌 Prefix: *${P}*  ·  🌍 TZ: ${config.timezone || 'Africa/Harare'}`,
      '',
      `_🆕 = New in v9.0  ·  💸 = Premium only_`,
      `_📦 Type \`${P}zip\` for full source download_`,
      `_⚡ NovaSpark Bot — Built by Dev-Ntando_`,
    ].join('\n');

    // ── Fake vCard for NEON-MD style quoted message ───────────────────────
    const fakevCard = {
      key: {
        fromMe:    false,
        participant: '0@s.whatsapp.net',
        remoteJid:   'status@broadcast',
      },
      message: {
        contactMessage: {
          displayName: config.botName || 'NovaSpark Bot',
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.botName || 'NovaSpark Bot'}\nORG:${config.botName || 'NovaSpark Bot'};\nTEL;type=CELL;type=VOICE;waid=${(config.ownerNumber[0] || '263786831091')}:+${(config.ownerNumber[0] || '263786831091')}\nEND:VCARD`,
        },
      },
    };

    // ── Load menu image ───────────────────────────────────────────────────
    let imageSource = null;
    const base = path.resolve(__dirname, '../../assets');
    for (const fname of ['menu_image.jpg', 'menu_image.jpeg', 'menu_image.png']) {
      const fp = path.join(base, fname);
      if (fs.existsSync(fp)) { imageSource = { image: fs.readFileSync(fp) }; break; }
    }
    if (!imageSource) {
      if (config.menuImagePath && config.menuImagePath.startsWith('http')) {
        imageSource = { image: { url: config.menuImagePath } };
      } else {
        imageSource = { image: { url: 'https://i.imgur.com/4M7IWwP.jpeg' } };
      }
    }

    // ── Send ──────────────────────────────────────────────────────────────
    try {
      await sock.sendMessage(from, {
        ...imageSource,
        caption: menu,
      }, { quoted: fakevCard });
    } catch {
      // fallback: plain text, quoted on the user's original message
      await sock.sendMessage(from, { text: menu }, { quoted: msg });
    }
  },
};
