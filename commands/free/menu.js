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
  const plan = isPrem ? '\ud83d\udcb8 Premium' : '\ud83c\udd93 Free';
  return [
    `\u26a1 *NOVASPARK BOT* \u26a1`,
    '\u2501'.repeat(22),
    `\ud83d\udc64 +${num}  |  ${plan}`,
    `\u23f1\ufe0f ${uptimeStr()}  |  ${getGreeting()}`,
    '\u2501'.repeat(22),'',
    `\ud83e\udd16 *AI* \u2014 gpt \u00b7 gemini \u00b7 character \u00b7 agent \u00b7 persona`,
    `   imagine \u00b7 imagine2 \u00b7 imggen \u00b7 aieyes \u00b7 vision`,
    `   remini \u00b7 removebg \u00b7 docanalyze \u00b7 genmusic \u00b7 codex`,
    `\ud83d\udcda *Study* \u2014 homework \u00b7 essay \u00b7 summarize \u00b7 translate`,
    `   studytips \u00b7 pdf \u00b7 math \u00b7 urban \u00b7 fact`,
    `\ud83c\udfae *Games* \u2014 chess \u00b7 wordle \u00b7 trivia \u00b7 hangman \u00b7 rps`,
    `   scramble \u00b7 akinator \u00b7 mathquiz \u00b7 numguess \u00b7 typingtest`,
    `   quiz20 \u00b7 8ball \u00b7 dice \u00b7 bet \u00b7 wallet \u00b7 richlist`,
    `\ud83d\ude02 *Fun* \u2014 joke \u00b7 riddle \u00b7 meme \u00b7 wyr \u00b7 truth \u00b7 dare`,
    `   compliment \u00b7 insult \u00b7 roast \u00b7 flirt \u00b7 ship \u00b7 couple`,
    `   horoscope \u00b7 personality \u00b7 typeracer \u00b7 emojiart`,
    `\u2b07\ufe0f *Downloads* \u2014 ytmp3 \u00b7 ytmp4 \u00b7 tiktok \u00b7 instagram`,
    `   facebook \u00b7 twitter \u00b7 threads \u00b7 reddit \u00b7 spotify`,
    `   soundcloud \u00b7 gdrive \u00b7 mediafire \u00b7 apk \u00b7 alldl`,
    `\ud83d\udd27 *Tools* \u2014 weather \u00b7 news \u00b7 qr \u00b7 calc \u00b7 currency`,
    `   tts \u00b7 sticker \u00b7 poll \u00b7 ping \u00b7 profile \u00b7 base64`,
    `   hash \u00b7 textstats \u00b7 palindrome \u00b7 randomcolor \u00b7 pwcheck`,
    `   notes \u00b7 reminder \u00b7 shorturl \u00b7 crypto \u00b7 dictionary`,
    `\ud83d\udee1\ufe0f *Group* \u2014 kick \u00b7 promote \u00b7 demote \u00b7 warn \u00b7 warnlist`,
    `   tagall \u00b7 antilink \u00b7 antitoxic \u00b7 antispam \u00b7 antibot`,
    `   nightmode \u00b7 vip \u00b7 ghost \u00b7 slowmode \u00b7 groupstats`,
    `   groupannounce \u00b7 grouppoll \u00b7 inactive \u00b7 autoreact`,
    `\u2699\ufe0f *Auto* \u2014 autoonline \u00b7 autoreply \u00b7 autobio \u00b7 autoread`,
    `   autostatus \u00b7 waprotect \u00b7 pmblocker \u00b7 anticall`,
    `\u271d\ufe0f *Faith* \u2014 bible \u00b7 verse \u00b7 prayer \u00b7 tbj \u00b7 motivate \u00b7 affirm`,
    `\ud83d\udcb8 *Premium* \u2014 examprep \u00b7 code \u00b7 remind \u00b7 mystats \u00b7 autostudy`,
    `\ud83d\udc51 *Owner* \u2014 eval \u00b7 broadcast \u00b7 setmenu \u00b7 botstats \u00b7 cmdstats`,
    `   togglecmd \u00b7 setbotname \u00b7 ban \u00b7 maintenance \u00b7 analytics`,'',
    `\ud83d\udce1 *${config.botName}* v${config.botVersion}  \u00b7  Prefix *${P}*`,
    `_\u26a1 Built by Dev-Ntando  \u00b7  \`.setmenu\` to switch style_`,
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
  const plan = isPrem ? '\u2b50 PREMIUM MEMBER \u2b50' : '\ud83c\udf00 FREE USER';
  const bar  = '\u2736\u2736\u2736\u2736\u2736\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2736\u2736\u2736\u2736\u2736';
  const S    = (e,t) => `\n${bar}\n${e} \u2736 *${t}* \u2736\n${bar}`;
  const C    = cmd => `   \u2727 ${P}${cmd}`;
  return [
    `\ud83c\udf1f\ud83d\udd25\u2728 *N O V A S P A R K  B O T* \u2728\ud83d\udd25\ud83c\udf1f`,
    bar,
    `   ${getGreeting()}, *${config.ownerName[0]||'User'}* \ud83d\udc51`,
    `   \ud83d\udc64 +${num}  \u00b7  ${plan}`,
    `   \u23f1\ufe0f UP: ${uptimeStr()}`,
    bar,
    S('\ud83e\udd16','ARTIFICIAL INTELLIGENCE'),
    C('gpt <msg>  \u00b7  gemini <msg>  \u00b7  character <name>'),
    C('agent <task>  \u00b7  persona <name>  \u00b7  memory on/off'),
    C('autochat  \u00b7  multilang  \u00b7  voicechat  \u00b7  codex'),
    C('imagine <prompt>  \u00b7  imagine2  \u00b7  imggen'),
    C('vision  \u00b7  aieyes  \u00b7  docanalyze  \u00b7  genmusic'),
    C('remini  \u00b7  removebg'),
    S('\ud83d\udcda','STUDY  &  EDUCATION'),
    C('homework <q>  \u00b7  essay <topic>  \u00b7  pdf <title>'),
    C('math <expr>  \u00b7  summarize  \u00b7  translate'),
    C('studytips <subject>  \u00b7  urban  \u00b7  fact'),
    S('\ud83c\udfae','GAMES  &  ENTERTAINMENT'),
    C('chess  \u00b7  wordle  \u00b7  trivia  \u00b7  hangman  \u00b7  rps'),
    C('scramble  \u00b7  akinator  \u00b7  mathquiz  \u00b7  numguess'),
    C('typingtest  \u00b7  quiz20  \u00b7  typeracer'),
    C('8ball  \u00b7  dice  \u00b7  coinflip  \u00b7  bet  \u00b7  wallet  \u00b7  richlist'),
    S('\ud83d\ude02','FUN  &  SOCIAL'),
    C('joke  \u00b7  dadjoke  \u00b7  riddle  \u00b7  meme  \u00b7  wyr  \u00b7  truth  \u00b7  dare'),
    C('compliment  \u00b7  insult  \u00b7  roast  \u00b7  flirt  \u00b7  ship  \u00b7  couple'),
    C('horoscope  \u00b7  zodiac  \u00b7  personality  \u00b7  gayrate  \u00b7  rate'),
    C('fortunecookie  \u00b7  quote  \u00b7  emojiart  \u00b7  spiritlevel'),
    S('\u2b07\ufe0f','DOWNLOADS'),
    C('ytmp3  \u00b7  ytmp4  \u00b7  ytshorts'),
    C('tiktok  \u00b7  instagram  \u00b7  facebook  \u00b7  twitter'),
    C('threads  \u00b7  reddit  \u00b7  soundcloud  \u00b7  spotify'),
    C('gdrive  \u00b7  mediafire  \u00b7  apk  \u00b7  capcut  \u00b7  alldl'),
    S('\ud83d\udd27','TOOLS  &  UTILITIES'),
    C('weather  \u00b7  news  \u00b7  qr  \u00b7  calc  \u00b7  currency  \u00b7  convert'),
    C('tts  \u00b7  sticker  \u00b7  poll  \u00b7  poll2  \u00b7  countdown  \u00b7  ping'),
    C('profile  \u00b7  alive  \u00b7  shorturl  \u00b7  summarizelink'),
    C('base64  \u00b7  hash  \u00b7  textstats  \u00b7  palindrome  \u00b7  randomcolor'),
    C('pwcheck  \u00b7  password  \u00b7  ip  \u00b7  whois  \u00b7  scam  \u00b7  encode'),
    C('notes  \u00b7  reminder  \u00b7  schedmsg  \u00b7  timetable  \u00b7  time  \u00b7  age'),
    C('crypto  \u00b7  wordofday  \u00b7  numberfact  \u00b7  catfact  \u00b7  dogfact'),
    S('\ud83d\udee1\ufe0f','GROUP  MANAGEMENT'),
    C('kick  \u00b7  promote  \u00b7  demote  \u00b7  warn  \u00b7  warnlist  \u00b7  clearwarn'),
    C('tagall  \u00b7  hidetag  \u00b7  tagadmins  \u00b7  delete  \u00b7  mute  \u00b7  unmute'),
    C('antilink  \u00b7  antitoxic  \u00b7  antispam  \u00b7  antiflood  \u00b7  antiraid'),
    C('antiword  \u00b7  antimedia  \u00b7  antibot  \u00b7  nightmode  \u00b7  vip'),
    C('ghost  \u00b7  slowmode  \u00b7  smartmod  \u00b7  groupstats  \u00b7  membercount'),
    C('groupannounce  \u00b7  grouppoll  \u00b7  inactive  \u00b7  autoreact'),
    C('welcome  \u00b7  setrules  \u00b7  grouprules  \u00b7  resetlink  \u00b7  pinmsg'),
    S('\u2699\ufe0f','AUTO  FEATURES'),
    C('autoonline  \u00b7  autotyping  \u00b7  autoread  \u00b7  autoreply'),
    C('autobio  \u00b7  autostatus  \u00b7  autobackup  \u00b7  autoleave'),
    C('autoforward  \u00b7  autoschedule  \u00b7  autopin  \u00b7  autonuke'),
    C('waprotect  \u00b7  pmblocker  \u00b7  anticall  \u00b7  antidelete  \u00b7  stealth'),
    S('\u271d\ufe0f','FAITH  &  INSPIRATION'),
    C('bible <ref>  \u00b7  verse  \u00b7  prayer  \u00b7  tbj'),
    C('autoverse  \u00b7  autoprayer  \u00b7  autogm  \u00b7  motivate  \u00b7  affirm'),
    S('\ud83d\udcb8','PREMIUM  ONLY'),
    C('examprep <subject>  \u00b7  code <lang> <task>'),
    C('remind <time> <msg>  \u00b7  mystats  \u00b7  autostudy  \u00b7  upgrade'),
    S('\ud83d\udc51','OWNER  COMMANDS'),
    C('eval <code>  \u00b7  broadcast  \u00b7  announce  \u00b7  botstats'),
    C('setmenu <style>  \u2014 change this menu'),
    C('setpremium  \u00b7  setbotname  \u00b7  setnick  \u00b7  setprefix'),
    C('ban  \u00b7  unban  \u00b7  ownermode  \u00b7  maintenance  \u00b7  analytics'),
    C('cmdstats  \u00b7  togglecmd  \u00b7  clearchat  \u00b7  webhook'),
    `\n${bar}`,
    `\ud83d\udce1 *${config.botName}* v${config.botVersion}  \u00b7  Prefix *${P}*`,
    `\ud83d\udc51 ${Array.isArray(config.ownerName)?config.ownerName.join(' & '):config.ownerName}`,
    `_\u26a1 Built by Dev-Ntando  \u00b7  \`.setmenu\` to switch style_`,
  ].join('\n');
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// STYLE 6 \u2014 LIST  (WhatsApp native interactive list message \u2014 ALL commands)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
const LIST_SECTIONS = [
  {
    title: '\ud83e\udd16 AI & Intelligence',
    rows: [
      { title: '.gpt / .gemini',          rowId: 'ai_1',  description: 'ChatGPT & Google Gemini AI' },
      { title: '.character <name>',        rowId: 'ai_2',  description: 'Roleplay as any AI character' },
      { title: '.agent <task>',            rowId: 'ai_3',  description: 'AI autonomous agent' },
      { title: '.persona / .memory',       rowId: 'ai_4',  description: 'Custom AI persona & memory' },
      { title: '.imagine / .imagine2',     rowId: 'ai_5',  description: 'AI image generation' },
      { title: '.imggen <prompt>',         rowId: 'ai_6',  description: 'Advanced image generation' },
      { title: '.aieyes on/off',           rowId: 'ai_7',  description: 'AI vision always-on mode' },
      { title: '.vision / .docanalyze',    rowId: 'ai_8',  description: 'Analyze images & documents' },
      { title: '.remini / .removebg',      rowId: 'ai_9',  description: 'Photo enhancer & BG remover' },
      { title: '.genmusic <prompt>',       rowId: 'ai_10', description: 'Generate music with AI' },
      { title: '.codex <code>',            rowId: 'ai_11', description: 'AI code explainer' },
      { title: '.autochat / .voicechat',   rowId: 'ai_12', description: 'Always-on AI chat & voice' },
    ],
  },
  {
    title: '\ud83d\udcda Study & Tools',
    rows: [
      { title: '.homework <q>',            rowId: 'study_1', description: 'AI homework solver' },
      { title: '.essay <topic>',           rowId: 'study_2', description: 'Write a full essay' },
      { title: '.pdf <title>',             rowId: 'study_3', description: 'Generate PDF document' },
      { title: '.math <expression>',       rowId: 'study_4', description: 'Solve math problems' },
      { title: '.summarize <text>',        rowId: 'study_5', description: 'Bullet-point summary' },
      { title: '.translate <text>',        rowId: 'study_6', description: 'Translate to any language' },
      { title: '.studytips <subject>',     rowId: 'study_7', description: 'AI study tips' },
      { title: '.urban <word>',            rowId: 'study_8', description: 'Urban dictionary lookup' },
      { title: '.fact',                    rowId: 'study_9', description: 'Random fact of the day' },
    ],
  },
  {
    title: '\ud83c\udfae Games',
    rows: [
      { title: '.chess start @user',       rowId: 'game_1', description: 'Text chess in WhatsApp' },
      { title: '.wordle',                  rowId: 'game_2', description: '5-letter word game' },
      { title: '.trivia',                  rowId: 'game_3', description: 'Live trivia questions' },
      { title: '.hangman',                 rowId: 'game_4', description: 'Classic hangman game' },
      { title: '.rps rock/paper/scissors', rowId: 'game_5', description: 'Rock Paper Scissors' },
      { title: '.scramble',                rowId: 'game_6', description: 'Unscramble the word' },
      { title: '.akinator',                rowId: 'game_7', description: 'Akinator mind reader' },
      { title: '.mathquiz [easy/hard]',    rowId: 'game_8', description: 'Timed math quiz game' },
      { title: '.numguess',                rowId: 'game_9', description: 'Number guessing game 1-100' },
      { title: '.typingtest',              rowId: 'game_10', description: 'Test your WPM typing speed' },
      { title: '.quiz20',                  rowId: 'game_11', description: '20 Questions guessing game' },
      { title: '.bet heads 100',           rowId: 'game_12', description: 'Coin bet with economy' },
    ],
  },
  {
    title: '\ud83d\ude02 Fun & Social',
    rows: [
      { title: '.joke / .dadjoke',         rowId: 'fun_1', description: 'Random jokes' },
      { title: '.riddle',                  rowId: 'fun_2', description: 'Guess the riddle' },
      { title: '.meme',                    rowId: 'fun_3', description: 'Random meme' },
      { title: '.wyr',                     rowId: 'fun_4', description: 'Would you rather?' },
      { title: '.truth / .dare',           rowId: 'fun_5', description: 'Truth or dare questions' },
      { title: '.compliment / .insult',    rowId: 'fun_6', description: 'Compliment or insult @user' },
      { title: '.roast / .flirt',          rowId: 'fun_7', description: 'AI roast & flirt messages' },
      { title: '.ship @user1 @user2',      rowId: 'fun_8', description: 'Compatibility checker' },
      { title: '.horoscope / .zodiac',     rowId: 'fun_9', description: 'Daily horoscope & zodiac' },
      { title: '.typeracer',               rowId: 'fun_10', description: 'Group typing race game' },
      { title: '.emojiart <text>',         rowId: 'fun_11', description: 'Convert text to emoji art' },
      { title: '.fortunecookie / .quote',  rowId: 'fun_12', description: 'Fortune cookie & quotes' },
    ],
  },
  {
    title: '\u2b07\ufe0f Downloads',
    rows: [
      { title: '.ytmp3 / .ytmp4',          rowId: 'dl_1', description: 'YouTube audio & video' },
      { title: '.ytshorts <url>',          rowId: 'dl_2', description: 'YouTube Shorts downloader' },
      { title: '.tiktok <url>',            rowId: 'dl_3', description: 'TikTok no watermark' },
      { title: '.instagram <url>',         rowId: 'dl_4', description: 'Instagram post/reel' },
      { title: '.facebook <url>',          rowId: 'dl_5', description: 'Facebook video downloader' },
      { title: '.twitter <url>',           rowId: 'dl_6', description: 'Twitter/X video downloader' },
      { title: '.threads <url>',           rowId: 'dl_7', description: 'Threads media downloader' },
      { title: '.reddit <url>',            rowId: 'dl_8', description: 'Reddit post downloader' },
      { title: '.spotify <query>',         rowId: 'dl_9', description: 'Spotify track downloader' },
      { title: '.soundcloud <url>',        rowId: 'dl_10', description: 'SoundCloud downloader' },
      { title: '.gdrive / .mediafire',     rowId: 'dl_11', description: 'Cloud file downloaders' },
      { title: '.alldl <url>',             rowId: 'dl_12', description: 'Universal media downloader' },
    ],
  },
  {
    title: '\ud83d\udd27 Tools & Utilities',
    rows: [
      { title: '.weather <city>',          rowId: 'tool_1', description: 'Live weather forecast' },
      { title: '.news [topic]',            rowId: 'tool_2', description: 'Latest news headlines' },
      { title: '.qr <text>',               rowId: 'tool_3', description: 'Generate a QR code' },
      { title: '.calc <expression>',       rowId: 'tool_4', description: 'Advanced calculator' },
      { title: '.currency 100 USD ZAR',    rowId: 'tool_5', description: 'Live currency converter' },
      { title: '.tts [lang] <text>',       rowId: 'tool_6', description: 'Text to speech audio' },
      { title: '.base64 encode/decode',    rowId: 'tool_7', description: 'Base64 encoder/decoder' },
      { title: '.hash sha256 <text>',      rowId: 'tool_8', description: 'Cryptographic hash generator' },
      { title: '.textstats <text>',        rowId: 'tool_9', description: 'Word/char/reading time stats' },
      { title: '.palindrome <text>',       rowId: 'tool_10', description: 'Check if text is palindrome' },
      { title: '.randomcolor',             rowId: 'tool_11', description: 'Random HEX/RGB/HSL color' },
      { title: '.pwcheck <password>',      rowId: 'tool_12', description: 'Password strength checker' },
    ],
  },
  {
    title: '\ud83d\udee1\ufe0f Group Management',
    rows: [
      { title: '.kick / .ban',             rowId: 'grp_1', description: 'Remove or ban members' },
      { title: '.warn / .warnlist',        rowId: 'grp_2', description: 'Warning system & list' },
      { title: '.promote / .demote',       rowId: 'grp_3', description: 'Manage admin roles' },
      { title: '.tagall / .hidetag',       rowId: 'grp_4', description: 'Tag everyone silently' },
      { title: '.antilink / .antispam',    rowId: 'grp_5', description: 'Block links & spam' },
      { title: '.antibot on/off',          rowId: 'grp_6', description: 'Auto-kick bots on join' },
      { title: '.nightmode / .vip',        rowId: 'grp_7', description: 'Night lock & VIP-only mode' },
      { title: '.ghost / .slowmode',       rowId: 'grp_8', description: 'Ghost mode & slow mode' },
      { title: '.groupannounce <msg>',     rowId: 'grp_9', description: 'Pinned-style announcement' },
      { title: '.grouppoll Q | A | B',     rowId: 'grp_10', description: 'Native WhatsApp poll' },
      { title: '.inactive [days]',         rowId: 'grp_11', description: 'Find inactive/ghost members' },
      { title: '.groupstats / .leaderboard', rowId: 'grp_12', description: 'Group stats & top members' },
    ],
  },
  {
    title: '\u2699\ufe0f Auto Features',
    rows: [
      { title: '.autoonline / .autoread',  rowId: 'auto_1', description: 'Always online & read receipts' },
      { title: '.autoreply',               rowId: 'auto_2', description: 'Auto-reply to messages' },
      { title: '.autobio',                 rowId: 'auto_3', description: 'Auto update bio' },
      { title: '.waprotect on/off',        rowId: 'auto_4', description: 'WhatsApp account protection' },
      { title: '.pmblocker on/off',        rowId: 'auto_5', description: 'Block unknown DMs' },
    ],
  },
  {
    title: '\u271d\ufe0f Faith & Inspiration',
    rows: [
      { title: '.bible <reference>',       rowId: 'faith_1', description: 'Fetch a Bible verse' },
      { title: '.verse',                   rowId: 'faith_2', description: 'Random verse of the day' },
      { title: '.prayer',                  rowId: 'faith_3', description: 'Daily prayer message' },
      { title: '.tbj',                     rowId: 'faith_4', description: 'TBJ daily devotional' },
      { title: '.motivate',                rowId: 'faith_5', description: 'Daily motivational quote' },
      { title: '.affirm',                  rowId: 'faith_6', description: 'Positive daily affirmation' },
    ],
  },
  {
    title: '\ud83d\udcb8 Premium Commands',
    rows: [
      { title: '.examprep <subject>',      rowId: 'prem_1', description: 'AI exam preparation' },
      { title: '.code <lang> <task>',      rowId: 'prem_2', description: 'AI code generator' },
      { title: '.remind <time> <msg>',     rowId: 'prem_3', description: 'Set smart reminders' },
      { title: '.mystats',                 rowId: 'prem_4', description: 'Your detailed bot stats' },
      { title: '.autostudy',               rowId: 'prem_5', description: 'Auto study scheduler' },
    ],
  },
  {
    title: '\ud83d\udc51 Owner Commands',
    rows: [
      { title: '.setmenu <style>',         rowId: 'own_1', description: 'Switch menu style (neon/list/etc)' },
      { title: '.broadcast <msg>',         rowId: 'own_2', description: 'Broadcast to all groups' },
      { title: '.eval <code>',             rowId: 'own_3', description: 'Run raw JavaScript code' },
      { title: '.botstats',                rowId: 'own_4', description: 'Full bot statistics' },
      { title: '.cmdstats',                rowId: 'own_5', description: 'Top used commands' },
      { title: '.togglecmd <command>',     rowId: 'own_6', description: 'Enable/disable any command' },
      { title: '.setbotname <name>',       rowId: 'own_7', description: 'Change bot display name' },
      { title: '.maintenance on/off',      rowId: 'own_8', description: 'Maintenance mode' },
      { title: '.ban / .unban',            rowId: 'own_9', description: 'Global ban/unban users' },
      { title: '.analytics',               rowId: 'own_10', description: 'Bot usage analytics' },
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
// DYNAMIC COMMAND LISTER — reads all commands from disk, groups by category
// ══════════════════════════════════════════════════════════════════════════════
function buildDynamicCmdList(P) {
  const cmdDir = path.resolve(__dirname, '..');
  const categoryEmoji = {
    ai: '🤖', downloads: '⬇️', free: '🆓', fun: '🎉',
    games: '🎮', general: '📊', group: '🛡️', media: '🎬',
    owner: '👑', premium: '💸', social: '🤝', tools: '🔧',
  };
  const groups = {};
  try {
    const cats = fs.readdirSync(cmdDir).filter(c => fs.statSync(path.join(cmdDir, c)).isDirectory());
    for (const cat of cats) {
      const files = fs.readdirSync(path.join(cmdDir, cat)).filter(f => f.endsWith('.js'));
      const cmds = [];
      for (const f of files) {
        try {
          const content = fs.readFileSync(path.join(cmdDir, cat, f), 'utf-8');
          const nm = content.match(/(?:^|\n)\s*name\s*:\s*['"`]([^'"`]+)['"`]/m);
          if (nm) cmds.push(nm[1].toLowerCase());
        } catch {}
      }
      if (cmds.length) groups[cat] = cmds;
    }
  } catch {}
  const lines = [`⚡ *${config.botName} v${config.botVersion} — Full Command List*`, `Prefix: *${P}*  |  ${uptimeStr()}`, ''];
  for (const [cat, cmds] of Object.entries(groups)) {
    const emoji = categoryEmoji[cat] || '📌';
    lines.push(`${emoji} *${cat.toUpperCase()}*`);
    // chunk cmds into rows of 4
    for (let i = 0; i < cmds.length; i += 4) {
      lines.push('  ' + cmds.slice(i, i + 4).map(c => `${P}${c}`).join('  ·  '));
    }
    lines.push('');
  }
  lines.push(`_Type ${P}menu for the styled menu_`);
  return lines.join('\n');
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMAND EXPORT
// ══════════════════════════════════════════════════════════════════════════════
module.exports = {
  name:        'menu',
  aliases:     ['help', 'cmds', 'commands', 'start', 'h', 'cmdlist', 'allcmds'],
  description: 'Show bot menu — .menu all for complete list',
  category:    'free',

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const P      = config.prefix || '.';
    const isPrem = true; // All users enjoy Premium for free
    const style  = (database.getSetting('menuStyle') || 'neon').toLowerCase();

    // .menu all — dynamic full list from disk
    if (args[0] === 'all' || args[0] === 'full' || args[0] === 'list') {
      return sock.sendMessage(from, { text: buildDynamicCmdList(P) }, { quoted: msg });
    }

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

    // Append tip about full list
    caption += `\n\n_💡 Type *${P}menu all* to see every single command_`;

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
