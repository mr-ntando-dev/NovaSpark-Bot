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
    title: '\ud83e\udd16 AI & Intelligence',
    rows: [
      { title: '.gpt <question>',         rowId: 'ai_gpt',      description: 'ChatGPT-style AI answers' },
      { title: '.gemini <question>',       rowId: 'ai_gemini',   description: 'Google Gemini AI' },
      { title: '.character <name> <msg>',  rowId: 'ai_char',     description: 'Roleplay as any character' },
      { title: '.agent <task>',            rowId: 'ai_agent',    description: 'AI autonomous task agent' },
      { title: '.persona / .memory',       rowId: 'ai_persona',  description: 'Custom persona & memory' },
      { title: '.imagine <prompt>',        rowId: 'ai_imagine',  description: 'AI image generation' },
      { title: '.imagine2 <prompt>',       rowId: 'ai_imagine2', description: 'Alternative AI image gen' },
      { title: '.imggen <prompt>',         rowId: 'ai_imggen',   description: 'Advanced image generation' },
      { title: '.aieyes on/off',           rowId: 'ai_aieyes',   description: 'AI vision always-on mode' },
      { title: '.vision / .docanalyze',    rowId: 'ai_vision',   description: 'Analyze images & documents' },
      { title: '.remini',                  rowId: 'ai_remini',   description: 'AI photo enhancer' },
      { title: '.removebg',                rowId: 'ai_rbg',      description: 'Remove image background' },
      { title: '.genmusic <prompt>',       rowId: 'ai_genmusic', description: 'Generate music with AI' },
      { title: '.codex <code>',            rowId: 'ai_codex',    description: 'AI code explainer/fixer' },
      { title: '.autochat / .voicechat',   rowId: 'ai_auto',     description: 'Always-on AI conversation' },
    ],
  },
  {
    title: '\ud83d\udcda Study & Education',
    rows: [
      { title: '.homework <question>',     rowId: 'study_hw',    description: 'AI homework help' },
      { title: '.essay <topic>',           rowId: 'study_essay', description: 'Write a full essay' },
      { title: '.summarize <text>',        rowId: 'study_sum',   description: 'Bullet-point summary' },
      { title: '.translate <text>',        rowId: 'study_trans', description: 'Translate to any language' },
      { title: '.studytips <subject>',     rowId: 'study_tips',  description: 'AI study tips' },
      { title: '.pdf <title|topic>',       rowId: 'study_pdf',   description: 'Generate a PDF document' },
      { title: '.math <expression>',       rowId: 'study_math',  description: 'Solve math problems' },
      { title: '.urban <word>',            rowId: 'study_urban', description: 'Urban dictionary lookup' },
      { title: '.fact',                    rowId: 'study_fact',  description: 'Random interesting fact' },
    ],
  },
  {
    title: '\ud83c\udfae Games',
    rows: [
      { title: '.chess start @user',       rowId: 'game_chess',  description: 'Text chess in WhatsApp' },
      { title: '.wordle',                  rowId: 'game_wordle', description: '5-letter word game' },
      { title: '.trivia',                  rowId: 'game_trivia', description: 'Live trivia quiz' },
      { title: '.hangman',                 rowId: 'game_hang',   description: 'Classic hangman' },
      { title: '.rps rock/paper/scissors', rowId: 'game_rps',    description: 'Rock Paper Scissors' },
      { title: '.scramble',                rowId: 'game_scram',  description: 'Unscramble the word' },
      { title: '.akinator',                rowId: 'game_akin',   description: 'AI mind reader' },
      { title: '.mathquiz [easy/hard]',    rowId: 'game_mq',     description: 'Timed math quiz game' },
      { title: '.numguess',                rowId: 'game_ng',     description: 'Guess number 1-100' },
      { title: '.typingtest',              rowId: 'game_tt',     description: 'Typing speed (WPM) test' },
      { title: '.quiz20',                  rowId: 'game_q20',    description: '20 Questions game' },
      { title: '.bet heads 100',           rowId: 'game_bet',    description: 'Coin bet economy game' },
    ],
  },
  {
    title: '\ud83d\ude02 Fun & Social',
    rows: [
      { title: '.joke / .dadjoke',         rowId: 'fun_joke',    description: 'Random jokes' },
      { title: '.riddle',                  rowId: 'fun_riddle',  description: 'Guess the riddle' },
      { title: '.meme',                    rowId: 'fun_meme',    description: 'Random meme image' },
      { title: '.wyr',                     rowId: 'fun_wyr',     description: 'Would you rather?' },
      { title: '.truth / .dare',           rowId: 'fun_td',      description: 'Truth or dare' },
      { title: '.compliment / .insult',    rowId: 'fun_ci',      description: 'Compliment or insult @user' },
      { title: '.roast / .flirt',          rowId: 'fun_rf',      description: 'AI roast & flirt' },
      { title: '.ship @user1 @user2',      rowId: 'fun_ship',    description: 'Compatibility percentage' },
      { title: '.horoscope / .zodiac',     rowId: 'fun_horo',    description: 'Daily horoscope' },
      { title: '.typeracer',               rowId: 'fun_tr',      description: 'Group typing race' },
      { title: '.emojiart <text>',         rowId: 'fun_ea',      description: 'Fancy emoji text art' },
      { title: '.fortunecookie / .quote',  rowId: 'fun_fq',      description: 'Fortune & quotes' },
    ],
  },
  {
    title: '\u2b07\ufe0f Downloaders',
    rows: [
      { title: '.ytmp3 <query/url>',       rowId: 'dl_mp3',      description: 'YouTube MP3 audio' },
      { title: '.ytmp4 <query/url>',       rowId: 'dl_mp4',      description: 'YouTube MP4 video' },
      { title: '.ytshorts <url>',          rowId: 'dl_shorts',   description: 'YouTube Shorts downloader' },
      { title: '.tiktok <url>',            rowId: 'dl_tt',       description: 'TikTok no watermark' },
      { title: '.instagram <url>',         rowId: 'dl_ig',       description: 'Instagram post/reel' },
      { title: '.facebook <url>',          rowId: 'dl_fb',       description: 'Facebook video' },
      { title: '.twitter <url>',           rowId: 'dl_tw',       description: 'Twitter/X video' },
      { title: '.threads <url>',           rowId: 'dl_th',       description: 'Threads post' },
      { title: '.reddit <url>',            rowId: 'dl_rd',       description: 'Reddit post/video' },
      { title: '.spotify <query>',         rowId: 'dl_spot',     description: 'Spotify track' },
      { title: '.soundcloud <url>',        rowId: 'dl_sc',       description: 'SoundCloud audio' },
      { title: '.alldl <url>',             rowId: 'dl_all',      description: 'Universal downloader' },
    ],
  },
  {
    title: '\ud83d\udd27 Tools & Utilities',
    rows: [
      { title: '.weather <city>',          rowId: 'tool_wx',     description: 'Live weather forecast' },
      { title: '.news [topic]',            rowId: 'tool_news',   description: 'Latest news headlines' },
      { title: '.qr <text>',               rowId: 'tool_qr',     description: 'Generate QR code' },
      { title: '.calc <expression>',       rowId: 'tool_calc',   description: 'Advanced calculator' },
      { title: '.currency 100 USD ZAR',    rowId: 'tool_fx',     description: 'Live currency converter' },
      { title: '.tts [lang] <text>',       rowId: 'tool_tts',    description: 'Text to speech' },
      { title: '.base64 encode/decode',    rowId: 'tool_b64',    description: 'Base64 encoder/decoder' },
      { title: '.hash <algo> <text>',      rowId: 'tool_hash',   description: 'Crypto hash generator' },
      { title: '.textstats <text>',        rowId: 'tool_ts',     description: 'Word/char/WPM stats' },
      { title: '.palindrome <text>',       rowId: 'tool_pal',    description: 'Palindrome checker' },
      { title: '.randomcolor',             rowId: 'tool_rc',     description: 'Random HEX/RGB color' },
      { title: '.pwcheck <password>',      rowId: 'tool_pw',     description: 'Password strength check' },
    ],
  },
  {
    title: '\ud83d\udee1\ufe0f Group Management',
    rows: [
      { title: '.kick @user',              rowId: 'grp_kick',    description: 'Kick a member' },
      { title: '.warn @user / .warnlist',  rowId: 'grp_warn',    description: 'Warn members & view list' },
      { title: '.promote / .demote @user', rowId: 'grp_role',    description: 'Manage admin roles' },
      { title: '.tagall / .hidetag',       rowId: 'grp_tag',     description: 'Tag everyone silently' },
      { title: '.antilink / .antispam',    rowId: 'grp_anti',    description: 'Block links & spam' },
      { title: '.antibot on/off',          rowId: 'grp_abot',    description: 'Auto-kick bots on join' },
      { title: '.nightmode / .vip',        rowId: 'grp_nv',      description: 'Night lock & VIP mode' },
      { title: '.groupannounce <msg>',     rowId: 'grp_ann',     description: 'Send group announcement' },
      { title: '.grouppoll Q | A | B',     rowId: 'grp_poll',    description: 'Create WhatsApp poll' },
      { title: '.inactive [days]',         rowId: 'grp_inact',   description: 'List inactive members' },
      { title: '.groupstats',              rowId: 'grp_stats',   description: 'Group activity stats' },
      { title: '.welcome on/off',          rowId: 'grp_wlc',     description: 'Welcome new members' },
    ],
  },
  {
    title: '\u2699\ufe0f Auto & Owner',
    rows: [
      { title: '.autoonline / .autoread',  rowId: 'auto_on',     description: 'Always online & read' },
      { title: '.autoreply',               rowId: 'auto_rp',     description: 'Auto-reply to messages' },
      { title: '.waprotect on/off',        rowId: 'auto_wp',     description: 'Account protection' },
      { title: '.pmblocker on/off',        rowId: 'auto_pmb',    description: 'Block unknown DMs' },
      { title: '.cmdstats',                rowId: 'own_cs',      description: 'Top used commands' },
      { title: '.togglecmd <command>',     rowId: 'own_tc',      description: 'Enable/disable commands' },
      { title: '.setbotname <name>',       rowId: 'own_bn',      description: 'Change bot name' },
      { title: '.setmenu <style>',         rowId: 'own_sm',      description: 'Switch menu style' },
      { title: '.broadcast <msg>',         rowId: 'own_bc',      description: 'Broadcast to all groups' },
      { title: '.maintenance on/off',      rowId: 'own_mt',      description: 'Maintenance mode' },
    ],
  },
  {
    title: '\u271d\ufe0f Faith & Inspiration',
    rows: [
      { title: '.bible <reference>',       rowId: 'faith_b',     description: 'Fetch a Bible verse' },
      { title: '.verse',                   rowId: 'faith_v',     description: 'Random verse of the day' },
      { title: '.prayer',                  rowId: 'faith_p',     description: 'Daily prayer' },
      { title: '.tbj',                     rowId: 'faith_t',     description: 'TBJ daily devotional' },
      { title: '.motivate',                rowId: 'faith_m',     description: 'Daily motivational quote' },
      { title: '.affirm',                  rowId: 'faith_a',     description: 'Positive daily affirmation' },
    ],
  },
];

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
