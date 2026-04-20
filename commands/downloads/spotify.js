/**
 * ⚡ NovaSpark Bot v5 — Spotify Downloader
 * Download Spotify tracks as audio files
 * API: Siputzx Spotify → SpotifyDown fallback
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const SP_PATTERNS = [
  /https?:\/\/open\.spotify\.com\/track\//,
  /https?:\/\/spotify\.link\//,
];

async function downloadSpotify(url) {
  // API 1 — Siputzx
  try {
    const r = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.status && d.data?.download) return { download: d.data.download, title: d.data.title, artist: d.data.artist, cover: d.data.cover };
  } catch {}

  // API 2 — SpotifyDown
  try {
    const r = await axios.get(`https://spotifydown.com/api/download?link=${encodeURIComponent(url)}`, { timeout: 25000, headers: { 'User-Agent': UA, 'Origin': 'https://spotifydown.com' } });
    const d = r.data;
    if (d?.success && d.link) return { download: d.link, title: d.metadata?.title, artist: d.metadata?.artists };
  } catch {}

  throw new Error('Spotify download failed — only public tracks are supported.');
}

module.exports = {
  name: 'spotify',
  aliases: ['sp', 'spotifydl', 'spdl'],
  category: 'downloads',
  description: 'Download Spotify track as audio',
  usage: '.spotify <Spotify track URL>',

  async execute(sock, msg, args, extra) {
    const url = (args[0] || args.join(' ')).trim();
    if (!url) return extra.reply('🎧 Provide a Spotify track URL!\n\n_Example: .spotify https://open.spotify.com/track/xxx_');
    if (!SP_PATTERNS.some(p => p.test(url))) return extra.reply('❌ Only Spotify track links are supported.\n_URL must contain open.spotify.com/track/_');

    try {
      await sock.sendMessage(extra.from, { react: { text: '🎧', key: msg.key } });
      await extra.reply('🎧 Fetching Spotify track...');

      const data    = await downloadSpotify(url);
      const tmpFile = path.join(os.tmpdir(), `ns_sp_${Date.now()}.mp3`);
      const dlRes   = await axios.get(data.download, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));

      const caption = `🎵 *${data.title || 'Spotify Track'}*\n🎤 ${data.artist || ''}\n\n_⚡ NovaSpark Bot_`;

      if (data.cover) {
        await sock.sendMessage(extra.from, { image: { url: data.cover }, caption }, { quoted: msg });
      }

      await sock.sendMessage(extra.from, {
        audio:    fs.readFileSync(tmpFile),
        mimetype: 'audio/mp4',
        fileName: `${(data.title || 'spotify').replace(/[^\w\s-]/g, '')}.mp3`,
        ptt:      false,
      }, { quoted: msg });

      fs.unlink(tmpFile, () => {});
    } catch (e) {
      await extra.reply(`❌ Failed: ${e.message}`);
    }
  },
};
