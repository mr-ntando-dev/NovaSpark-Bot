/**
 * NovaSpark Bot v8.0 - FULL FLAT MEGA MENU
 * One message: image + full menu as caption. No sub-menus.
 * Menu image: assets/menu_image.jpg (the gold WA shield on circuit board)
 * Owners: 263777124998 & 263786831091
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');
const fs       = require('fs');
const path     = require('path');
module.exports = {
  name: 'menu',
  aliases: ['help', 'cmds', 'commands', 'start', 'h'],
  description: 'Full flat mega menu',
  category: 'free',
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const P      = config.prefix || '.';
    const isPrem = database.isPremium ? database.isPremium(sender) : false;
    const num    = sender.split('@')[0];
    const plan   = isPrem ? '\uD83D\uDCB8 Premium Member' : '\uD83C\uDD93 Free User';
    const uptime = process.uptime();
    const hrs    = Math.floor(uptime / 3600);
    const mins   = Math.floor((uptime % 3600) / 60);
    const secs   = Math.floor(uptime % 60);
    const upStr  = `${hrs}h ${mins}m ${secs}s`;
    const memMB  = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const memTot = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
    const now = new Date().toLocaleString('en-ZA', {
      timeZone: config.timezone || 'Africa/Harare',
      weekday: 'long', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    });
    const B = '\u2501'.repeat(35);
    const D = '\u2504'.repeat(35);
    const rows = [
      '\u2554' + '='.repeat(33) + '\u2557',
      '\u2551  \u26a1 NOVASPARK BOT v' + config.botVersion + ' \u26a1  \u2551',
      '\u2551  2026 Edition | Most Advanced WA Bot  \u2551',
      '\u255a' + '='.repeat(33) + '\u255d',
      '',
      '\ud83d\udc64 *+' + num + '*',
      '\ud83d\udccc ' + plan,
      '\ud83d\udd50 ' + now,
      '\u23f1\ufe0f Uptime: ' + upStr + '  \u00b7  \ud83d\udcbe ' + memMB + '/' + memTot + ' MB',
      B,
      '',
      '\ud83e\udd16 *A I   &   I N T E L L I G E N C E*',
      D,
      '  *' + P + 'gpt <msg>*',
      '  *' + P + 'gemini <msg>*',
      '  *' + P + 'character <n> <m>*',
      '  *' + P + 'autochat on/off*',
      '  *' + P + 'imagine <prompt>*',
      '  *' + P + 'imagine2 <prompt>*',
      '  *' + P + 'remini*',
      '  *' + P + 'removebg*',
      '  *' + P + 'genmusic <prompt>*',
      B,
      '',
      '\ud83d\udcda *S T U D Y   &   S C H O O L*',
      D,
      '  *' + P + 'homework <q>*',
      '  *' + P + 'essay <topic>*',
      '  *' + P + 'summarize <text>*',
      '  *' + P + 'studytips <subj>*',
      '  *' + P + 'math <problem>*',
      '  *' + P + 'translate <l> <t>*',
      '  *' + P + 'pdf*',
      B,
      '',
      '\ud83c\udfae *G A M E S   &   C H A L L E N G E S*',
      D,
      '  *' + P + 'wordle*',
      '  *' + P + 'trivia*',
      '  *' + P + 'hangman*',
      '  *' + P + 'rps rock/paper/scissors*',
      '  *' + P + '8ball <question>*',
      '  *' + P + 'dice [N]  /  ' + P + 'flip  /  ' + P + 'roulette*',
      '  *' + P + 'truth  /  ' + P + 'dare  /  ' + P + 'wouldyourather*',
      '  *' + P + 'twotruth*',
      '  *' + P + 'nhie*',
      B,
      '',
      '\ud83d\ude02 *F U N   &   S O C I A L*',
      D,
      '  *' + P + 'joke  /  ' + P + 'meme  /  ' + P + 'riddle*',
      '  *' + P + 'roast @user  /  ' + P + 'insult @user*',
      '  *' + P + 'flirt [@user]  /  ' + P + 'compliment [@user]*',
      '  *' + P + 'ship @u1 @u2*',
      '  *' + P + 'couple @u1 @u2*',
      '  *' + P + 'vibe*',
      '  *' + P + 'rate <anything>*',
      '  *' + P + 'zodiac <sign>*',
      '  *' + P + 'horoscope <sign>*',
      '  *' + P + 'confess <msg>*',
      '  *' + P + 'waifu  /  ' + P + 'gayrate [@user]*',
      B,
      '',
      '\ud83d\udd27 *T O O L S   &   U T I L I T I E S*',
      D,
      '  *' + P + 'weather <city>*',
      '  *' + P + 'news [topic]*',
      '  *' + P + 'qr <text>*',
      '  *' + P + 'calc <expr>*',
      '  *' + P + 'bmi <kg> <cm>  /  ' + P + 'age <date>*',
      '  *' + P + 'time [zone]  /  ' + P + 'countdown <date>*',
      '  *' + P + 'currency 100 USD ZAR*',
      '  *' + P + 'convert <v> <f> <t>*',
      '  *' + P + 'color <hex/name>*',
      '  *' + P + 'lyrics <song>*',
      '  *' + P + 'truthfact*',
      '  *' + P + 'tts [lang] <text>*',
      '  *' + P + 'textart <s> <text>*',
      '  *' + P + 'encode <t> <text>*',
      '  *' + P + 'password [len]  /  ' + P + 'ip <addr>*',
      '  *' + P + 'crypto <coin>  /  ' + P + 'shorturl <url>*',
      '  *' + P + 'ssweb <url>  /  ' + P + 'define  /  ' + P + 'urban*',
      '  *' + P + 'fact / ' + P + 'catfact / ' + P + 'dogfact / ' + P + 'numberfact <N>*',
      '  *' + P + 'motivate / ' + P + 'advice / ' + P + 'quote*',
      '  *' + P + 'getpp @user  /  ' + P + 'tempnumber  /  ' + P + 'myactivity*',
      B,
      '',
      '\u2b07\ufe0f *D O W N L O A D S*',
      D,
      '  *' + P + 'ytmp3 <q/url>*',
      '  *' + P + 'ytmp4 <q/url>*',
      '  *' + P + 'tiktok / ' + P + 'instagram / ' + P + 'facebook / ' + P + 'pinterest*',
      '  *' + P + 'spotify <query>*',
      B,
      '',
      '\ud83c\udfac *M E D I A   &   V I S U A L S*',
      D,
      '  *' + P + 'sticker*',
      '  *' + P + 'simage <url>  /  ' + P + 'viewonce*',
      '  *' + P + 'remini / ' + P + 'removebg*',
      B,
      '',
      '\ud83d\udee1\ufe0f *G R O U P   M A N A G E M E N T*',
      D,
      '  *' + P + 'kick / ' + P + 'promote / ' + P + 'demote / ' + P + 'ban / ' + P + 'unban*',
      '  *' + P + 'warn / ' + P + 'warns / ' + P + 'clearwarn / ' + P + 'listwarn \ud83c\udd95*',
      '  *' + P + 'tagall / ' + P + 'hidetag / ' + P + 'tagadmins / ' + P + 'delete*',
      '  *' + P + 'mute / ' + P + 'unmute / ' + P + 'grouplink / ' + P + 'resetlink*',
      '  *' + P + 'welcome / ' + P + 'goodbye on/off*',
      '  *' + P + 'setrules <rules> \ud83c\udd95  /  ' + P + 'rules \ud83c\udd95*',
      '  *' + P + 'nightmode / ' + P + 'vip / ' + P + 'ghost on/off*',
      '  *' + P + 'antilink / ' + P + 'antitoxic / ' + P + 'antiflood / ' + P + 'antiraid*',
      '  *' + P + 'antiword / ' + P + 'antifwd / ' + P + 'antispam on/off*',
      '  *' + P + 'autokick / ' + P + 'autoreact / ' + P + 'autoreply / ' + P + 'autonudge*',
      '  *' + P + 'groupinfo / ' + P + 'groupstats / ' + P + 'membercount / ' + P + 'topmembers*',
      B,
      '',
      '\u271d\ufe0f *F A I T H   &   I N S P I R A T I O N*',
      D,
      '  *' + P + 'tbj / ' + P + 'tbj <N> / ' + P + 'tbj search <topic>*',
      '  *' + P + 'tbj quote / ' + P + 'tbj list*',
      '  *' + P + 'bible <ref>*',
      '  *' + P + 'verse / ' + P + 'prayer / ' + P + 'pray <request>*',
      '  *' + P + 'autoverse / ' + P + 'autoprayer / ' + P + 'autogm on HH:MM*',
      B,
      '',
      '\u2699\ufe0f *A U T O   F E A T U R E S*',
      D,
      '  *' + P + 'autoonline / ' + P + 'autotyping / ' + P + 'autoread*',
      '  *' + P + 'autoreply / ' + P + 'autostatus / ' + P + 'autobackup*',
      '  *' + P + 'autoleave / ' + P + 'anticall / ' + P + 'antidelete*',
      '  *' + P + 'waprotect / ' + P + 'pmblocker*',
      '  *' + P + 'autoschedule add HH:MM <msg>*',
      '  *' + P + 'autoforward set <src> <dst>*',
      '  *' + P + 'autopin on/off/keyword <word>*',
      '  *' + P + 'autotranslate on <lang>*',
      '  *' + P + 'autonuke on/off*',
      '  *' + P + 'birthday add @user DD/MM*',
      '  *' + P + 'autopollclose on/off*',
      '  *' + P + 'autoquote on/off*',
      '  *' + P + 'autosuggest on/off*',
      B,
      '',
      '\ud83e\udd77 *S T E A L T H   &   G H O S T*',
      D,
      '  *' + P + 'ghost on/off*',
      '  *' + P + 'stealth on/off*',
      '  *' + P + 'stealth delay <min> <max>*',
      '  *' + P + 'stealth presence <mode>*',
      B,
      '',
      '\ud83d\udce6 *G U I D E   &   D O W N L O A D*',
      D,
      '  *' + P + 'zip / ' + P + 'botzip / ' + P + 'guide*',
      B,
      '',
      '\ud83d\udcb8 *P R E M I U M*',
      D,
      '  *' + P + 'examprep <subject>*',
      '  *' + P + 'code <lang> <task>*',
      '  *' + P + 'remind <time> <m>*',
      '  *' + P + 'mystats / ' + P + 'setpersona / ' + P + 'autostudy*',
      '  *' + P + 'upgrade*',
      B,
      '',
      '\ud83d\udc51 *O W N E R   C O M M A N D S*',
      D,
      '  *' + P + 'shutdown / ' + P + 'restart / ' + P + 'botstats*',
      '  *' + P + 'eval <code>*',
      '  *' + P + 'broadcast / ' + P + 'announce / ' + P + 'dmowner*',
      '  *' + P + 'setpremium add/rm/list*',
      '  *' + P + 'ban / ' + P + 'unban / ' + P + 'banlist / ' + P + 'cleardb*',
      '  *' + P + 'setprefix / ' + P + 'setprofile / ' + P + 'setnick*',
      '  *' + P + 'listgroups / ' + P + 'joingroup / ' + P + 'leavegroup*',
      '  *' + P + 'ownerlist / ' + P + 'addowner / ' + P + 'removeowner*',
      '  *' + P + 'maintenance on/off*',
      '  *' + P + 'autoforward set/list/remove*',
      '  *' + P + 'autoschedule add/list/remove*',
      '  *' + P + 'birthday add/list/remove*',
      '  *' + P + 'stealth on/off/status*',
      B,
      '',
      '\ud83d\udce1 *' + config.botName + ' v' + config.botVersion + '*',
      '\ud83d\udc51 Owners: ' + (Array.isArray(config.ownerName) ? config.ownerName.join(' & ') : config.ownerName),
      '\ud83d\udccc Prefix: ' + P + '  \u00b7  \ud83c\udf0d TZ: ' + (config.timezone || 'Africa/Harare'),
      '',
      '_\ud83c\udd95 = New in v8.0  \u00b7  \ud83d\udcb8 = Premium only_',
      '_\ud83d\udce6 Type \`.zip\` for full guide download_',
      '_\u26a1 NovaSpark Bot \u2014 Built by Dev-Ntando_',
    ];
    const menuText = rows.join('\n');

    // ── Load menu image ────────────────────────────────────────────────────
    // Priority: 1) assets/menu_image.jpg  2) config.menuImagePath URL  3) fallback URL
    let imageSource = null;
    const localImgPath = path.resolve(__dirname, '../../assets/menu_image.jpg');
    const localImgJpeg = path.resolve(__dirname, '../../assets/menu_image.jpeg');
    const localImgPng  = path.resolve(__dirname, '../../assets/menu_image.png');

    if (fs.existsSync(localImgPath)) {
      imageSource = { image: fs.readFileSync(localImgPath) };
    } else if (fs.existsSync(localImgJpeg)) {
      imageSource = { image: fs.readFileSync(localImgJpeg) };
    } else if (fs.existsSync(localImgPng)) {
      imageSource = { image: fs.readFileSync(localImgPng) };
    } else if (config.menuImagePath && config.menuImagePath.startsWith('http')) {
      imageSource = { image: { url: config.menuImagePath } };
    } else {
      // Fallback: use a default branded image URL
      imageSource = { image: { url: 'https://i.imgur.com/4M7IWwP.jpeg' } };
    }

    try {
      await sock.sendMessage(from, {
        ...imageSource,
        caption: menuText,
      }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: menuText }, { quoted: msg });
    }
  },
};