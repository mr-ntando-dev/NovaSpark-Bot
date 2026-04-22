/**
 * ⚡ NovaSpark Bot v6.0 — 2026 Edition
 * .tbj — TB Joshua short video clips sent as ACTUAL VIDEO (not URL)
 * .tbjquote — TB Joshua quote / prayer
 * .tbjsearch <query> — search YouTube for TB Joshua clips (sends video)
 * .tbjlist — list available local clips
 * .tbjschedule on/off <time> — auto-send a daily TBJ clip to this chat
 *
 * Videos are downloaded via ytdl-core / yt-dlp and sent as WhatsApp video messages.
 * Clips are cached in data/tbj_cache/ after first download.
 *
 * By Dev-Ntando
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');
const { execSync, spawn } = require('child_process');
const config = require('../../config');

const CACHE_DIR  = path.resolve(__dirname, '../../data/tbj_cache');
const SCHED_FILE = path.resolve(__dirname, '../../data/tbj_schedule.json');

// Ensure cache dir exists
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

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

/** Download a file (http/https) to destPath. Returns a Promise<void>. */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file  = fs.createWriteStream(destPath);
    proto.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

/** Try to download a YouTube video using yt-dlp (must be installed on the server).
 *  Falls back to attempting ytdl-core if available.
 *  Returns local mp4 path or null on failure.
 */
async function downloadYouTubeVideo(ytUrl, destPath) {
  // Strategy 1: yt-dlp (preferred — install with: pip install yt-dlp)
  try {
    execSync(
      `yt-dlp -f "best[ext=mp4][filesize<15M]/best[ext=mp4]/best" --max-filesize 15M -o "${destPath}" "${ytUrl}" --no-playlist`,
      { timeout: 90000, stdio: 'pipe' }
    );
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) return destPath;
  } catch {}

  // Strategy 2: ytdl-core (Node.js package)
  try {
    const ytdl = require('ytdl-core');
    await new Promise((resolve, reject) => {
      const stream = ytdl(ytUrl, { quality: 'lowest', filter: 'videoandaudio' });
      const file   = fs.createWriteStream(destPath);
      stream.pipe(file);
      file.on('finish', resolve);
      file.on('error', reject);
      stream.on('error', reject);
    });
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) return destPath;
  } catch {}

  return null;
}

/** Search YouTube for TB Joshua clips and return top result URL */
async function searchTBJYouTube(query) {
  try {
    // Use yt-dlp to search without API key
    const result = execSync(
      `yt-dlp "ytsearch1:TB Joshua ${query}" --print webpage_url --no-download --no-playlist`,
      { timeout: 30000, encoding: 'utf8', stdio: 'pipe' }
    ).trim();
    if (result && result.startsWith('http')) return result;
  } catch {}

  // Fallback: scrape YouTube search
  try {
    const https2 = require('https');
    const searchUrl = `https://www.youtube.com/results?search_query=TB+Joshua+${encodeURIComponent(query)}`;
    const html = await new Promise((resolve, reject) => {
      https2.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }).on('error', reject);
    });
    const match = html.match(/"videoId":"([^"]{11})"/);
    if (match) return `https://www.youtube.com/watch?v=${match[1]}`;
  } catch {}

  return null;
}

/** Pick a random item from config clips array */
function randomClip() {
  const clips = (config.inspiration && config.inspiration.tbJoshuaVideos) || [];
  if (!clips.length) return null;
  return clips[Math.floor(Math.random() * clips.length)];
}

/** Get a daily rotating quote */
function getDailyQuote() {
  const quotes = (config.inspiration && config.inspiration.tbJoshuaQuotes) || [
    'Prayer is the master key.',
    'Faith is the title deed to what you are believing for.',
    'Your past is not your future unless you live there.',
  ];
  const day = Math.floor(Date.now() / 86400000);
  return quotes[day % quotes.length];
}

/** Send a video from a local file path */
async function sendVideoFile(sock, from, msg, filePath, caption) {
  const stat = fs.statSync(filePath);
  if (stat.size > 64 * 1024 * 1024) {
    throw new Error('Video file too large (>64 MB). WhatsApp limit exceeded.');
  }
  const buffer = fs.readFileSync(filePath);
  await sock.sendMessage(from, {
    video:    buffer,
    caption:  caption || '',
    mimetype: 'video/mp4',
  }, { quoted: msg });
}

// ── Scheduler — called by handler on each message / timer ─────────────────────
let _schedTimer = null;

module.exports.startTBJScheduler = function startTBJScheduler(sock) {
  if (_schedTimer) return;
  _schedTimer = setInterval(async () => {
    const schedules = readSchedule();
    const now = new Date();
    const tz  = config.timezone || 'Africa/Harare';
    const nowStr = now.toLocaleTimeString('en-ZA', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });

    for (const [chatId, sched] of Object.entries(schedules)) {
      if (!sched.enabled || !sched.time) continue;
      if (sched.time !== nowStr) continue;

      // Avoid duplicate send within same minute
      const lastKey = `${chatId}_${nowStr}`;
      if (module.exports._sentToday && module.exports._sentToday.has(lastKey)) continue;
      if (!module.exports._sentToday) module.exports._sentToday = new Set();
      module.exports._sentToday.add(lastKey);

      try {
        const clip   = randomClip();
        const quote  = getDailyQuote();
        if (!clip) continue;

        const cacheKey = clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp4';
        const cachePath = path.join(CACHE_DIR, cacheKey);

        if (!fs.existsSync(cachePath)) {
          await downloadFile(clip.url, cachePath);
        }

        if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 1000) {
          await sendVideoFile(sock, chatId, null, cachePath, clip.caption + `\n\n💬 _"${quote}"_`);
        } else {
          await sock.sendMessage(chatId, {
            text: `🙏 *Daily TB Joshua Inspiration*\n\n💬 _"${quote}"_\n\n⚡ NovaSpark Bot`,
          });
        }
      } catch (e) {
        console.error('[TBJ Scheduler]', e.message);
      }
    }

    // Clear sent-today cache at midnight
    const hour = parseInt(nowStr.split(':')[0]);
    const min  = parseInt(nowStr.split(':')[1]);
    if (hour === 0 && min === 0 && module.exports._sentToday) {
      module.exports._sentToday.clear();
    }
  }, 60000); // check every minute
};

// ── Command Export ────────────────────────────────────────────────────────────

module.exports = {
  ...module.exports,

  name: 'tbj',
  aliases: ['tbjoshua', 'tbjvideo', 'sermon', 'inspire'],
  description: 'TB Joshua short video clips sent as real video',
  category: 'inspire',
  usage: '.tbj | .tbj quote | .tbj search <query> | .tbj list | .tbj schedule on <HH:MM> | .tbj schedule off',

  async execute({ sock, msg, from, args, reply }) {
    const sub   = (args[0] || '').toLowerCase();
    const query = args.slice(1).join(' ');

    // ── .tbj quote ───────────────────────────────────────────────────────────
    if (sub === 'quote' || sub === 'prayer' || sub === 'pray') {
      const quotes = (config.inspiration && config.inspiration.tbJoshuaQuotes) || [];
      const q = quotes[Math.floor(Math.random() * quotes.length)] || 'Prayer is the master key.';
      return reply(
        `🙏 *TB Joshua — Word of the Day*\n\n` +
        `💬 _"${q}"_\n\n` +
        `✝️ *Prophet TB Joshua*\n_Emmanuel TV_\n\n` +
        `⚡ NovaSpark Bot — Type *.tbj* for a video clip`
      );
    }

    // ── .tbj list ────────────────────────────────────────────────────────────
    if (sub === 'list') {
      const clips = (config.inspiration && config.inspiration.tbJoshuaVideos) || [];
      if (!clips.length) return reply('❌ No TB Joshua clips configured in config.js');
      const list = clips.map((c, i) => `${i + 1}. ${c.title}`).join('\n');
      return reply(
        `🎬 *Available TB Joshua Clips*\n${'━'.repeat(30)}\n\n${list}\n\n` +
        `_Type .tbj to get a random clip_\n` +
        `_Type .tbj search <topic> to search YouTube_`
      );
    }

    // ── .tbj schedule ────────────────────────────────────────────────────────
    if (sub === 'schedule') {
      const action = (args[1] || '').toLowerCase();
      const schedules = readSchedule();

      if (action === 'off' || action === 'disable') {
        if (schedules[from]) {
          schedules[from].enabled = false;
          writeSchedule(schedules);
        }
        return reply('🔕 *TBJ Daily Schedule OFF* — no more daily clips in this chat.');
      }

      if (action === 'on' || action === 'enable') {
        const time = args[2] || '07:00';
        if (!/^\d{2}:\d{2}$/.test(time)) {
          return reply('❓ Invalid time. Use HH:MM format e.g. `.tbj schedule on 07:00`');
        }
        schedules[from] = { enabled: true, time };
        writeSchedule(schedules);
        module.exports.startTBJScheduler(sock);
        return reply(
          `✅ *TBJ Daily Schedule ON*\n\n` +
          `⏰ Time: *${time}* (${config.timezone})\n` +
          `📺 A TB Joshua clip will be sent here daily.\n\n` +
          `_Type .tbj schedule off to stop_`
        );
      }

      const current = schedules[from];
      return reply(
        `📅 *TBJ Schedule Status*\n\n` +
        `Status: *${current && current.enabled ? '🟢 ON' : '🔴 OFF'}*\n` +
        `Time: *${current && current.time ? current.time : 'Not set'}*\n\n` +
        `_Usage: .tbj schedule on 07:00_`
      );
    }

    // ── .tbj search <query> ──────────────────────────────────────────────────
    if (sub === 'search') {
      if (!query) return reply('❓ Usage: `.tbj search <topic>`\nExample: `.tbj search healing miracle`');

      await reply(`🔍 Searching YouTube for TB Joshua — _"${query}"_...\n⏳ Downloading and sending as video...`);

      try {
        const ytUrl = await searchTBJYouTube(query);
        if (!ytUrl) return reply('❌ Could not find a TB Joshua video for that topic. Try a different keyword.');

        const safeQ   = query.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);
        const outPath = path.join(CACHE_DIR, `search_${safeQ}_${Date.now()}.mp4`);

        await reply(`⬇️ Found video. Downloading now... (may take up to 60s)`);
        const dlPath = await downloadYouTubeVideo(ytUrl, outPath);

        if (!dlPath) {
          return reply(
            `⚠️ Could not download video automatically.\n\n` +
            `📺 Watch it here: ${ytUrl}\n\n` +
            `_💡 Install yt-dlp on your server for automatic video download._`
          );
        }

        const caption =
          `🔥 *TB Joshua — ${query}*\n` +
          `⚡ Found via NovaSpark Bot\n\n` +
          `💬 _"${getDailyQuote()}"_\n\n` +
          `_⚡ NovaSpark Bot | Type .tbj for more_`;

        await sendVideoFile(sock, from, msg, dlPath, caption);

        // Clean up search cache after 1 hour
        setTimeout(() => { try { fs.unlinkSync(dlPath); } catch {} }, 3600000);

      } catch (err) {
        console.error('[tbj search]', err);
        return reply(`❌ Error: ${err.message}\n\n_Make sure yt-dlp is installed on your server._`);
      }
      return;
    }

    // ── .tbj (default — send random clip from config) ────────────────────────
    await reply(`🙏 *Loading TB Joshua video clip...*\n⏳ Please wait...`);

    try {
      const clip = randomClip();
      if (!clip) {
        return reply(
          `⚠️ No TB Joshua clips configured.\n\n` +
          `Add clips in *config.js* under *inspiration.tbJoshuaVideos*.\n\n` +
          `Each entry needs:\n• title\n• url (direct .mp4 link)\n• caption`
        );
      }

      const cacheKey  = clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp4';
      const cachePath = path.join(CACHE_DIR, cacheKey);

      // Download if not cached
      if (!fs.existsSync(cachePath) || fs.statSync(cachePath).size < 1000) {
        await downloadFile(clip.url, cachePath);
      }

      if (!fs.existsSync(cachePath) || fs.statSync(cachePath).size < 1000) {
        // Last resort — tell user
        return reply(
          `⚠️ Could not download the video file.\n` +
          `_Add valid direct .mp4 URLs in config.js → inspiration.tbJoshuaVideos_\n\n` +
          `💬 Today's quote:\n_"${getDailyQuote()}"_`
        );
      }

      await sendVideoFile(sock, from, msg, cachePath, clip.caption + `\n\n💬 _"${getDailyQuote()}"_`);

    } catch (err) {
      console.error('[tbj]', err);
      return reply(
        `❌ Could not send video: ${err.message}\n\n` +
        `💬 Here is today's word instead:\n\n` +
        `🙏 _"${getDailyQuote()}"_\n\n✝️ *Prophet TB Joshua*`
      );
    }
  },
};
