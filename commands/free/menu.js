/**
 * NovaSpark Bot v11 — Multi-Style Menu System
 * Styles: neon (default), minimal, list, embed, compact, fancy
 * Switch style with .setmenu <style>  (owner only)
 * By Dev-Ntando
 */
'use strict';

const config   = require('../../config');
const database = require('../../database');
const fs       = require('fs');
const path     = require('path');

function getGreeting() {
  const tz   = config.timezone || 'Africa/Harare';
  const hour = new Date(new Date().toLocaleString('en-US', { timeZone: tz })).getHours();
  if (hour >= 5  && hour < 12) return '🌅 Good Morning';
  if (hour >= 12 && hour < 17) return '☀️ Good Afternoon';
  if (hour >= 17 && hour < 21) return '🌆 Good Evening';
  return '🌙 Good Night';
}

function uptimeStr() {
  const up = process.uptime();
  return Math.floor(up/3600) + 'h ' + Math.floor((up%3600)/60) + 'm ' + Math.floor(up%60) + 's';
}

function loadMenuImage() {
  const base = path.resolve(__dirname, '../../assets');
  for (const fname of ['menu_image.jpg','menu_image.jpeg','menu_image.png']) {
    const fp = path.join(base, fname);
    if (fs.existsSync(fp)) return { image: fs.readFileSync(fp) };
  }
  if (config.menuImagePath && config.menuImagePath.startsWith('http')) {
    return { image: { url: config.menuImagePath } };
  }
  return { image: { url: 'https://i.imgur.com/4M7IWwP.jpeg' } };
}

function fakevCard() {
  const ownerNum = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;
  return {
    key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
    message: {
      contactMessage: {
        displayName: config.botName || 'NovaSpark Bot',
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.botName}\nORG:${config.botName};\nTEL;type=CELL;waid=${ownerNum}:+${ownerNum}\nEND:VCARD`,
      },
    },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLE 1 — NEON  (full boxed menu with image)
// ══════════════════════════════════════════════════════════════════════════════
function buildNeonMenu(P, sender, isPrem) {
  const TOP  = '╔' + '═'.repeat(33) + '╗';
  const MID  = '╠' + '═'.repeat(33) + '╣';
  const BOT  = '╚' + '═'.repeat(33) + '╝';
  const PIPE = '║';
  const DIV  = '┄'.repeat(33);
  const SEP  = '━'.repeat(33);
  const sec  = (e,t) => `\n${e} *${t}*\n${DIV}`;
  const c    = cmd => `  *╰┈➤ ${P}${cmd}*`;
  const num  = sender.split('@')[0];
  const plan = isPrem ? '💸 *Premium Member*' : '🆓 *Free User*';
  const now  = new Date().toLocaleString('en-ZA',{
    timeZone: config.timezone||'Africa/Harare',
    weekday:'long',month:'short',day:'numeric',
    year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,
  });
  const memMB  = Math.round(process.memoryUsage().heapUsed/1024/1024);
  const memTot = Math.round(process.memoryUsage().heapTotal/1024/1024);
  return [
    TOP,
    `${PIPE}  ⚡ *N O V A S P A R K  B O T*  ⚡  ${PIPE}`,
    `${PIPE}   v${config.botVersion} · 2026 Edition  ${PIPE}`,
    MID,
    `${PIPE}  ${getGreeting()}, *${config.ownerName[0]||'User'}*  ${PIPE}`,
    BOT,'',
    `> 👤 *+${num}*`,
    `> 📌 ${plan}`,
    `> 🕐 ${now}`,
    `> ⏱️ Uptime: ${uptimeStr()}  ·  💾 ${memMB}/${memTot} MB`,SEP,
    sec('🤖','A I   &   I N T E L L I G E N C E'),
    c('gpt <msg>'),c('gemini <msg>'),c('character <name> <msg>'),
    c('agent <task>'),c('persona <name>  /  memory on/off'),
    c('autochat on/off'),c('multilang on/off'),
    c('vision  /  docanalyze  /  imggen <prompt>'),
    c('voicechat on/off  /  codex <code>'),
    c('aieyes on/off'),c('imagine <prompt>'),c('imagine2 <prompt>'),
    c('remini'),c('removebg'),c('genmusic <prompt>'),SEP,
    sec('📚','S T U D Y   &   T O O L S'),
    c('homework <q>'),c('essay <topic>'),c('summarize <text>'),
    c('translate <text>'),c('studytips <subject>'),
    c('pdf <title|topic>'),c('math <expr>'),SEP,
    sec('🎮','G A M E S   &   F U N'),
    c('chess start @user'),c('akinator start'),c('wordle'),
    c('trivia'),c('hangman'),c('rps rock/paper/scissors'),
    c('scramble'),c('wyr'),c('personality'),
    c('ship @user1 @user2'),c('compliment [@user]  /  insult [@user]'),
    c('8ball <q>'),c('coinflip  /  bet heads 100'),
    c('wallet  /  richlist  /  transfer @u 100'),SEP,
    sec('⬇️','D O W N L O A D S'),
    c('ytmp3 <q/url>  /  ytmp4 <q/url>  /  ytshorts <url>'),
    c('tiktok <url>  /  instagram <url>  /  facebook <url>'),
    c('twitter <url>  /  threads <url>  /  reddit <url>'),
    c('soundcloud <url>  /  spotify <q>  /  alldl <url>'),
    c('gdrive <url>  /  mediafire <url>  /  apk <url>'),SEP,
    sec('🔧','T O O L S   &   U T I L I T I E S'),
    c('weather <city>  /  news [topic]'),
    c('qr <text>  /  calc <expr>'),
    c('currency 100 USD ZAR  /  convert'),
    c('tts [lang] <text>  /  sticker  /  removebg'),
    c('note add/list/get/delete  /  poll  /  poll2'),
    c('countdown set "Event" date  /  timetable'),
    c('ping  /  alive  /  owner  /  profile  /  xp'),SEP,
    sec('🛡️','G R O U P   M A N A G E M E N T'),
    c('kick  /  promote  /  demote  /  ban  /  unban'),
    c('warn  /  warns  /  clearwarn  /  setwarnlimit'),
    c('tagall  /  hidetag  /  tagadmins  /  delete'),
    c('mute  /  unmute  /  welcome  /  goodbye'),
    c('antilink  /  antitoxic  /  antiflood  /  antiraid'),
    c('antiword  /  antispam  /  antimedia on/off'),
    c('nightmode  /  vip  /  ghost on/off  /  slowmode'),
    c('groupstats  /  groupinfo  /  leaderboard  /  xp'),SEP,
    sec('⚙️','A U T O   F E A T U R E S'),
    c('autoonline  /  autotyping  /  autoread'),
    c('autoreply  /  autostatus  /  autobackup  /  autoleave'),
    c('autoforward  /  autoschedule  /  autopin  /  autonuke'),
    c('waprotect on/off  /  pmblocker  /  anticall'),SEP,
    sec('✝️','F A I T H'),
    c('bible <ref>  /  verse  /  prayer  /  tbj'),
    c('autoverse  /  autoprayer  /  autogm on HH:MM'),SEP,
    sec('💸','P R E M I U M'),
    c('examprep <subject>'),c('code <lang> <task>'),
    c('remind <time> <msg>'),c('mystats  /  autostudy'),c('upgrade'),SEP,
    sec('👑','O W N E R'),
    c('shutdown  /  restart  /  botstats  /  eval <code>'),
    c('broadcast  /  announce  /  ban  /  unban'),
    c('setmenu <style>  — switch menu style'),
    c('setpremium add/rm/list  /  ownermode on/off'),
    c('maintenance on/off  /  analytics'),SEP,'',
    `📡 *${config.botName} v${config.botVersion}*`,
    `👑 Owner: ${Array.isArray(config.ownerName)?config.ownerName.join(' & '):config.ownerName}`,
    `📌 Prefix: *${P}*  ·  🌍 ${config.timezone||'Africa/Harare'}`,'',
    `_💸 = Premium only  ·  Use \`.setmenu\` to change style_`,
    `_⚡ NovaSpark Bot — Built by Dev-Ntando_`,
  ].join('\n');
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLE 2 — MINIMAL  (numbered, text-only)
// ══════════════════════════════════════════════════════════════════════════════
function buildMinimalMenu(P) {
  return [
    `⚡ *NovaSpark Bot v${config.botVersion}*`,
    `Prefix: *${P}*  |  ${getGreeting()}  |  ⏱️ ${uptimeStr()}`,
    '─────────────────────────────────',
    `1️⃣  \`${P}gpt\` \`${P}gemini\` \`${P}imagine\` — AI`,
    `2️⃣  \`${P}homework\` \`${P}essay\` \`${P}pdf\` — Study`,
    `3️⃣  \`${P}chess\` \`${P}wordle\` \`${P}trivia\` — Games`,
    `4️⃣  \`${P}ytmp3\` \`${P}tiktok\` \`${P}alldl\` — Downloads`,
    `5️⃣  \`${P}weather\` \`${P}qr\` \`${P}calc\` — Tools`,
    `6️⃣  \`${P}kick\` \`${P}warn\` \`${P}antilink\` — Group`,
    `7️⃣  \`${P}autoonline\` \`${P}waprotect\` — Auto`,
    `8️⃣  \`${P}bible\` \`${P}verse\` \`${P}prayer\` — Faith`,
    `9️⃣  \`${P}examprep\` \`${P}mystats\` — Premium 💸`,
    `🔟  \`${P}eval\` \`${P}botstats\` \`${P}setmenu\` — Owner 👑`,
    '─────────────────────────────────',
    `_Type \`.setmenu\` to change menu style_`,
  ].join('\n');
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLE 3 — EMBED  (image + short category summary)
// ══════════════════════════════════════════════════════════════════════════════
function buildEmbedCaption(P, sender, isPrem) {
  const num  = sender.split('@')[0];
  const plan = isPrem ? '💸 Premium' : '🆓 Free';
  return [
    `⚡ *NOVASPARK BOT* ⚡`,
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 +${num}  |  ${plan}`,
    `⏱️ ${uptimeStr()}  |  ${getGreeting()}`,
    '━━━━━━━━━━━━━━━━━━━━','',
    `🤖 *AI* — gpt · gemini · imagine · aieyes`,
    `📚 *Study* — homework · essay · pdf · math`,
    `🎮 *Games* — chess · wordle · trivia · bet`,
    `⬇️ *DL* — ytmp3 · tiktok · insta · alldl`,
    `🔧 *Tools* — weather · qr · calc · sticker`,
    `🛡️ *Group* — kick · warn · antilink · vip`,
    `⚙️ *Auto* — online · waprotect · autoreply`,
    `✝️ *Faith* — bible · verse · prayer · tbj`,
    `💸 *Premium* — examprep · code · mystats`,
    `👑 *Owner* — eval · setmenu · broadcast`,'',
    `📌 Prefix *${P}*  ·  v${config.botVersion}`,
    `_⚡ Built by Dev-Ntando_`,
  ].join('\n');
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLE 4 — COMPACT  (dense single column, no dividers)
// ══════════════════════════════════════════════════════════════════════════════
function buildCompactMenu(P) {
  const cats = [
    ['🤖 AI',       ['gpt','gemini','imagine','character','remini','removebg','aieyes']],
    ['📚 Study',    ['homework','essay','summarize','translate','pdf','math']],
    ['🎮 Games',    ['chess','wordle','trivia','hangman','rps','akinator','scramble']],
    ['⬇️ DL',       ['ytmp3','ytmp4','tiktok','instagram','facebook','alldl','spotify']],
    ['🔧 Tools',    ['weather','news','qr','calc','sticker','tts','currency','poll']],
    ['🛡️ Group',    ['kick','warn','tagall','antilink','nightmode','vip','ghost']],
    ['⚙️ Auto',     ['autoonline','autoreply','waprotect','pmblocker','autostatus']],
    ['✝️ Faith',    ['bible','verse','prayer','tbj','autoverse']],
    ['💸 Prem',     ['examprep','code','mystats','remind','autostudy']],
    ['👑 Owner',    ['eval','broadcast','setmenu','botstats','ban']],
  ];
  const lines = [
    `⚡ *NovaSpark Bot v${config.botVersion}* | ${getGreeting()} | ${uptimeStr()}`,'',
  ];
  for (const [cat, list] of cats) {
    lines.push(`${cat}: ${list.map(cc => `\`${P}${cc}\``).join(' ')}`);
  }
  lines.push('', `_Prefix *${P}*  ·  \`.setmenu\` to change style_`);
  return lines.join('\n');
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLE 5 — FANCY  (star borders, emoji-heavy)
// ══════════════════════════════════════════════════════════════════════════════
function buildFancyMenu(P, sender, isPrem) {
  const num  = sender.split('@')[0];
  const plan = isPrem ? '🌟 PREMIUM MEMBER 🌟' : '🌀 FREE USER';
  const bar  = '✦✦✦✦✦━━━━━━━━━━━━━━━━✦✦✦✦✦';
  const S    = (e,t) => `\n${bar}\n${e} ✦ *${t}* ✦\n${bar}`;
  const C    = cmd => `   ✧ ${P}${cmd}`;
  return [
    `🌟🔥✨ *N O V A S P A R K  B O T* ✨🔥🌟`,
    bar,
    `   ${getGreeting()}, *${config.ownerName[0]||'User'}* 👑`,
    `   👤 +${num}  ·  ${plan}`,
    `   ⏱️ UP: ${uptimeStr()}`,
    bar,
    S('🤖','ARTIFICIAL INTELLIGENCE'),
    C('gpt <msg>  ·  gemini <msg>'),
    C('imagine <prompt>  ·  imagine2 <prompt>'),
    C('character <name>  ·  agent <task>'),
    C('vision  ·  aieyes on/off  ·  genmusic'),
    C('remini  ·  removebg  ·  codex'),
    S('📚','STUDY  &  EDUCATION'),
    C('homework <q>  ·  essay <topic>'),
    C('pdf <title>  ·  math <expr>'),
    C('summarize  ·  translate  ·  studytips'),
    S('🎮','GAMES  &  ENTERTAINMENT'),
    C('chess  ·  wordle  ·  trivia  ·  hangman'),
    C('rps  ·  akinator  ·  scramble  ·  wyr'),
    C('ship  ·  personality  ·  coinflip  ·  bet'),
    S('⬇️','DOWNLOADS'),
    C('ytmp3  ·  ytmp4  ·  ytshorts'),
    C('tiktok  ·  instagram  ·  facebook'),
    C('twitter  ·  spotify  ·  alldl'),
    S('🔧','TOOLS  &  UTILITIES'),
    C('weather  ·  news  ·  qr  ·  calc'),
    C('sticker  ·  tts  ·  currency  ·  poll'),
    C('note  ·  countdown  ·  timetable'),
    S('🛡️','GROUP  MANAGEMENT'),
    C('kick  ·  warn  ·  tagall  ·  antilink'),
    C('nightmode  ·  vip  ·  ghost  ·  slowmode'),
    C('antitoxic  ·  antispam  ·  antimedia'),
    S('⚙️','AUTO  FEATURES'),
    C('autoonline  ·  waprotect  ·  autoreply'),
    C('autobio  ·  autoschedule  ·  autopin'),
    S('✝️','FAITH  &  INSPIRATION'),
    C('bible <ref>  ·  verse  ·  prayer  ·  tbj'),
    C('autoverse  ·  autoprayer  ·  autogm'),
    S('💸','PREMIUM  ONLY'),
    C('examprep  ·  code  ·  mystats'),
    C('remind  ·  autostudy  ·  upgrade'),
    S('👑','OWNER  COMMANDS'),
    C('eval <code>  ·  broadcast  ·  botstats'),
    C('setmenu <style>  — change this menu'),
    C('setpremium  ·  ownermode  ·  ban'),
    `\n${bar}`,
    `📡 *${config.botName}* v${config.botVersion}  ·  Prefix *${P}*`,
    `👑 ${Array.isArray(config.ownerName)?config.ownerName.join(' & '):config.ownerName}`,
    `_⚡ Built by Dev-Ntando  ·  \`.setmenu\` to switch style_`,
  ].join('\n');
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLE 6 — LIST  (WhatsApp native interactive list message)
// ══════════════════════════════════════════════════════════════════════════════
const LIST_SECTIONS = [
  {
    title: '🤖 AI & Intelligence',
    rows: [
      { title: '.gpt / .gemini',       rowId: 'ai_1', description: 'ChatGPT & Google Gemini AI' },
      { title: '.imagine / .imagine2', rowId: 'ai_2', description: 'AI image generation' },
      { title: '.character <name>',    rowId: 'ai_3', description: 'Roleplay AI characters' },
      { title: '.aieyes on/off',        rowId: 'ai_4', description: 'AI vision always-on mode' },
      { title: '.remini / .removebg',  rowId: 'ai_5', description: 'Photo enhancer & BG remover' },
    ],
  },
  {
    title: '📚 Study & Tools',
    rows: [
      { title: '.homework <q>',        rowId: 'study_1', description: 'AI homework solver' },
      { title: '.essay <topic>',       rowId: 'study_2', description: 'Write a full essay' },
      { title: '.pdf <title>',         rowId: 'study_3', description: 'Generate PDF document' },
      { title: '.math <expr>',         rowId: 'study_4', description: 'Solve math problems' },
      { title: '.translate <text>',    rowId: 'study_5', description: 'Translate to any language' },
    ],
  },
  {
    title: '🎮 Games & Fun',
    rows: [
      { title: '.chess start @user',   rowId: 'game_1', description: 'Text chess in WhatsApp' },
      { title: '.wordle',              rowId: 'game_2', description: '5-letter word game' },
      { title: '.trivia',              rowId: 'game_3', description: 'Live trivia questions' },
      { title: '.rps rock',            rowId: 'game_4', description: 'Rock-paper-scissors' },
      { title: '.bet heads 100',       rowId: 'game_5', description: 'Coin bet with economy' },
    ],
  },
  {
    title: '⬇️ Downloads',
    rows: [
      { title: '.ytmp3 / .ytmp4',      rowId: 'dl_1', description: 'YouTube audio & video' },
      { title: '.tiktok <url>',        rowId: 'dl_2', description: 'TikTok no watermark' },
      { title: '.instagram <url>',     rowId: 'dl_3', description: 'Instagram post/reel' },
      { title: '.spotify <query>',     rowId: 'dl_4', description: 'Spotify track downloader' },
      { title: '.alldl <url>',         rowId: 'dl_5', description: 'Universal downloader' },
    ],
  },
  {
    title: '🛡️ Group Management',
    rows: [
      { title: '.kick / .ban',         rowId: 'grp_1', description: 'Remove or ban members' },
      { title: '.warn / .warns',       rowId: 'grp_2', description: 'Warning system' },
      { title: '.antilink on/off',     rowId: 'grp_3', description: 'Block link sharing' },
      { title: '.nightmode on',        rowId: 'grp_4', description: 'Auto-mute at night' },
      { title: '.vip on/off',          rowId: 'grp_5', description: 'VIP-only message mode' },
    ],
  },
  {
    title: '👑 Owner Commands',
    rows: [
      { title: '.setmenu <style>',     rowId: 'own_1', description: 'Switch menu style (neon/minimal/fancy/etc)' },
      { title: '.broadcast <msg>',     rowId: 'own_2', description: 'Broadcast to all groups' },
      { title: '.eval <code>',         rowId: 'own_3', description: 'Run raw JS code' },
      { title: '.botstats',            rowId: 'own_4', description: 'Full bot statistics' },
      { title: '.ownermode on/off',    rowId: 'own_5', description: 'Owner-only command mode' },
    ],
  },
];

async function sendListMenu(sock, from, msg, P) {
  try {
    await sock.sendMessage(from, {
      listMessage: {
        title:       `⚡ ${config.botName} v${config.botVersion}`,
        description: `${getGreeting()} — tap a category to browse commands.\nPrefix: *${P}*  ·  Uptime: ${uptimeStr()}`,
        footerText:  '⚡ Built by Dev-Ntando  ·  .setmenu to switch style',
        buttonText:  '📋  Browse Commands',
        listType:    1,
        sections:    LIST_SECTIONS,
      },
    }, { quoted: msg });
  } catch (_e) {
    const lines = [`📋 *${config.botName} — Interactive Menu*`, '_(Your client does not support list messages — text fallback)_', ''];
    for (const sec of LIST_SECTIONS) {
      lines.push(`*${sec.title}*`);
      for (const row of sec.rows) lines.push(`  ${row.title} — ${row.description}`);
      lines.push('');
    }
    lines.push('_Type `.setmenu` to switch style_');
    await sock.sendMessage(from, { text: lines.join('\n') }, { quoted: msg });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMAND EXPORT
// ══════════════════════════════════════════════════════════════════════════════
module.exports = {
  name:        'menu',
  aliases:     ['help', 'cmds', 'commands', 'start', 'h'],
  description: 'Show bot menu — style switchable via .setmenu',
  category:    'free',

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const P      = config.prefix || '.';
    const isPrem = true; // All users enjoy Premium for free
    const style  = (database.getSetting('menuStyle') || 'neon').toLowerCase();

    if (style === 'list') return sendListMenu(sock, from, msg, P);

    let caption;
    let useImage = false;

    switch (style) {
      case 'minimal': caption = buildMinimalMenu(P); break;
      case 'compact': caption = buildCompactMenu(P); break;
      case 'embed':   caption = buildEmbedCaption(P, sender, isPrem); useImage = true; break;
      case 'fancy':   caption = buildFancyMenu(P, sender, isPrem);    useImage = true; break;
      default:        caption = buildNeonMenu(P, sender, isPrem);      useImage = true; break;
    }

    if (useImage) {
      const imgSrc = loadMenuImage();
      try {
        await sock.sendMessage(from, { ...imgSrc, caption }, { quoted: fakevCard() });
      } catch {
        await sock.sendMessage(from, { text: caption }, { quoted: msg });
      }
    } else {
      await sock.sendMessage(from, { text: caption }, { quoted: msg });
    }
  },
};
