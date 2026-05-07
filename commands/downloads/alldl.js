/**
 * ⚡ NovaSpark Bot v10 — Universal All-In-One Downloader
 * Auto-detects platform and downloads from ANY supported URL
 * Supports: YouTube, TikTok, Instagram, Facebook, Twitter/X, Pinterest,
 * Spotify, SoundCloud, Reddit, Threads, MediaFire, GDrive, CapCut, etc.
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// Platform detection
const PLATFORMS = [
  { name: 'YouTube', patterns: [/youtu\.?be/, /youtube\.com/], cmd: 'ytmp4' },
  { name: 'TikTok', patterns: [/tiktok\.com/], cmd: 'tiktokdl' },
  { name: 'Instagram', patterns: [/instagram\.com/, /instagr\.am/], cmd: 'instagram' },
  { name: 'Facebook', patterns: [/facebook\.com/, /fb\.watch/, /fb\.com/], cmd: 'facebook' },
  { name: 'Twitter/X', patterns: [/twitter\.com/, /x\.com/, /t\.co/], cmd: 'twitter' },
  { name: 'Pinterest', patterns: [/pinterest\.com/, /pin\.it/], cmd: 'pinterest' },
  { name: 'Spotify', patterns: [/spotify\.com/], cmd: 'spotify' },
  { name: 'SoundCloud', patterns: [/soundcloud\.com/], cmd: 'soundcloud' },
  { name: 'Reddit', patterns: [/reddit\.com/, /redd\.it/], cmd: 'reddit' },
  { name: 'Threads', patterns: [/threads\.net/], cmd: 'threads' },
  { name: 'MediaFire', patterns: [/mediafire\.com/], cmd: 'mediafire' },
  { name: 'Google Drive', patterns: [/drive\.google\.com/], cmd: 'gdrive' },
  { name: 'CapCut', patterns: [/capcut\.com/], cmd: 'capcut' },
  { name: 'Likee', patterns: [/likee\./], cmd: 'likee' },
  { name: 'Snack Video', patterns: [/snackvideo\.com/, /share\.snack/], cmd: 'snack' },
];

function detectPlatform(url) {
  for (const p of PLATFORMS) {
    if (p.patterns.some(re => re.test(url))) return p;
  }
  return null;
}

// Universal fallback API
async function universalDownload(url) {
  const enc = encodeURIComponent(url);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/aio?url=${enc}`, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/allin1?apikey=gifted&url=${enc}`, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('Download failed for this URL.');
}

module.exports = {
  name: 'alldl',
  aliases: ['dl', 'download', 'get', 'fetch', 'save', 'aio'],
  category: 'downloads',
  description: 'Universal downloader — auto-detects platform and downloads media',
  usage: '.dl <any URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || !url.startsWith('http')) {
      const supported = PLATFORMS.map(p => `• ${p.name}`).join('\n');
      return reply(`⬇️ *Universal Downloader*\n\nJust paste any URL and I'll download it!\n\n*Supported Platforms:*\n${supported}\n\n_Example: \`.dl https://vm.tiktok.com/abc123\`_`);
    }

    const platform = detectPlatform(url);

    try {
      await sock.sendMessage(from, { react: { text: '⬇️', key: msg.key } });

      // Try to use specific command if available
      if (platform) {
        try {
          const cmdPath = `./${platform.cmd}`;
          const cmd = require(cmdPath);
          if (cmd?.execute) {
            await cmd.execute({ sock, msg, from, args, reply, sender: msg.key.participant || msg.key.remoteJid });
            return;
          }
        } catch {}
      }

      // Fallback to universal API
      const result = await universalDownload(url);
      const mediaUrl = result.url || result.video || result.audio || result.download || (Array.isArray(result) ? result[0]?.url : null);

      if (!mediaUrl) return reply(`❌ No downloadable media found.${platform ? `\n\n_Detected: ${platform.name}_` : ''}`);

      const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video');
      const isAudio = mediaUrl.includes('.mp3') || mediaUrl.includes('audio');
      const caption = `⬇️ *${platform?.name || 'Download'}*\n${result.title ? `📝 ${result.title}` : ''}\n\n_NovaSpark Bot ⚡_`;

      const ext = isAudio ? '.mp3' : isVideo ? '.mp4' : '.jpg';
      const _tmpAL = require('path').join(require('os').tmpdir(), 'ns_al_' + Date.now() + ext);
      const media = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      require('fs').writeFileSync(_tmpAL, Buffer.from(media.data));

      if (isAudio) {
        await sock.sendMessage(from, { audio: { url: _tmpAL }, mimetype: 'audio/mpeg' }, { quoted: msg });
      } else if (isVideo) {
        await sock.sendMessage(from, { video: { url: _tmpAL }, caption, mimetype: 'video/mp4' }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { image: { url: _tmpAL }, caption }, { quoted: msg });
      }
      require('fs').unlink(_tmpAL, () => {});
    } catch (e) {
      await reply(`❌ Download Error: ${e.message}${platform ? `\n\n_Try: .${platform.cmd} ${url}_` : ''}`);
    }
  },
};
