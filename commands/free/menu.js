/**
 * ⚡ NovaSpark Bot v6.1 — 2026 Edition
 * MEGA MENU — .menu — Fast, complete, never truncated
 *
 * Fix: Send image THEN full menu text as separate message so WhatsApp
 *      never clips content. Sub-menus still sent as single text reply.
 *
 * Sub-menus: group | ai | games | media | dl | tools | fun | inspire | auto | owner | premium
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');

const BAR  = '━'.repeat(33);
const DIVL = '┄'.repeat(33);

module.exports = {
  name: 'menu',
  aliases: ['help', 'cmds', 'commands', 'start', 'h'],
  description: 'Complete command menu — all categories',
  category: 'free',

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const sub    = (args[0] || '').toLowerCase();
    const isPrem = database.isPremium ? database.isPremium(sender) : false;
    const num    = sender.split('@')[0];
    const plan   = isPrem ? '💎 Premium' : '🆓 Free';

    const uptime    = process.uptime();
    const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
    const memMB     = Math.round(process.memoryUsage().heapUsed  / 1024 / 1024);
    const memTotal  = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
    const P         = config.prefix || '.';

    const now = new Date().toLocaleString('en-ZA', {
      timeZone: config.timezone || 'Africa/Harare',
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SUB-MENUS — sent as plain text reply (no image = no truncation risk)
    // ═══════════════════════════════════════════════════════════════════════

    if (sub === 'group') {
      return reply(
        `🛡️ *GROUP MANAGEMENT*\n${BAR}\n\n` +
        `📋 *Moderation*\n` +
        `• ${P}warn @user [reason]\n• ${P}warns @user\n• ${P}clearwarn @user\n` +
        `• ${P}setwarnlimit <N>\n• ${P}kick @user\n• ${P}promote @user\n` +
        `• ${P}demote @user\n• ${P}delete _(reply to msg)_\n• ${P}ban @user\n\n` +
        `📢 *Tag & Announce*\n` +
        `• ${P}tagall [msg]\n• ${P}hidetag [msg]\n• ${P}tagadmins [msg]\n\n` +
        `📊 *Info*\n` +
        `• ${P}groupinfo\n• ${P}groupstats\n• ${P}membercount\n• ${P}topmembers\n\n` +
        `🔒 *Protection*\n` +
        `• ${P}antilink on/off\n• ${P}antiword on/off/add/remove\n` +
        `• ${P}antitoxic on/off\n• ${P}antiflood on [limit]\n• ${P}antiraid on [limit]\n\n` +
        `⚙️ *Settings*\n` +
        `• ${P}welcome on/off [msg]\n• ${P}goodbye on/off [msg]\n` +
        `• ${P}mute / ${P}unmute\n• ${P}nightmode on [22:00] [06:00]\n` +
        `• ${P}vip on/off/add/remove/list\n• ${P}ghost on/off\n` +
        `• ${P}autoreact on/off [random/mood]\n• ${P}autoreply add <kw> | <reply>\n` +
        `• ${P}autokick join <min>\n• ${P}autonudge on <days>\n` +
        `• ${P}grouplink\n• ${P}resetlink\n\n` +
        `_⚡ NovaSpark v${config.botVersion} — Dev-Ntando_`
      );
    }

    if (sub === 'ai') {
      return reply(
        `🧠 *AI & GPT*\n${BAR}\n\n` +
        `💬 *Chat AI*\n` +
        `• ${P}gpt <question>\n• ${P}gemini <question>\n` +
        `• ${P}character <name> <msg>\n  ↳ luffy · naruto · goku · tony · sherlock · batman\n` +
        `• ${P}autochat on/off\n• ${P}autochat persona <name>\n• ${P}autochat reset\n\n` +
        `🎨 *Image AI*\n` +
        `• ${P}imagine <prompt>\n• ${P}imagine2 <prompt>\n• ${P}genmusic <prompt>\n` +
        `• ${P}remini _(reply to photo)_\n• ${P}removebg _(reply to photo)_\n\n` +
        `📚 *Study AI*\n` +
        `• ${P}homework <question>\n• ${P}essay <topic>\n• ${P}summarize <text>\n` +
        `• ${P}studytips <subject>\n• ${P}math <problem>\n• ${P}translate <lang> <text>\n\n` +
        `💎 *Premium AI*\n` +
        `• ${P}examprep <subject>\n• ${P}code <lang> <task>\n` +
        `• ${P}setpersona <description>\n• ${P}autostudy on <subject>\n\n` +
        `_⚡ NovaSpark v${config.botVersion}_`
      );
    }

    if (sub === 'games') {
      return reply(
        `🎮 *GAMES*\n${BAR}\n\n` +
        `🟩 ${P}wordle — 5-letter word guessing game\n` +
        `🧠 ${P}trivia — Live trivia (Open Trivia DB)\n` +
        `🪢 ${P}hangman — Classic hangman (ASCII art)\n` +
        `🪨 ${P}rps rock/paper/scissors\n` +
        `🎱 ${P}8ball <question>\n` +
        `🎲 ${P}dice [sides]\n` +
        `🪙 ${P}flip — coin flip\n` +
        `🎡 ${P}roulette\n` +
        `🤔 ${P}truth\n` +
        `😈 ${P}dare\n` +
        `💕 ${P}ship @u1 @u2 — love compatibility\n` +
        `🌀 ${P}wouldyourather\n` +
        `🎭 ${P}twotruth — two truths and a lie\n\n` +
        `_⚡ NovaSpark v${config.botVersion}_`
      );
    }

    if (sub === 'media') {
      return reply(
        `🎬 *MEDIA & STICKERS*\n${BAR}\n\n` +
        `🖼️ *Images & Stickers*\n` +
        `• ${P}sticker _(reply to image/video)_\n• ${P}simage <url>\n` +
        `• ${P}removebg _(reply to image)_\n• ${P}remini _(reply to photo)_\n` +
        `• ${P}imagine <prompt>\n• ${P}waifu\n\n` +
        `📸 *Screenshot*\n• ${P}ssweb <url>\n\n` +
        `🎵 *Audio*\n• ${P}tts [lang] <text>\n• ${P}ytmp3 <query/url>\n• ${P}spotify <query>\n\n` +
        `📺 *Video*\n• ${P}ytmp4 <query/url>\n• ${P}tiktok <url>\n• ${P}instagram <url>\n` +
        `• ${P}facebook <url>\n• ${P}pinterest <url>\n\n` +
        `🙏 *Inspiration Video*\n` +
        `• ${P}tbj — TB Joshua sermon clip (real video)\n` +
        `• ${P}tbj search <topic>\n` +
        `• ${P}tbj list\n\n` +
        `🎨 *Text Effects*\n• ${P}textart <style> <text>\n  ↳ bold · italic · bubble · square · flip · mirror · tiny\n\n` +
        `_⚡ NovaSpark v${config.botVersion}_`
      );
    }

    if (sub === 'downloads' || sub === 'dl') {
      return reply(
        `⬇️ *DOWNLOADS*\n${BAR}\n\n` +
        `🎵 *Audio*\n• ${P}ytmp3 <query or YouTube URL>\n• ${P}spotify <search>\n\n` +
        `📺 *Video*\n• ${P}ytmp4 <query or YouTube URL>\n• ${P}tiktok <TikTok URL>\n` +
        `• ${P}instagram <IG URL>\n• ${P}facebook <FB URL>\n• ${P}pinterest <URL>\n\n` +
        `🙏 *Faith Videos (sent as real video)*\n` +
        `• ${P}tbj — random TB Joshua clip\n` +
        `• ${P}tbj search <topic>\n` +
        `• ${P}tbj list\n` +
        `• ${P}tbj 3 — clip number 3\n\n` +
        `_⚡ NovaSpark v${config.botVersion}_`
      );
    }

    if (sub === 'tools') {
      return reply(
        `🔧 *TOOLS & UTILITIES*\n${BAR}\n\n` +
        `🌐 *Web & Info*\n` +
        `• ${P}news [topic]\n• ${P}weather <city>\n• ${P}qr <text>\n` +
        `• ${P}shorturl <url>\n• ${P}ssweb <url>\n• ${P}ip <address>\n` +
        `• ${P}crypto <coin>\n• ${P}currency 100 USD ZAR\n\n` +
        `📊 *Calculators*\n` +
        `• ${P}calc <expr> — scientific\n• ${P}bmi <kg> <cm>\n• ${P}age <birthdate>\n\n` +
        `🕐 *Time*\n• ${P}time [timezone]\n• ${P}countdown <date>\n• ${P}remind <time> <msg> 💎\n\n` +
        `📝 *Text*\n` +
        `• ${P}translate <lang> <text>\n• ${P}textart <style> <text>\n• ${P}tts [lang] <text>\n` +
        `• ${P}encode base64/url/morse <text>\n• ${P}define <word>\n• ${P}urban <word>\n\n` +
        `🔐 *Security*\n• ${P}password [length]\n• ${P}tempnumber\n\n` +
        `📱 *Profile*\n• ${P}getpp @user\n• ${P}viewonce\n\n` +
        `_⚡ NovaSpark v${config.botVersion}_`
      );
    }

    if (sub === 'fun') {
      return reply(
        `😂 *FUN & SOCIAL*\n${BAR}\n\n` +
        `😄 *Reactions*\n` +
        `• ${P}roast @user\n• ${P}insult @user\n• ${P}compliment [@user]\n` +
        `• ${P}complimentme\n• ${P}flirt [@user]\n• ${P}ship @u1 @u2\n\n` +
        `😁 *Humor*\n` +
        `• ${P}joke\n• ${P}joke2 (dad joke)\n• ${P}meme\n• ${P}riddle\n` +
        `• ${P}fact\n• ${P}catfact\n• ${P}dogfact\n• ${P}numberfact <N>\n• ${P}urban <word>\n\n` +
        `🌟 *Inspiration*\n` +
        `• ${P}motivate [@user]\n• ${P}quote\n• ${P}advice\n• ${P}horoscope <sign>\n• ${P}vibe\n\n` +
        `📊 *Fun Stats*\n` +
        `• ${P}gayrate [@user]\n• ${P}profile [@user]\n• ${P}myactivity\n• ${P}mystats 💎\n\n` +
        `_⚡ NovaSpark v${config.botVersion}_`
      );
    }

    if (sub === 'inspire' || sub === 'faith' || sub === 'church') {
      return reply(
        `🙏 *INSPIRATION & FAITH*\n${BAR}\n\n` +
        `✝️ *TB Joshua Clips (real video)*\n` +
        `• ${P}tbj — random TB Joshua clip\n` +
        `• ${P}tbj <N> — specific clip (e.g. .tbj 3)\n` +
        `• ${P}tbj search <topic> — search & download\n` +
        `• ${P}tbj quote — daily TB Joshua word\n` +
        `• ${P}tbj list — see all 10 clips\n` +
        `• ${P}tbj schedule on <HH:MM> — daily auto-clip\n` +
        `• ${P}tbj schedule off\n\n` +
        `📖 *Bible*\n` +
        `• ${P}bible <reference> — any verse (KJV)\n` +
        `• ${P}verse — today's verse\n` +
        `• ${P}autoverse on <HH:MM> — daily verse _(Owner)_\n\n` +
        `🙏 *Prayer*\n` +
        `• ${P}prayer — daily devotional prayer\n` +
        `• ${P}pray <request> — personalised prayer\n` +
        `• ${P}autoprayer on <HH:MM> — daily prayer _(Owner)_\n\n` +
        `🌅 *Daily Greetings (Owner)*\n` +
        `• ${P}autogm gm on <HH:MM> — Good Morning\n` +
        `• ${P}autogm gn on <HH:MM> — Good Night\n\n` +
        `_⚡ NovaSpark v${config.botVersion} — Dev-Ntando_`
      );
    }

    if (sub === 'auto' || sub === 'autos') {
      return reply(
        `⚙️ *ALL AUTO-FEATURES*\n${BAR}\n\n` +
        `🟢 *Presence*\n` +
        `• ${P}autoonline on/off\n• ${P}autotyping on/off\n• ${P}autoread on/off\n\n` +
        `💬 *Messaging*\n` +
        `• ${P}autopm on/off/set\n• ${P}autoreply\n• ${P}autoreplykw\n` +
        `• ${P}autostatus on/off [interval]\n• ${P}autoannounce on/off [interval]\n\n` +
        `🌅 *Schedulers*\n` +
        `• ${P}autogm gm on <HH:MM> — Good Morning\n` +
        `• ${P}autogm gn on <HH:MM> — Good Night\n` +
        `• ${P}autoverse on <HH:MM> — daily Bible verse\n` +
        `• ${P}autoprayer on <HH:MM> — daily prayer\n` +
        `• ${P}tbj schedule on <HH:MM> — daily TB Joshua clip\n\n` +
        `🛡️ *Protection*\n` +
        `• ${P}antilink on/off\n• ${P}antitoxic on/off\n` +
        `• ${P}antiflood on [limit]\n• ${P}antiraid on [limit]\n` +
        `• ${P}antidelete on/off\n• ${P}anticall on/off\n` +
        `• ${P}waprotect on/off\n• ${P}pmblocker on/off\n\n` +
        `👥 *Group Autos*\n` +
        `• ${P}welcome on/off\n• ${P}goodbye on/off\n` +
        `• ${P}autoreact on/off [random/mood]\n` +
        `• ${P}autonudge on <days>\n• ${P}autokick join <min>\n` +
        `• ${P}nightmode on\n• ${P}autoleave on/off\n\n` +
        `💾 *Maintenance*\n• ${P}autobackup on/off\n• ${P}maintenance on/off\n\n` +
        `_All autos configurable in config.js → autoFeatures {}_\n` +
        `_⚡ NovaSpark v${config.botVersion}_`
      );
    }

    if (sub === 'owner') {
      return reply(
        `👑 *OWNER COMMANDS*\n${BAR}\n\n` +
        `🔑 *Bot Control*\n` +
        `• ${P}shutdown\n• ${P}maintenance on/off [msg]\n• ${P}botstats\n` +
        `• ${P}cleardb\n• ${P}setprefix <char>\n• ${P}setprofile name/bio/pic\n\n` +
        `📣 *Broadcasting*\n• ${P}broadcast <msg>\n• ${P}announce <msg>\n• ${P}dmowner <msg>\n\n` +
        `💎 *Premium*\n• ${P}setpremium add/remove/list @user\n\n` +
        `🚫 *User Control*\n• ${P}ban @user\n• ${P}unban @user\n• ${P}banlist\n\n` +
        `⚙️ *Auto-Features*\n` +
        `• ${P}autoonline · ${P}autoread · ${P}autotyping\n` +
        `• ${P}autobackup · ${P}autoleave · ${P}anticall\n` +
        `• ${P}antidelete · ${P}waprotect · ${P}pmblocker\n\n` +
        `📅 *Schedulers*\n` +
        `• ${P}autogm gm/gn on/off <time>\n• ${P}autoverse on/off\n` +
        `• ${P}autoprayer on/off\n• ${P}tbj schedule on/off\n\n` +
        `_⚡ NovaSpark v${config.botVersion} — Owner Only_`
      );
    }

    if (sub === 'premium' || sub === 'vip') {
      return reply(
        `💎 *PREMIUM COMMANDS*\n${BAR}\n\n` +
        `📚 *Study*\n• ${P}examprep <subject>\n• ${P}autostudy on <subject>\n\n` +
        `💻 *Code*\n• ${P}code <lang> <task>\n\n` +
        `⏰ *Reminders*\n• ${P}remind <time> <msg>\n  ↳ .remind 30m Check oven\n  ↳ .remind 2h Team meeting\n\n` +
        `📊 *Analytics*\n• ${P}mystats\n• ${P}myplan\n\n` +
        `🤖 *AI*\n• ${P}setpersona <description>\n\n` +
        `📌 _Type ${P}upgrade to get Premium_\n_⚡ NovaSpark v${config.botVersion}_`
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN MEGA MENU
    // Fix: send image banner first (short caption), then full menu text
    // separately so WhatsApp never clips the content.
    // ═══════════════════════════════════════════════════════════════════════

    const header =
      `╔══════════════════════════╗\n` +
      `║  ⚡ NOVASPARK BOT v${config.botVersion} \n` +
      `║  The Most Advanced WA Bot\n` +
      `╚══════════════════════════╝`;

    const fullMenu =
      `${header}\n\n` +
      `👤 *+${num}*  |  📌 ${plan}\n` +
      `🕐 ${now}\n` +
      `⏱️ Uptime: ${uptimeStr}  |  💾 ${memMB}/${memTotal} MB\n` +
      `${BAR}\n\n` +

      `⚡ *QUICK COMMANDS*\n` +
      `• ${P}sticker — image → sticker\n` +
      `• ${P}gpt <msg> — AI chat\n` +
      `• ${P}imagine <prompt> — AI image\n` +
      `• ${P}tts <text> — voice note\n` +
      `• ${P}news — headlines\n` +
      `• ${P}weather <city> — forecast\n` +
      `• ${P}calc <expr> — calculator\n` +
      `• ${P}tbj — TB Joshua video 🆕\n` +
      `• ${P}prayer — daily prayer 🆕\n` +
      `• ${P}verse — Bible verse 🆕\n` +
      `${DIVL}\n\n` +

      `📂 *SUB-MENUS  (type .menu <name>)*\n` +
      `┌─────────────────────────────────\n` +
      `│ group   — group management\n` +
      `│ ai      — AI & GPT\n` +
      `│ games   — games\n` +
      `│ media   — media & stickers\n` +
      `│ dl      — downloaders\n` +
      `│ tools   — tools & utilities\n` +
      `│ fun     — fun & social\n` +
      `│ inspire — ✝️ faith & TB Joshua 🆕\n` +
      `│ auto    — all auto-features 🆕\n` +
      `│ premium — premium commands\n` +
      `│ owner   — owner commands\n` +
      `└─────────────────────────────────\n\n` +

      `🧠 ${P}gpt · ${P}gemini · ${P}imagine · ${P}character\n` +
      `🛡️ ${P}warn · ${P}kick · ${P}tagall · ${P}antilink\n` +
      `🎮 ${P}wordle · ${P}trivia · ${P}hangman · ${P}rps\n` +
      `🎬 ${P}sticker · ${P}tiktok · ${P}ytmp4 · ${P}ytmp3\n` +
      `✝️ ${P}tbj · ${P}bible · ${P}prayer · ${P}verse\n` +
      `🔧 ${P}weather · ${P}news · ${P}qr · ${P}calc\n` +
      `${DIVL}\n\n` +

      `_💡 .menu <category> for full details_\n` +
      `_📌 ${P}myplan — plan info_\n\n` +
      `⚡ *NovaSpark Bot — Dev-Ntando*`;

    // Send image banner with short caption, then full menu as separate text
    try {
      await sock.sendMessage(from, {
        image:   { url: 'https://i.imgur.com/4M7IWwP.jpeg' },
        caption: `⚡ *NovaSpark Bot v${config.botVersion}*\n_The Most Advanced WA Bot_`,
      }, { quoted: msg });
    } catch { /* image optional — don't fail if it can't load */ }

    // Send full menu text separately — guaranteed to show completely
    await sock.sendMessage(from, { text: fullMenu }, { quoted: msg });
  },
};
