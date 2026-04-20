/**
 * ⚡ NovaSpark Bot v4 — 2026 Edition
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
        `  .promote @user — Make admin\n` +
        `  .demote @user — Remove admin\n\n` +
        `🔒 *Safety*\n` +
        `  .antilink on/off — Block links\n` +
        `  .antiword on/off — Bad word filter\n` +
        `  .antitoxic on/off — AI toxic filter 🆕\n` +
        `  .antispam on/off — Anti-spam\n\n` +
        `⚙️ *Settings*\n` +
        `  .welcome on/off [msg] — Welcome new members\n` +
        `  .goodbye on/off [msg] — Goodbye messages\n` +
        `  .nightmode on/off [start] [end] — Auto-mute at night 🆕\n` +
        `  .vip on/off — VIP-only mode 🆕\n` +
        `  .vip add/remove @user — Manage VIP list 🆕\n` +
        `  .ghost on/off — Ghost mode 🆕\n` +
        `  .autoreact on/off [mode] — Auto-react 🆕\n` +
        `  .mute / .unmute — Mute/unmute group\n\n` +
        `📊 *Analytics*\n` +
        `  .groupstats — Full group analytics 🆕\n` +
        `  .groupinfo — Group info\n\n` +
        `_🆕 = Exclusive NovaSpark v4 feature_`
      );
    }

    if (sub === 'games') {
      return reply(
        `🎮 *Games*\n` +
        `${'━'.repeat(32)}\n\n` +
        `  .wordle — 5-letter word guessing game 🆕\n` +
        `  .trivia — Live trivia from Open Trivia DB 🆕\n` +
        `  .hangman — Classic hangman game 🆕\n` +
        `  .rps rock/paper/scissors — With score tracking 🆕\n` +
        `  .ttt @user — Tic-Tac-Toe (coming soon)\n\n` +
        `_All games track your scores in your profile!_`
      );
    }

    if (sub === 'media') {
      return reply(
        `🎨 *Media & Downloader*\n` +
        `${'━'.repeat(32)}\n\n` +
        `  .sticker — Reply to image/video → sticker\n` +
        `  .imagine <prompt> — Free AI image generation\n` +
        `  .removebg — AI background remover 🆕\n` +
        `  .tiktok <url> — TikTok downloader (no watermark) 🆕\n` +
        `  .yt <query> — YouTube search + thumbnail 🆕\n` +
        `  .textart <style> <text> — Fancy Unicode text 🆕\n` +
        `  .tts [lang] <text> — Text to voice note\n` +
        `  .qr <text> — QR code generator\n\n` +
        `_Styles for .textart: bold italic bubble square flip mirror tiny_`
      );
    }

    if (sub === 'social') {
      return reply(
        `💬 *Social & Fun*\n` +
        `${'━'.repeat(32)}\n\n` +
        `  .ship @user1 @user2 — Love compatibility 🆕\n` +
        `  .compliment [@user] — AI compliment 🆕\n` +
        `  .insult [@user] — Savage roast 🆕\n` +
        `  .truth — Truth or Dare (truth) 🆕\n` +
        `  .dare — Truth or Dare (dare) 🆕\n` +
        `  .roast @user — AI personalised roast\n` +
        `  .poll Q | A | B | C — Native WhatsApp poll\n` +
        `  .fact — Random verified fact\n` +
        `  .urban <word> — Urban Dictionary\n`
      );
    }

    if (sub === 'tools') {
      return reply(
        `🔧 *Tools & Utilities*\n` +
        `${'━'.repeat(32)}\n\n` +
        `  .calc <expression> — Scientific calculator 🆕\n` +
        `  .weather <city> — 3-day forecast 🆕\n` +
        `  .time [timezone] — World clock 🆕\n` +
        `  .motivate [@user] — Live motivation quote 🆕\n` +
        `  .remind <time> <msg> — Set a reminder 💎\n` +
        `  .translate <lang> <text> — Translate anything\n` +
        `  .currency 100 USD ZAR — Real-time exchange\n` +
        `  .bmi <kg> <cm> — BMI calculator\n` +
        `  .news [topic] — Live headlines\n` +
        `  .profile [@user] — Profile card 🆕\n\n` +
        `_💎 = Premium feature_\n_🆕 = Exclusive v4 feature_`
      );
    }

    if (sub === 'ai') {
      return reply(
        `🧠 *AI Commands*\n` +
        `${'━'.repeat(32)}\n\n` +
        `  .autochat on/off — Toggle AI chat replies\n` +
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
      `  🧠 \`.menu ai\` — AI & autochat\n` +
      `  🎮 \`.menu games\` — Games & quizzes\n` +
      `  🎨 \`.menu media\` — Media & downloaders\n` +
      `  💬 \`.menu social\` — Social & fun\n` +
      `  🔧 \`.menu tools\` — Tools & utilities\n\n` +
      `${'─'.repeat(30)}\n` +
      `🔥 *What\'s New in v4*\n` +
      `  👻 Ghost Mode — bot goes invisible\n` +
      `  🧠 AI Anti-Toxic Filter — auto-moderation\n` +
      `  🌙 Night Mode — auto-mute schedule\n` +
      `  ⭐ VIP Mode — exclusive member access\n` +
      `  🎮 Wordle + Trivia + Hangman games\n` +
      `  🖼️ Remove Background (AI)\n` +
      `  🎵 TikTok Downloader (no watermark)\n` +
      `  📊 Group Analytics Dashboard\n` +
      `  💕 Ship / Compatibility Score\n` +
      `  ✍️  Fancy Text Art Styles\n\n` +
      `${'━'.repeat(35)}\n` +
      `_⚡ Powered by Dev-Ntando | NovaSpark Bot_\n` +
      `_${config.channelLink}_`
    );
  },
};
