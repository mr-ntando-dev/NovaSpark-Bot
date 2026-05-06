/**
 * ⚡ NovaSpark Bot v5 — Interactive Button Menu
 * Uses WhatsApp native list message for a tap-able command navigator
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');

// ─────────────────────────────────────────────
// Section definitions — each section maps to sub-menu category
// ─────────────────────────────────────────────
const SECTIONS = [
  {
    title: '🤖 AI Commands',
    rows: [
      { title: '.gpt <question>',    rowId: 'ai_gpt',      description: 'ChatGPT-style AI answers' },
      { title: '.gemini <question>', rowId: 'ai_gemini',   description: 'Google Gemini AI' },
      { title: '.imagine <prompt>',  rowId: 'ai_imagine',  description: 'AI image generation' },
      { title: '.character <name>',  rowId: 'ai_char',     description: 'Roleplay AI — Luffy, Naruto...' },
      { title: '.remini',            rowId: 'ai_remini',   description: 'AI photo enhancer' },
      { title: '.removebg',          rowId: 'ai_rbg',      description: 'Remove image background' },
    ],
  },
  {
    title: '📚 Study & Tools',
    rows: [
      { title: '.homework <q>',       rowId: 'study_hw',       description: 'AI homework help' },
      { title: '.essay <topic>',      rowId: 'study_essay',    description: 'Write a full essay' },
      { title: '.summarize <text>',   rowId: 'study_sum',      description: 'Bullet-point summary' },
      { title: '.translate <text>',   rowId: 'study_trans',    description: 'Translate to any language' },
      { title: '.studytips <subject>',rowId: 'study_tips',     description: 'AI study tips' },
      { title: '.pdf <title|topic>',  rowId: 'study_pdf',      description: 'Generate a PDF document' },
      { title: '.math <expression>',  rowId: 'study_math',     description: 'Solve math problems' },
    ],
  },
  {
    title: '⬇️ Downloaders',
    rows: [
      { title: '.song <name/URL>',    rowId: 'dl_song',   description: 'YouTube MP3' },
      { title: '.video <name/URL>',   rowId: 'dl_video',  description: 'YouTube MP4' },
      { title: '.tiktok <URL>',       rowId: 'dl_tt',     description: 'TikTok no watermark' },
      { title: '.spotify <URL>',      rowId: 'dl_spot',   description: 'Spotify track' },
      { title: '.fb <URL>',           rowId: 'dl_fb',     description: 'Facebook video' },
      { title: '.ig <URL>',           rowId: 'dl_ig',     description: 'Instagram post/reel' },
      { title: '.pin <URL>',          rowId: 'dl_pin',    description: 'Pinterest image/video' },
    ],
  },
  {
    title: '🎮 Games',
    rows: [
      { title: '.wordle',                  rowId: 'game_wordle',  description: '5-letter word game' },
      { title: '.trivia',                  rowId: 'game_trivia',  description: 'Live trivia quiz' },
      { title: '.hangman',                 rowId: 'game_hang',    description: 'Classic hangman' },
      { title: '.rps rock/paper/scissors', rowId: 'game_rps',     description: 'Rock Paper Scissors' },
      { title: '.riddle',                  rowId: 'game_riddle',  description: 'Guess the riddle' },
    ],
  },
  {
    title: '😂 Fun & Social',
    rows: [
      { title: '.joke',            rowId: 'fun_joke',  description: 'Random joke' },
      { title: '.meme',            rowId: 'fun_meme',  description: 'Random meme' },
      { title: '.quote',           rowId: 'fun_quote', description: 'Inspirational quote' },
      { title: '.8ball <question>',rowId: 'fun_8b',    description: 'Magic 8-ball' },
      { title: '.flip',            rowId: 'fun_flip',  description: 'Coin flip' },
      { title: '.dice [n] [sides]',rowId: 'fun_dice',  description: 'Roll dice' },
      { title: '.horoscope <sign>',rowId: 'fun_horo',  description: 'Daily horoscope' },
      { title: '.truth',           rowId: 'fun_truth', description: 'Truth or Dare — truth' },
      { title: '.dare',            rowId: 'fun_dare',  description: 'Truth or Dare — dare' },
      { title: '.roast @user',     rowId: 'fun_roast', description: 'AI savage roast' },
      { title: '.flirt [@user]',   rowId: 'fun_flirt', description: 'Flirty pickup line' },
    ],
  },
  {
    title: '🛠️ Utility',
    rows: [
      { title: '.weather <city>',      rowId: 'util_weather',  description: 'Live weather report' },
      { title: '.currency <X> <FROM> TO <TO>', rowId: 'util_curr', description: 'Currency converter' },
      { title: '.qr <text>',           rowId: 'util_qr',       description: 'Generate QR code' },
      { title: '.sticker',             rowId: 'util_sticker',  description: 'Image → sticker' },
      { title: '.tts <text>',          rowId: 'util_tts',      description: 'Text to speech' },
      { title: '.bmi <w> <h>',         rowId: 'util_bmi',      description: 'BMI calculator' },
      { title: '.password [length]',   rowId: 'util_pass',     description: 'Strong password generator' },
      { title: '.countdown <date>',    rowId: 'util_count',    description: 'Days until a date' },
      { title: '.color #HEX',          rowId: 'util_color',    description: 'Color info & converter' },
      { title: '.nasa',                rowId: 'util_nasa',     description: 'NASA Astronomy Picture' },
      { title: '.translate <text>',    rowId: 'util_trans',    description: 'Language translation' },
      { title: '.fact',                rowId: 'util_fact',     description: 'Random verified fact' },
      { title: '.news [topic]',        rowId: 'util_news',     description: 'Latest news headlines' },
    ],
  },
  {
    title: '🛡️ Group Management',
    rows: [
      { title: '.tagall [msg]',      rowId: 'grp_tagall',    description: 'Tag all members ✨Admin' },
      { title: '.kick @user',        rowId: 'grp_kick',      description: 'Remove member ✨Admin' },
      { title: '.warn @user',        rowId: 'grp_warn',      description: 'Warn a member' },
      { title: '.mute / .unmute',    rowId: 'grp_mute',      description: 'Lock/unlock group ✨Admin' },
      { title: '.antilink on/off',   rowId: 'grp_alink',     description: 'Block links ✨Admin' },
      { title: '.antitoxic on/off',  rowId: 'grp_atox',      description: 'AI toxic filter' },
      { title: '.nightmode on/off',  rowId: 'grp_night',     description: 'Auto-mute at night' },
      { title: '.welcome on/off',    rowId: 'grp_welcome',   description: 'Welcome new members' },
      { title: '.groupstats',        rowId: 'grp_stats',     description: 'Group analytics' },
    ],
  },
  {
    title: '💎 Premium',
    rows: [
      { title: '.examprep <subject>', rowId: 'prem_exam',    description: 'Full exam revision 💎' },
      { title: '.code <lang> <task>', rowId: 'prem_code',    description: 'Generate working code 💎' },
      { title: '.remind <time> <msg>',rowId: 'prem_remind',  description: 'Smart reminders 💎' },
      { title: '.autostudy on/off',   rowId: 'prem_astudy',  description: 'Auto study mode 💎' },
      { title: '.setpersona <desc>',  rowId: 'prem_persona', description: 'Custom AI persona 💎' },
      { title: '.mystats',            rowId: 'prem_stats',   description: 'Your usage stats 💎' },
    ],
  },
];

// ─────────────────────────────────────────────
// Detail messages per rowId (shown when a row is selected via text cmd)
// ─────────────────────────────────────────────
const DETAILS = {
  ai_gpt:     '🤖 *.gpt <question>*\n\nAsks a ChatGPT-style AI your question.\n\nExample: `.gpt What is quantum computing?`',
  ai_gemini:  '🤖 *.gemini <question>*\n\nAsks Google\'s Gemini AI.\n\nExample: `.gemini Write me a short story about a robot.`',
  ai_imagine: '🎨 *.imagine <prompt>*\n\nGenerates an AI image from your description.\n\nExample: `.imagine a futuristic city at night in anime style`',
  ai_char:    '🎭 *.character <name> <message>*\n\nRoleplay with AI as a character.\n\nAvailable: luffy, naruto, goku, tony, sherlock, batman\n\nExample: `.character luffy Let\'s fight!`',
  game_riddle:'🧩 *.riddle*\n\nGet a random riddle. Use `.riddle answer` to reveal the answer.',
  fun_flip:   '🪙 *.flip*\n\nFlip a coin — heads or tails.',
  fun_dice:   '🎲 *.dice [count] [sides]*\n\nRoll dice.\n\nExamples:\n`.dice` — one d6\n`.dice 2` — two d6\n`.dice 3 20` — three d20',
  fun_horo:   '🔮 *.horoscope <sign>*\n\nGet your daily horoscope.\n\nExample: `.horoscope leo`\n\nSigns: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces',
  fun_dare:   '😈 *.dare*\n\nGet a random dare challenge for Truth or Dare.',
  util_pass:  '🔐 *.password [length] [options]*\n\nGenerate a strong random password.\n\nExamples:\n`.password` — 16 chars\n`.password 20` — 20 chars\n`.password 12 nosymbols` — no symbols',
  util_count: '⏳ *.countdown <YYYY-MM-DD> [event name]*\n\nCount days/hours until a date.\n\nExample: `.countdown 2025-12-25 Christmas 🎄`',
  util_color: '🎨 *.color #HEX*\n\nGet info about a color: name, RGB, HSL, brightness.\n\nExamples:\n`.color #FF5733`\n`.color random`',
  util_nasa:  '🚀 *.nasa*\n\nFetches NASA\'s Astronomy Picture of the Day with explanation.',
};

module.exports = {
  name: 'bmenu',
  aliases: ['buttonmenu', 'listmenu', 'nav'],
  category: 'free',
  description: 'Interactive button menu — navigate commands with tap-able list',
  usage: '.bmenu',

  async execute({ sock, from, msg, sender, reply }) {
    const isPrem = true; // All users enjoy Premium for free
    const plan   = isPrem ? '💎 Premium' : '🆓 Free';
    const num    = sender.split('@')[0];
    const uptime = process.uptime();
    const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;

    // Filter premium section for free users (still show, but mark clearly)
    const sections = SECTIONS.map(s => ({
      ...s,
      rows: s.rows.slice(0, 10), // WhatsApp limits rows per section
    }));

    // ── Real Baileys interactive buttons (works on MD / personal numbers) ──────
    // listMessage only works on WhatsApp Business API numbers.
    // For MD bots we use buttonsMessage which works on all accounts.
    try {
      await sock.sendMessage(from, {
        buttonsMessage: {
          contentText:
            `👋 Hello *${num}*!\n` +
            `Plan: ${plan}  |  Uptime: ${uptimeStr}\n\n` +
            `Tap a button to view that category:`,
          footerText: `${config.botName} ⚡ | ${config.prefix}menu for full text`,
          buttons: [
            { buttonId: `${config.prefix}menu ai`,        buttonText: { displayText: '🤖 AI Commands'       }, type: 1 },
            { buttonId: `${config.prefix}menu downloads`, buttonText: { displayText: '⬇️ Downloaders'        }, type: 1 },
            { buttonId: `${config.prefix}menu games`,     buttonText: { displayText: '🎮 Games'               }, type: 1 },
          ],
          headerType: 1,
        },
      }, { quoted: msg });

      // WhatsApp only supports 3 buttons per message — send a second set
      await sock.sendMessage(from, {
        buttonsMessage: {
          contentText: `More categories:`,
          footerText: `${config.botName} ⚡`,
          buttons: [
            { buttonId: `${config.prefix}menu social`,  buttonText: { displayText: '😂 Fun & Social'     }, type: 1 },
            { buttonId: `${config.prefix}menu group`,   buttonText: { displayText: '🛡️ Group Management'  }, type: 1 },
            { buttonId: `${config.prefix}menu tools`,   buttonText: { displayText: '🔧 Tools & Utilities' }, type: 1 },
          ],
          headerType: 1,
        },
      }, { quoted: msg });
    } catch (err) {
      // Final fallback — clean text menu with clickable command hints
      await reply(
        `⚡ *NovaSpark Bot — Quick Menu*\n` +
        `${'━'.repeat(32)}\n\n` +
        `👋 Hello *${num}*!   Plan: ${plan}\n` +
        `⏱️ Uptime: ${uptimeStr}\n\n` +
        `📂 *Tap or type a category command:*\n\n` +
        `🤖 \`${config.prefix}menu ai\`         — AI & Image AI\n` +
        `⬇️ \`${config.prefix}menu downloads\`  — All downloaders\n` +
        `🎮 \`${config.prefix}menu games\`       — Games & quizzes\n` +
        `😂 \`${config.prefix}menu social\`      — Fun & Social\n` +
        `🛡️ \`${config.prefix}menu group\`       — Group Management\n` +
        `🔧 \`${config.prefix}menu tools\`       — Tools & Utilities\n` +
        `👑 \`${config.prefix}menu owner\`        — Owner Commands\n\n` +
        `🆕 *New in v5.1:*\n` +
        `  .flip  .dice  .horoscope  .riddle\n` +
        `  .password  .countdown  .color  .nasa\n\n` +
        `_${config.prefix}menu — Full detailed menu_`
      );
    }
  },
};
