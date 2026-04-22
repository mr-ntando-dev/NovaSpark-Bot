/**
 * ⚡ NovaSpark Bot v6.1 — 2026 Edition
 * .tbj — TB Joshua short sermon clips sent as REAL VIDEO (not URL)
 * Uses same multi-API download chain as .ytmp4 (no yt-dlp needed)
 *
 * Curated TB Joshua YouTube video IDs — short clips under 10 min
 * Add more by appending to TBJ_VIDEOS below.
 *
 * Commands:
 *   .tbj               — random clip as video
 *   .tbj <N>           — specific clip by number
 *   .tbj search <q>    — search YouTube for TB Joshua + send as video
 *   .tbj quote         — daily TB Joshua quote
 *   .tbj list          — list all clips
 *   .tbj schedule on/off <HH:MM> — daily auto-clip for this chat
 *
 * By Dev-Ntando
 */
'use strict';

const axios   = require('axios');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');
const yts     = require('yt-search');
const config  = require('../../config');

const CACHE_DIR  = path.resolve(__dirname, '../../data/tbj_cache');
const SCHED_FILE = path.resolve(__dirname, '../../data/tbj_schedule.json');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Curated TB Joshua YouTube clips ───────────────────────────────────────────
// Short, powerful clips (sermons, miracles, prayers)
// All are official Emmanuel TV / SCOAN uploads
const TBJ_VIDEOS = [
  { id: 'nVt9ZuMoTkA', title: 'Prayer That Changes Things', caption: '🙏 *Prayer That Changes Things*\n_"Prayer is the master key." — TB Joshua_' },
  { id: 'pX7A4EtKjEY', title: 'The Power of Forgiveness',   caption: '💛 *The Power of Forgiveness*\n_"Forgiveness is not weakness. It is strength." — TB Joshua_' },
  { id: 'YPi_vFIxWoI', title: 'Faith Over Fear',            caption: '🛡️ *Faith Over Fear*\n_"Fear is a spirit. Counter it with faith." — TB Joshua_' },
  { id: 'oA7jd0JDPBU', title: 'God\'s Plan for Your Life',  caption: '⭐ *God\'s Plan for Your Life*\n_"Destiny is not by chance. It is by choice." — TB Joshua_' },
  { id: '6g5Z0sWvhT4', title: 'Morning Devotion & Prayer',  caption: '🌅 *Morning Devotion & Prayer*\n_"Every new day is a gift from God." — TB Joshua_' },
  { id: 'BQH6hxKVDIs', title: 'Healing & Miracles',         caption: '✨ *Healing & Miracles*\n_"Miracles happen where there is expectation and faith." — TB Joshua_' },
  { id: 'WsN3CGpGDi4', title: 'Word of Wisdom',             caption: '📖 *Word of Wisdom*\n_"Where there is no vision, the people perish." — TB Joshua_' },
  { id: 'T8lTVMNKYjU', title: 'Overcoming Temptation',      caption: '🔥 *Overcoming Temptation*\n_"The greatest battle is in the mind." — TB Joshua_' },
  { id: 'ZLPrCoCRWZo', title: 'New Season, New Blessing',   caption: '🌱 *New Season, New Blessing*\n_"Yesterday is gone. Today is a gift from God." — TB Joshua_' },
  { id: '1wVNMTeUkYc', title: 'Living by Faith',            caption: '⛪ *Living by Faith*\n_"Faith is the title deed to what you are believing for." — TB Joshua_' },
];

// ── Daily quotes rotation ─────────────────────────────────────────────────────
const TBJ_QUOTES = (config.inspiration && config.inspiration.tbJoshuaQuotes) || [
  'Prayer is the master key. Every problem has a lock. Prayer is the key.',
  'Destiny is not a matter of chance. It is a matter of choice.',
  'When God is about to do something wonderful, He begins with a difficulty.',
  'Your greatest test is when you are able to bless someone else while going through your own storm.',
  'Faith is the title deed to what you are believing for.',
  'The enemy is not a person. The enemy is fear, doubt, unbelief, and hatred.',
  'Where there is no vision, the people perish. Get a vision.',
  'Real Christianity is about service, sacrifice, and surrender.',
  'When you have Christ, you have everything. Without Christ, you have nothing.',
  'Your past is not your future unless you live there.',
  'Do not be afraid of suffering. Suffering is a teacher.',
  'Miracles happen where there is expectation and faith.',
  'You can never separate love from service.',
  'The greatest miracle is not healing the body. It is transformation of the heart.',
  'Prayer changes things because prayer changes people who change things.',
];

function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return TBJ_QUOTES[day % TBJ_QUOTES.length];
}

function randomClip() {
  return TBJ_VIDEOS[Math.floor(Math.random() * TBJ_VIDEOS.length)];
}

// ── Multi-API YouTube video downloader (same pattern as ytmp4.js) ─────────────
async function tryDownloadApis(youtubeUrl) {
  const encoded = encodeURIComponent(youtubeUrl);
  const apis = [
    async () => {
      const r = await axios.get(`https://ytdl.vreden.web.id/api/v1/dl?url=${encoded}&format=mp4`, { timeout: 45000, headers: { 'User-Agent': UA } });
      if (r.data?.result?.download?.url) return r.data.result.download.url;
      throw new Error('vreden no data');
    },
    async () => {
      const r = await axios.get(`https://eliteprotech-apis.zone.id/ytdown?url=${encoded}&format=mp4`, { timeout: 45000, headers: { 'User-Agent': UA } });
      if (r.data?.success && r.data?.downloadURL) return r.data.downloadURL;
      throw new Error('EliteProTech no data');
    },
    async () => {
      const r = await axios.get(`https://api.yupra.my.id/api/downloader/ytmp4?url=${encoded}`, { timeout: 45000, headers: { 'User-Agent': UA } });
      if (r.data?.success && r.data?.data?.download_url) return r.data.data.download_url;
      throw new Error('Yupra no data');
    },
    async () => {
      const r = await axios.get(`https://api.nusantara-bot.biz.id/ytdl/mp4?url=${encoded}`, { timeout: 45000, headers: { 'User-Agent': UA } });
      if (r.data?.result?.dl_url) return r.data.result.dl_url;
      throw new Error('Nusantara no data');
    },
    async () => {
      const r = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encoded}`, { timeout: 45000, headers: { 'User-Agent': UA } });
      if (r.data?.dl) return r.data.dl;
      throw new Error('Okatsu no data');
    },
    async () => {
      // y2mate-style API
      const r = await axios.post('https://www.y2mate.com/mates/analyzeV2/ajax', new URLSearchParams({ k_query: youtubeUrl, k_page: 'home', hl: 'en', q_auto: '1' }).toString(), { timeout: 40000, headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' } });
      if (r.data?.links?.mp4) {
        const q = r.data.links.mp4['720p'] || r.data.links.mp4['480p'] || r.data.links.mp4['360p'];
        if (q?.url) return q.url;
      }
      throw new Error('y2mate no data');
    },
  ];
  const errors = [];
  for (const fn of apis) {
    try { const url = await fn(); if (url) return url; } catch (e) { errors.push(e.message); }
  }
  throw new Error('All APIs failed: ' + errors.join(' | '));
}

// ── Download file buffer via axios ────────────────────────────────────────────
async function downloadBuffer(url) {
  const r = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 120000,
    maxContentLength: 50 * 1024 * 1024,
    headers: { 'User-Agent': UA, 'Referer': 'https://www.youtube.com/' },
  });
  return Buffer.from(r.data);
}

// ── Send a video buffer ───────────────────────────────────────────────────────
async function sendVideo(sock, from, msg, buffer, caption) {
  await sock.sendMessage(from, {
    video:    buffer,
    caption:  caption,
    mimetype: 'video/mp4',
  }, { quoted: msg });
}

// ── Scheduler helpers ─────────────────────────────────────────────────────────
function readSchedule() {
  try {
    if (!fs.existsSync(SCHED_FILE)) return {};
    return JSON.parse(fs.readFileSync(SCHED_FILE, 'utf8'));
  } catch { return {}; }
}
function writeSchedule(obj) {
  const dir = path.dirname(SCHED_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SCHED_FILE, JSON.stringify(obj, null, 2));
}

const _sentToday = new Set();
let _schedTimer  = null;

module.exports.startTBJScheduler = function startTBJScheduler(sock) {
  if (_schedTimer) return;
  _schedTimer = setInterval(async () => {
    const schedules = readSchedule();
    const tz  = config.timezone || 'Africa/Harare';
    const now = new Date().toLocaleTimeString('en-ZA', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });

    for (const [chatId, sched] of Object.entries(schedules)) {
      if (!sched.enabled || sched.time !== now) continue;
      const key = `${chatId}_${now}`;
      if (_sentToday.has(key)) continue;
      _sentToday.add(key);

      try {
        const clip   = randomClip();
        const ytUrl  = `https://www.youtube.com/watch?v=${clip.id}`;
        const dlUrl  = await tryDownloadApis(ytUrl);
        const buf    = await downloadBuffer(dlUrl);
        const caption = `${clip.caption}\n\n💬 _"${getDailyQuote()}"_\n\n⚡ NovaSpark Bot | .tbj for more`;
        await sendVideo(sock, chatId, null, buf, caption);
      } catch (e) {
        // Fallback to quote only if video fails
        try {
          await sock.sendMessage(chatId, {
            text: `🙏 *Daily TB Joshua Inspiration*\n\n💬 _"${getDailyQuote()}"_\n\n_Type .tbj for a video clip_\n⚡ NovaSpark Bot`,
          });
        } catch {}
      }
    }

    // Clear daily sent-set at midnight
    const [h, m] = now.split(':').map(Number);
    if (h === 0 && m === 0) _sentToday.clear();
  }, 60000);
};

// ── Main command export ───────────────────────────────────────────────────────
module.exports = {
  ...module.exports,

  name: 'tbj',
  aliases: ['tbjoshua', 'tbjvideo', 'sermon', 'tbclip'],
  description: 'TB Joshua short sermon clips sent as real WhatsApp video',
  category: 'inspire',
  usage: '.tbj | .tbj <N> | .tbj search <q> | .tbj quote | .tbj list | .tbj schedule on/off <HH:MM>',

  async execute({ sock, msg, from, args, reply }) {
    const sub   = (args[0] || '').toLowerCase();
    const query = args.slice(1).join(' ').trim();

    // ── .tbj quote ────────────────────────────────────────────────────────────
    if (sub === 'quote' || sub === 'pray' || sub === 'word') {
      const q = TBJ_QUOTES[Math.floor(Math.random() * TBJ_QUOTES.length)];
      return reply(
        `🙏 *TB Joshua — Word of the Day*\n\n` +
        `💬 _"${q}"_\n\n` +
        `✝️ *Prophet TB Joshua | Emmanuel TV*\n\n` +
        `_Type .tbj for a video clip_\n_⚡ NovaSpark Bot_`
      );
    }

    // ── .tbj list ─────────────────────────────────────────────────────────────
    if (sub === 'list') {
      const list = TBJ_VIDEOS.map((v, i) => `${i + 1}. ${v.title}`).join('\n');
      return reply(
        `🎬 *TB Joshua Clips (${TBJ_VIDEOS.length} available)*\n${'━'.repeat(30)}\n\n` +
        `${list}\n\n` +
        `_Usage:_\n• _.tbj_ — random clip\n• _.tbj 3_ — clip #3\n• _.tbj search healing_ — search YouTube\n\n` +
        `_⚡ NovaSpark Bot_`
      );
    }

    // ── .tbj schedule ─────────────────────────────────────────────────────────
    if (sub === 'schedule') {
      const action = (args[1] || '').toLowerCase();
      const schedules = readSchedule();

      if (action === 'off' || action === 'disable') {
        if (schedules[from]) { schedules[from].enabled = false; writeSchedule(schedules); }
        return reply('🔕 *TBJ Daily Schedule OFF* — no more daily clips in this chat.');
      }
      if (action === 'on' || action === 'enable') {
        const time = args[2] || '07:00';
        if (!/^\d{2}:\d{2}$/.test(time)) return reply('❌ Invalid time. Use HH:MM format. E.g. .tbj schedule on 07:00');
        schedules[from] = { enabled: true, time };
        writeSchedule(schedules);
        module.exports.startTBJScheduler(sock);
        return reply(
          `✅ *TBJ Daily Schedule ON*\n\n` +
          `⏰ Time: *${time}* (${config.timezone})\n` +
          `📺 A TB Joshua video clip will be sent here every day.\n\n` +
          `_Type .tbj schedule off to stop_`
        );
      }
      const current = schedules[from];
      return reply(
        `📅 *TBJ Schedule Status*\n\nStatus: *${current?.enabled ? '🟢 ON' : '🔴 OFF'}*\n` +
        `Time: *${current?.time || 'Not set'}*\n\n_Usage: .tbj schedule on 07:00_`
      );
    }

    // ── .tbj search <query> ───────────────────────────────────────────────────
    if (sub === 'search') {
      if (!query) return reply('❓ Usage: _.tbj search <topic>_\nExample: _.tbj search healing miracle_');

      await reply(`🔍 *Searching YouTube for:* _TB Joshua ${query}_\n⏳ Please wait...`);

      try {
        // Search YouTube for TB Joshua + query
        const results = await yts(`TB Joshua ${query}`);
        const video   = results.videos.find(v => v.seconds < 1200) || results.videos[0];
        if (!video) return reply('❌ No TB Joshua videos found for that topic. Try different keywords.');

        const ytUrl  = video.url;
        const title  = video.title;
        const dur    = video.timestamp;

        await reply(`✅ *Found:* _${title}_ (${dur})\n⬇️ Downloading and sending as video...`);

        const dlUrl  = await tryDownloadApis(ytUrl);
        const buf    = await downloadBuffer(dlUrl);

        const caption =
          `🔥 *TB Joshua — ${title}*\n` +
          `⏱ ${dur}\n\n` +
          `💬 _"${getDailyQuote()}"_\n\n` +
          `_⚡ NovaSpark Bot | .tbj for more_`;

        await sendVideo(sock, from, msg, buf, caption);

      } catch (err) {
        return reply(
          `❌ *Could not download video.*\n\n` +
          `_Reason: ${err.message.slice(0, 120)}_\n\n` +
          `💡 Try: _.tbj_ for a curated clip instead.`
        );
      }
      return;
    }

    // ── .tbj <N> — specific clip by number ────────────────────────────────────
    const clipIndex = parseInt(sub) - 1;
    const isNumber  = !isNaN(clipIndex) && clipIndex >= 0 && clipIndex < TBJ_VIDEOS.length;
    const clip      = isNumber ? TBJ_VIDEOS[clipIndex] : randomClip();

    // React first for responsiveness
    try { await sock.sendMessage(from, { react: { text: '🙏', key: msg.key } }); } catch {}
    await reply(`🙏 *Loading TB Joshua clip...*\n📺 _${clip.title}_\n⬇️ Downloading...`);

    try {
      const ytUrl = `https://www.youtube.com/watch?v=${clip.id}`;
      const dlUrl = await tryDownloadApis(ytUrl);
      const buf   = await downloadBuffer(dlUrl);

      const caption =
        `${clip.caption}\n\n` +
        `💬 _"${getDailyQuote()}"_\n\n` +
        `_⚡ NovaSpark Bot | .tbj list for all clips_`;

      await sendVideo(sock, from, msg, buf, caption);

    } catch (err) {
      // If video download fails, always fall back to quote (never leave user with nothing)
      await reply(
        `⚠️ *Video download failed* — sending the word instead.\n\n` +
        `${clip.caption}\n\n` +
        `💬 _"${getDailyQuote()}"_\n\n` +
        `✝️ *Prophet TB Joshua | Emmanuel TV*\n` +
        `_⚡ NovaSpark Bot | Try .tbj again or .tbj search <topic>_`
      );
    }
  },
};
