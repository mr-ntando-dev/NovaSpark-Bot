/**
 * ⚡ NovaSpark Bot v5.3 — 2026 Edition
 * MEGA MENU — .menu / .help
 * Full command listing with NovaSpark branded image — all commands in one view
 * Updated: Added advice, dadjoke, catfact, dogfact, numfact, emoji, age, encode/decode,
 *          complimentme, vibe/spiritlevel, waifu, roulette, tagadmins, membercount
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');

module.exports = {
  name: 'menu',
  aliases: ['help', 'cmds', 'commands', 'start'],
  description: 'Full command menu with image — all commands listed',
  category: 'free',

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const sub    = (args[0] || '').toLowerCase();
    const isPrem = database.isPremium ? database.isPremium(sender) : false;
    const num    = sender.split('@')[0];
    const plan   = isPrem ? '💎 Premium' : '🆓 Free';
    const uptime = process.uptime();
    const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
    const memMB  = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    const now = new Date().toLocaleString('en-ZA', {
      timeZone: config.timezone || 'Africa/Johannesburg',
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });

    // ── SUB-MENU HANDLERS (kept for .menu group / .menu ai etc) ─────────────

    if (sub === 'group') {
      return reply(
        `🛡️ *GROUP MANAGEMENT*\n` +
        `${'━'.repeat(32)}\n\n` +
        `📋 *Moderation*\n` +
        `• .warn @user [reason]\n` +
        `• .warns @user\n` +
        `• .clearwarn @user\n` +
        `• .setwarnlimit <N>\n` +
        `• .kick @user\n` +
        `• .promote @user\n` +
        `• .demote @user\n` +
        `• .delete  _(reply to msg)_\n\n` +
        `📢 *Tag & Announce*\n` +
        `• .tagall [msg]\n` +
        `• .hidetag [msg]\n` +
        `• .tagadmins [msg]  — Mention all admins  🆕\n\n` +
        `📊 *Info*\n` +
        `• .membercount  — Member breakdown  🆕\n\n` +
        `🔒 *Protection*\n` +
        `• .antilink on/off/set\n` +
        `• .antiword on/off/add/remove\n` +
        `• .antitoxic on/off\n` +
        `• .antiflood on [limit]\n` +
        `• .antiraid on [limit]\n\n` +
        `⚙️ *Settings*\n` +
        `• .welcome on/off [msg]\n` +
        `• .goodbye on/off [msg]\n` +
        `• .mute / .unmute\n` +
        `• .nightmode on/off\n` +
        `• .vip on/off/add/remove/list\n` +
        `• .ghost on/off\n` +
        `• .autoreact on/off [random/mood]\n` +
        `• .autoreply add <kw> | <reply>\n` +
        `• .autokick join <min>\n` +
        `• .autonudge on <days>\n` +
        `• .grouplink\n` +
        `• .resetlink\n\n` +
        `📊 *Analytics*\n` +
        `• .groupstats\n` +
        `• .groupinfo\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    if (sub === 'ai') {
      return reply(
        `🧠 *AI & GPT COMMANDS*\n` +
        `${'━'.repeat(32)}\n\n` +
        `💬 *Chat AI*\n` +
        `• .gpt <question>\n` +
        `• .gemini <question>\n` +
        `• .character <name> <msg>\n` +
        `  ↳ luffy · naruto · goku · tony · sherlock · batman\n` +
        `• .autochat on/off\n` +
        `• .autochat persona <name>\n` +
        `• .autochat reset\n\n` +
        `🎨 *Image AI*\n` +
        `• .imagine <prompt>\n` +
      `• .genmusic <prompt>  🆕\n` +
        `• .remini  _(reply to photo)_\n` +
        `• .removebg  _(reply to photo)_\n\n` +
        `📚 *Study AI*\n` +
        `• .homework <question>\n` +
        `• .essay <topic>\n` +
        `• .summarize <text>\n` +
        `• .studytips <subject>\n` +
        `• .math <problem>\n` +
        `• .pdf <title> | <subject>\n\n` +
        `💎 *Premium AI*\n` +
        `• .examprep <subject>\n` +
        `• .code <lang> <task>\n` +
        `• .setpersona <description>\n` +
        `• .autostudy on <subject>\n` +
        `• .mystats\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    if (sub === 'downloads') {
      return reply(
        `⬇️ *DOWNLOADERS*\n` +
        `${'━'.repeat(32)}\n\n` +
        `🎵 *Audio*\n` +
        `• .song <name/URL>  — YouTube MP3\n` +
        `• .spotify <URL>  — Spotify track\n\n` +
        `🎬 *Video*\n` +
        `• .video <name/URL>  — YouTube MP4\n` +
        `• .yt <query>  — YouTube search\n` +
        `• .tiktok <URL>  — TikTok no-watermark\n` +
        `• .fb <URL>  — Facebook video\n\n` +
        `📸 *Images & Social*\n` +
        `• .ig <URL>  — Instagram photo/reel\n` +
        `• .pin <URL>  — Pinterest image/video\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    if (sub === 'games') {
      return reply(
        `🎮 *GAMES & FUN*\n` +
        `${'━'.repeat(32)}\n\n` +
        `🕹️ *Games*\n` +
        `• .wordle\n` +
        `• .trivia\n` +
        `• .hangman\n` +
        `• .rps rock/paper/scissors\n\n` +
        `🤔 *Party Games*\n` +
        `• .2truth  — Two Truths & A Lie\n` +
        `• .wyr  — Would You Rather\n` +
        `• .truth / .dare\n` +
        `• .riddle\n\n` +
        `_All scores saved to your profile!_\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    if (sub === 'social') {
      return reply(
        `💬 *SOCIAL & FUN*\n` +
        `${'━'.repeat(32)}\n\n` +
        `😂 *Fun*\n` +
        `• .joke\n` +
        `• .meme\n` +
        `• .quote\n` +
        `• .lyrics <song>\n` +
        `• .8ball <question>\n` +
        `• .flirt [@user]\n` +
        `• .insult [@user]\n` +
        `• .gayrate [@user]\n` +
        `• .flip\n` +
        `• .dice [n] [sides]\n` +
        `• .horoscope <sign>\n` +
        `• .riddle\n` +
        `• .dare\n\n` +
        `🆕 *v5.3 Fun*\n` +
        `• .complimentme  — Hype yourself\n` +
        `• .vibe [@user]  — Vibe check\n` +
        `• .waifu  — Random anime image\n` +
        `• .roulette  — Russian roulette (1 in 6)\n` +
        `• .dadjoke  — Dad joke / pun\n\n` +
        `💕 *Social*\n` +
        `• .ship @user1 @user2\n` +
        `• .compliment [@user]\n` +
        `• .truth\n` +
        `• .roast @user\n` +
        `• .poll Q | A | B | C\n` +
        `• .fact\n` +
        `• .urban <word>\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    if (sub === 'tools') {
      return reply(
        `🔧 *TOOLS & UTILITIES*\n` +
        `${'━'.repeat(32)}\n\n` +
        `⚙️ *Basic*\n` +
        `• .ping\n` +
        `• .alive\n` +
        `• .vv  — View-once revealer\n` +
        `• .ss <url>  — Screenshot\n` +
        `• .sticker  — Image → sticker\n` +
        `• .simage  — Sticker → image\n` +
        `• .tts <text>  — Text to speech\n` +
        `• .translate <lang> <text>\n` +
        `• .currency 100 USD ZAR\n` +
        `• .bmi <kg> <cm>\n` +
        `• .calc <expression>\n` +
        `• .weather <city>\n` +
        `• .time [timezone]\n` +
        `• .news [topic]\n` +
        `• .qr <text>\n` +
        `• .getpp [@user]\n` +
        `• .profile [@user]\n` +
        `• .motivate [@user]\n` +
        `• .myactivity\n` +
        `• .topmembers\n` +
        `• .owner\n\n` +
        `🆕 *v5.1 Tools*\n` +
        `• .password [length]\n` +
        `• .countdown <date> [name]\n` +
        `• .color #HEX\n` +
        `• .nasa\n\n` +
        `🆕 *v5.2 Tools*\n` +
        `• .define <word>\n` +
        `• .ip <address> / .myip\n` +
        `• .crypto <symbol>\n` +
        `• .bible [John 3:16/search]\n` +
        `• .short <url> / .unshort <url>\n\n` +
        `🆕 *v5.3 Tools*\n` +
        `• .advice  — Random life advice\n` +
        `• .dadjoke  — Dad joke / pun\n` +
        `• .catfact  — Random cat fact\n` +
        `• .dogfact  — Random dog fact\n` +
        `• .numfact [number]  — Number trivia\n` +
        `• .emoji <name>  — Emoji lookup\n` +
        `• .age <YYYY-MM-DD>  — Age calculator\n` +
        `• .encode <type> <text>  — base64/hex/reverse/morse\n` +
        `• .decode <type> <text>  — base64/hex/morse\n\n` +
        `💎 *Premium*\n` +
        `• .remind <time> <msg>\n` +
        `• .mystats\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    if (sub === 'owner') {
      return reply(
        `👑 *OWNER COMMANDS*\n` +
        `${'━'.repeat(32)}\n\n` +
        `🔒 *Bot Control*\n` +
        `• .shutdown\n` +
        `• .restart\n` +
        `• .maintenance on/off [msg]\n` +
        `• .ownermode on/off\n` +
        `• .setprefix <char>\n` +
        `• .resetprefix\n\n` +
        `🚫 *Ban System*\n` +
        `• .ban @user [reason]\n` +
        `• .unban @user\n` +
        `• .banlist\n\n` +
        `👤 *Bot Profile*\n` +
        `• .setname <name>\n` +
        `• .setstatus <text>\n` +
        `• .setpp  _(reply to image)_\n\n` +
        `📋 *Groups*\n` +
        `• .listgroups\n` +
        `• .leavegroup [id]\n` +
        `• .joingroup <link>\n\n` +
        `📢 *Messaging*\n` +
        `• .announce <msg>\n` +
        `• .globalannounce <msg>\n` +
        `• .broadcast <msg>\n` +
        `• .dm @user <msg>\n\n` +
        `🗄️ *Database*\n` +
        `• .cleardb list\n` +
        `• .cleardb <table>\n` +
        `• .botstats\n` +
        `• .setpremium @user\n` +
        `• .removepremium @user\n\n` +
        `🔧 *Other*\n` +
        `• .anticall on/off\n` +
        `• .antidelete on/off\n` +
        `• .autoread on/off\n` +
        `• .pmblocker on/off\n\n` +
        `🤖 *Auto Commands (v5.3)*\n` +
        `• .autotyping on/off  — Show typing indicator always\n` +
        `• .autoonline on/off  — Stay online continuously\n` +
        `• .autopm on/off/set  — Away auto-reply to DMs\n` +
        `• .autoleave on/off  — Auto-leave unauthorized groups\n` +
        `• .autobackup on/off/now  — DM yourself a DB backup\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    // ── MAIN MENU ────────────────────────────────────────────────────────────
    // Shows ALL commands in one message with NovaSpark branded image caption

    const menuText =
      `╔════════════════════════════════╗\n` +
      `║  ⚡ *NOVASPARK BOT v${config.botVersion}* ⚡  ║\n` +
      `║    *2026 EDITION — Dev-Ntando*   ║\n` +
      `╚════════════════════════════════╝\n` +
      `_✨ The Most Advanced WhatsApp MD Bot ✨_\n\n` +

      `┌─────────────────────────────────\n` +
      `│  👤 *USER INFO*\n` +
      `├─────────────────────────────────\n` +
      `│ 📱 *User   :* +${num}\n` +
      `│ 💎 *Plan   :* ${plan}\n` +
      `│ ⌨️  *Prefix :* [ *${config.prefix}* ]\n` +
      `│ 🕐 *Time   :* ${now}\n` +
      `│ ⚡ *Uptime :* ${uptimeStr}  💾 ${memMB}MB\n` +
      `│ 🤖 *Bot    :* ${config.botName}\n` +
      `│ 🌐 *Ver    :* v${config.botVersion}\n` +
      `└─────────────────────────────────\n\n` +

      `📌 *Sub-menus:* .menu group | .menu ai | .menu downloads\n` +
      `        .menu games | .menu social | .menu tools | .menu owner\n\n` +

      `${'━'.repeat(32)}\n` +
      `🧠 *AI & GPT*\n` +
      `${'━'.repeat(32)}\n` +
      `• .gpt <question>\n` +
      `• .gemini <question>\n` +
      `• .character <name> <msg>\n` +
      `• .autochat on/off\n` +
      `• .imagine <prompt>\n` +
      `• .genmusic <prompt>  🆕\n` +
      `• .remini\n` +
      `• .removebg\n` +
      `• .homework <question>\n` +
      `• .essay <topic>\n` +
      `• .summarize <text>\n` +
      `• .studytips <subject>\n` +
      `• .math <problem>\n` +
      `• .pdf <title> | <subject>\n` +
      `• .translate <lang> <text>\n` +
      `💎 .examprep / .code / .setpersona\n\n` +

      `${'━'.repeat(32)}\n` +
      `⬇️ *DOWNLOADS*\n` +
      `${'━'.repeat(32)}\n` +
      `• .song <name/URL>\n` +
      `• .video <name/URL>\n` +
      `• .yt <query>\n` +
      `• .tiktok <URL>\n` +
      `• .spotify <URL>\n` +
      `• .ig <URL>\n` +
      `• .fb <URL>\n` +
      `• .pin <URL>\n\n` +

      `${'━'.repeat(32)}\n` +
      `🎮 *GAMES*\n` +
      `${'━'.repeat(32)}\n` +
      `• .wordle\n` +
      `• .trivia\n` +
      `• .hangman\n` +
      `• .rps rock/paper/scissors\n` +
      `• .2truth\n` +
      `• .wyr\n` +
      `• .truth / .dare\n` +
      `• .riddle\n\n` +

      `${'━'.repeat(32)}\n` +
      `💬 *SOCIAL & FUN*\n` +
      `${'━'.repeat(32)}\n` +
      `• .joke / .meme / .quote\n` +
      `• .lyrics <song>\n` +
      `• .8ball <question>\n` +
      `• .flirt / .insult / .roast [@user]\n` +
      `• .compliment [@user]\n` +
      `• .complimentme  — Hype yourself  🆕\n` +
      `• .vibe [@user]  — Vibe check  🆕\n` +
      `• .waifu  — Anime image  🆕\n` +
      `• .roulette  — Russian roulette  🆕\n` +
      `• .ship @user1 @user2\n` +
      `• .gayrate [@user]\n` +
      `• .flip / .dice\n` +
      `• .horoscope <sign>\n` +
      `• .fact / .urban <word>\n` +
      `• .poll Q | A | B | C\n\n` +

      `${'━'.repeat(32)}\n` +
      `🛡️ *GROUP MANAGEMENT*\n` +
      `${'━'.repeat(32)}\n` +
      `• .warn / .warns / .clearwarn\n` +
      `• .setwarnlimit <N>\n` +
      `• .kick / .promote / .demote\n` +
      `• .mute / .unmute\n` +
      `• .tagall / .hidetag\n` +
      `• .tagadmins [msg]  — Mention all admins  🆕\n` +
      `• .membercount  — Member breakdown  🆕\n` +
      `• .antilink / .antiword\n` +
      `• .antitoxic / .antiflood\n` +
      `• .antiraid / .antidelete\n` +
      `• .autoreply / .autokick\n` +
      `• .autonudge / .autoreact\n` +
      `• .nightmode / .vip / .ghost\n` +
      `• .welcome / .goodbye\n` +
      `• .grouplink / .resetlink\n` +
      `• .groupstats / .groupinfo\n` +
      `• .delete\n\n` +

      `${'━'.repeat(32)}\n` +
      `🔧 *TOOLS*\n` +
      `${'━'.repeat(32)}\n` +
      `• .ping / .alive / .owner\n` +
      `• .vv / .ss <url> / .sticker\n` +
      `• .simage / .tts <text>\n` +
      `• .calc / .bmi / .weather\n` +
      `• .time / .news / .qr <text>\n` +
      `• .currency / .translate\n` +
      `• .getpp / .profile / .motivate\n` +
      `• .myactivity / .topmembers\n` +
      `• .password / .countdown\n` +
      `• .color #HEX / .nasa\n` +
      `• .define / .ip / .myip\n` +
      `• .crypto / .short / .unshort\n` +
      `• .advice  — Random life advice  🆕\n` +
      `• .dadjoke  — Dad joke / pun  🆕\n` +
      `• .catfact / .dogfact  🆕\n` +
      `• .numfact [number]  — Number trivia  🆕\n` +
      `• .emoji <name>  — Emoji lookup  🆕\n` +
      `• .age <YYYY-MM-DD>  🆕\n` +
      `• .encode <type> <text>  🆕\n` +
      `• .decode <type> <text>  🆕\n` +
      `💎 .remind / .mystats\n\n` +

      `${'━'.repeat(32)}\n` +
      `👑 *OWNER ONLY*\n` +
      `${'━'.repeat(32)}\n` +
      `• .shutdown / .restart\n` +
      `• .maintenance / .ownermode\n` +
      `• .setprefix / .setname\n` +
      `• .setstatus / .setpp\n` +
      `• .ban / .unban / .banlist\n` +
      `• .broadcast / .announce\n` +
      `• .globalannounce / .dm\n` +
      `• .setpremium / .removepremium\n` +
      `• .listgroups / .leavegroup\n` +
      `• .joingroup / .botstats\n` +
      `• .cleardb / .anticall\n` +
      `• .autoread / .pmblocker\n` +
      `🤖 *Auto:* .autotyping / .autoonline\n` +
      `🤖 *Auto:* .autopm / .autoleave / .autobackup\n\n` +

      `${'━'.repeat(32)}\n` +
      `📋 *.bmenu* — *Interactive tap menu*\n` +
      `${'━'.repeat(32)}\n\n` +
      `🆕 *v5.3 New Commands:*\n` +
      `• .advice • .dadjoke • .catfact • .dogfact\n` +
      `• .numfact • .emoji • .age • .encode • .decode\n` +
      `• .complimentme • .vibe • .waifu • .roulette\n` +
      `• .tagadmins • .membercount\n\n` +
      `${'━'.repeat(32)}\n` +
      `_⚡ Powered by *Dev-Ntando* | *NovaSpark Bot v${config.botVersion}*_\n` +
      `_${config.channelLink || 'https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A'}_`;

    // ── IMAGE SOURCES ─────────────────────────────────────────────────────────
    // NovaSpark Bot branded menu image — AI-generated circuit/lightning logo
    // Fallback chain: multiple CDN mirrors → plain text
    const MENU_IMAGES = [
      // NovaSpark themed cyberpunk/circuit bot images (no SubZero branding)
      'https://image.pollinations.ai/prompt/novaspark%20bot%20logo%2C%20electric%20lightning%20bolt%20letter%20N%2C%20gold%20and%20electric%20blue%2C%20cyberpunk%20circuit%20board%2C%20dark%20background%2C%20glowing%20neon%2C%20professional%20logo%2C%204k%20sharp?width=512&height=768&nologo=true&seed=42',
      'https://image.pollinations.ai/prompt/futuristic%20whatsapp%20bot%20menu%20screen%2C%20NovaSpark%20Bot%2C%20gold%20metallic%20logo%2C%20electric%20blue%20lightning%2C%20circuit%20board%20background%2C%20dark%20tech%20aesthetic%2C%20ultra%20HD?width=512&height=768&nologo=true&seed=77',
      'https://image.pollinations.ai/prompt/N%20letter%20logo%2C%20electric%20spark%2C%20gold%20and%20blue%20neon%2C%20dark%20background%2C%20WhatsApp%20bot%2C%20cyberpunk%20futuristic%2C%20glowing%20circuit%20lines?width=512&height=768&nologo=true&seed=99',
    ];

    try {
      const imgUrl = MENU_IMAGES[Math.floor(Math.random() * MENU_IMAGES.length)];

      await sock.sendMessage(
        from,
        { image: { url: imgUrl }, caption: menuText, mimetype: 'image/jpeg' },
        { quoted: msg }
      );
    } catch {
      // If image fails, send plain text
      return reply(menuText);
    }
  },
};
