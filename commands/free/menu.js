/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * MEGA MENU — .menu / .help
 * The most detailed, categorized, beautiful menu in any WhatsApp MD bot.
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');
const os       = require('os');

module.exports = {
  name: 'menu',
  aliases: ['help', 'cmds', 'commands', 'start'],
  description: 'Full command menu — categorized by section',
  category: 'free',

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const sub    = (args[0] || '').toLowerCase();
    const isPrem = database.isPremium ? database.isPremium(sender) : false;
    const num    = sender.split('@')[0];
    const plan   = isPrem ? '💎 Premium' : '🆓 Free';
    const uptime = process.uptime();
    const uptimeStr = `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m`;
    const memMB  = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    // Category sub-menus
    if (sub === 'group') {
      return reply(
        `🛡️ *Group Management Commands*\n` +
        `${'━'.repeat(32)}\n\n` +
        `📋 *Moderation*\n` +
        `  .warn @user [reason] — Warn a member\n` +
        `  .warns @user — Check warns\n` +
        `  .clearwarn @user — Reset warns\n` +
        `  .kick @user — Remove from group\n` +
        `  .promote @user — Make admin ✨\n` +
        `  .demote @user — Remove admin ✨\n` +
        `  .delete — Delete a replied message ✨\n\n` +
        `📢 *Tag & Announce*\n` +
        `  .tagall [msg] — Tag all members ✨\n` +
        `  .hidetag [msg] — Silently tag all ✨\n\n` +
        `🔒 *Safety & Protection*\n` +
        `  .antilink on/off/set — Block links ✨\n` +
        `  .antiword on/off — Bad word filter\n` +
        `  .antitoxic on/off — AI toxic filter\n` +
        `  .antispam on/off — Anti-spam\n\n` +
        `⚙️ *Settings*\n` +
        `  .welcome on/off [msg] — Welcome new members\n` +
        `  .goodbye on/off [msg] — Goodbye messages\n` +
        `  .mute / .unmute — Lock/unlock group ✨\n` +
        `  .nightmode on/off — Auto-mute at night\n` +
        `  .vip on/off — VIP-only mode\n` +
        `  .ghost on/off — Ghost mode\n` +
        `  .autoreact on/off — Auto-react\n` +
        `  .grouplink — Get invite link ✨\n` +
        `  .resetlink — Reset invite link ✨\n\n` +
        `📊 *Analytics*\n` +
        `  .groupstats — Full group analytics\n` +
        `  .groupinfo — Group info\n\n` +
        `_✨ = New in NovaSpark v5_`
      );
    }

    if (sub === 'games') {
      return reply(
        `🎮 *Games*\n` +
        `${'━'.repeat(32)}\n\n` +
        `  .wordle — 5-letter word guessing game\n` +
        `  .trivia — Live trivia from Open Trivia DB\n` +
        `  .hangman — Classic hangman game\n` +
        `  .rps rock/paper/scissors — With score tracking\n\n` +
        `_All games track your scores in your profile!_`
      );
    }

    if (sub === 'downloads') {
      return reply(
        `⬇️ *Downloaders*\n` +
        `${'━'.repeat(32)}\n\n` +
        `🎵 *Audio*\n` +
        `  .song <name/URL> — YouTube MP3 download ✨\n` +
        `  .spotify <URL> — Spotify track download ✨\n\n` +
        `🎬 *Video*\n` +
        `  .video <name/URL> — YouTube MP4 download ✨\n` +
        `  .tiktok <URL> — TikTok (no watermark) ✨\n` +
        `  .fb <URL> — Facebook video (HD/SD) ✨\n\n` +
        `📸 *Images & Social*\n` +
        `  .ig <URL> — Instagram photo/reel/video ✨\n` +
        `  .pin <URL> — Pinterest image/video ✨\n\n` +
        `_✨ = New in NovaSpark v5_`
      );
    }

    if (sub === 'ai') {
      return reply(
        `🧠 *AI Commands*\n` +
        `${'━'.repeat(32)}\n\n` +
        `💬 *Chat AI*\n` +
        `  .gpt <question> — ChatGPT-style AI ✨\n` +
        `  .gemini <question> — Google Gemini AI ✨\n` +
        `  .character <name> <msg> — Roleplay AI ✨\n` +
        `    Characters: luffy, naruto, goku, tony, sherlock, batman\n\n` +
        `🎨 *Image AI*\n` +
        `  .imagine <prompt> — AI image generation ✨\n` +
        `  .remini — AI image enhancer/upscaler ✨\n` +
        `  .removebg — AI background remover\n\n` +
        `📚 *Study AI*\n` +
        `  .autochat on/off — AI group chat replies\n` +
        `  .homework <question> — Detailed AI answer\n` +
        `  .essay <topic> — Full structured essay\n` +
        `  .summarize <text> — Bullet-point summary\n` +
        `  .studytips <subject> — AI study tips\n` +
        `  .pdf <title> | <subject> — Generate PDF\n\n` +
        `💎 *Premium AI*\n` +
        `  .examprep <subject> — Full exam revision 💎\n` +
        `  .code <lang> <task> — Generate working code 💎\n` +
        `  .setpersona <description> — Custom AI persona 💎\n\n` +
        `_✨ = New in v5  |  💎 = Premium_`
      );
    }

    if (sub === 'social') {
      return reply(
        `💬 *Social & Fun*\n` +
        `${'━'.repeat(32)}\n\n` +
        `😂 *Fun*\n` +
        `  .joke — Random joke ✨\n` +
        `  .meme — Random meme image ✨\n` +
        `  .quote — Inspirational quote ✨\n` +
        `  .lyrics <song> — Song lyrics ✨\n` +
        `  .8ball <question> — Magic 8-Ball ✨\n` +
        `  .flirt [@user] — Flirty pickup line ✨\n` +
        `  .insult [@user] — Savage roast ✨\n` +
        `  .gayrate [@user] — Vibe check ✨\n\n` +
        `💕 *Social*\n` +
        `  .ship @user1 @user2 — Love compatibility\n` +
        `  .compliment [@user] — AI compliment\n` +
        `  .truth — Truth or Dare (truth) ✨\n` +
        `  .dare — Truth or Dare (dare)\n` +
        `  .roast @user — AI personalised roast\n` +
        `  .poll Q | A | B | C — WhatsApp poll\n` +
        `  .fact — Random verified fact\n` +
        `  .urban <word> — Urban Dictionary\n\n` +
        `_✨ = New in NovaSpark v5_`
      );
    }

    if (sub === 'tools') {
      return reply(
        `🔧 *Tools & Utilities*\n` +
        `${'━'.repeat(32)}\n\n` +
        `  .ping — Bot latency & system stats ✨\n` +
        `  .vv — Reveal view-once messages ✨\n` +
        `  .ss <url> — Screenshot website ✨\n` +
        `  .simage — Sticker → image/video ✨\n` +
        `  .myactivity — Your message rank ✨\n` +
        `  .topmembers — Group leaderboard ✨\n` +
        `  .alive — Bot status card ✨\n` +
        `  .getpp [@user] — Get profile picture ✨\n` +
        `  .owner — Bot owner info ✨\n` +
        `  .calc <expression> — Scientific calculator\n` +
        `  .weather <city> — 3-day forecast\n` +
        `  .time [timezone] — World clock\n` +
        `  .motivate [@user] — Motivation quote\n` +
        `  .remind <time> <msg> — Set reminder 💎\n` +
        `  .translate <lang> <text> — Translate\n` +
        `  .currency 100 USD ZAR — Exchange rate\n` +
        `  .bmi <kg> <cm> — BMI calculator\n` +
        `  .news [topic] — Live headlines\n` +
        `  .profile [@user] — Profile card\n\n` +
        `_💎 = Premium  |  ✨ = New in v5_`
      );
    }

    if (sub === 'ai') {
      return reply(
        `🧠 *AI Commands*\n` +
        `${'━'.repeat(32)}\n\n` +
        `  .autochat on/off — Toggle AI chat replies 🧠\n` +
        `  .autochat persona <name> — Set AI personality\n` +
        `  .autochat reset — Clear conversation memory\n` +
        `  .homework <question> — Detailed AI answer\n` +
        `  .essay <topic> — Full structured essay\n` +
        `  .summarize <text> — Bullet-point summary\n` +
        `  .studytips <subject> — AI study tips\n` +
        `  .pdf <title> | <subject> — Generate PDF\n\n` +
        `💎 *Premium AI*\n` +
        `  .examprep <subject> — Full exam revision\n` +
        `  .code <lang> <task> — Generate working code\n` +
        `  .setpersona <description> — Custom AI persona\n` +
        `  .autostudy on <subject> — Daily study tips\n` +
        `  .mystats — Your personal bot analytics`
      );
    }

    // Main menu
    const now = new Date().toLocaleString('en-ZA', {
      timeZone: config.timezone, weekday:'short', month:'short', day:'numeric',
      hour:'2-digit', minute:'2-digit', hour12: false,
    });

    return reply(
      `⚡ *NovaSpark Bot v${config.botVersion}*\n` +
      `_The Most Advanced WhatsApp MD Bot — 2026 Edition_\n` +
      `${'━'.repeat(35)}\n\n` +
      `👤 *User:* +${num}\n` +
      `🏷️  *Plan:* ${plan}\n` +
      `🕐 *Time:* ${now}\n` +
      `⏱️  *Uptime:* ${uptimeStr} | 💾 ${memMB}MB\n\n` +
      `${'─'.repeat(30)}\n` +
      `📂 *Menu Categories*\n\n` +
      `  🛡️ \`.menu group\` — Group management\n` +
      `  🧠 \`.menu ai\` — AI, GPT & image AI\n` +
      `  ⬇️ \`.menu downloads\` — All downloaders ✨\n` +
      `  🎮 \`.menu games\` — Games & quizzes\n` +
      `  💬 \`.menu social\` — Social & fun\n` +
      `  🔧 \`.menu tools\` — Tools & utilities\n\n` +
      `${'─'.repeat(30)}\n` +
      `🔥 *What\'s New in v5*\n` +
      `  🔗 AntiLink — delete/warn/kick on links\n` +
      `  📢 TagAll & HideTag — bulk mentions\n` +
      `  ⬆️⬇️ Promote & Demote admins\n` +
      `  🔇 Mute/Unmute group instantly\n` +
      `  🗑️ Delete any message in group\n` +
      `  🔄 Reset/Get group invite link\n` +
      `  😂 Jokes, Memes, Lyrics, 8-Ball\n` +
      `  💌 Flirt, Insult, GayRate commands\n` +
      `  🏓 Ping with full system stats\n` +
      `  🤖 Alive status card\n` +
      `  🖼️ GetPP — fetch profile pictures\n` +
      `  📡 Broadcast to all groups\n` +
      `  📵 AntiCall — auto-reject calls\n` +
      `  💬 PM Blocker — block DMs\n` +
      `  👁️ AutoRead — mark all as read\n` +
      `  👁️ VV — reveal view-once messages\n` +
      `  📸 Sticker→Image converter\n` +
      `  📷 Screenshot any website\n` +
      `  ⬇️ YT/TikTok/IG/FB/Pinterest/Spotify\n` +
      `  🤖 GPT + Gemini + Character AI\n` +
      `  ✨ Remini AI image enhancer\n` +
      `  🎨 AI Image generation\n` +
      `  📊 Activity stats & leaderboard\n\n` +
      `${'━'.repeat(35)}\n` +
      `_⚡ Powered by Dev-Ntando | NovaSpark Bot_\n` +
      `_${config.channelLink}_`
    );
  },
};
