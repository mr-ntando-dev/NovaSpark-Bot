/**
 * ⚡ NovaSpark Bot v10 — SoundCloud Downloader
 * Download tracks from SoundCloud
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function downloadSoundCloud(url) {
  const enc = encodeURIComponent(url);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/soundcloud?url=${enc}`, { timeout: 25000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/soundcloud?apikey=gifted&url=${enc}`, { timeout: 25000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.shizo.top/api/soundcloud?apikey=shizo&url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.download || r.data?.url) return r.data;
      throw new Error('no data');
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('SoundCloud download failed.');
}

module.exports = {
  name: 'soundcloud',
  aliases: ['sc', 'scdl'],
  category: 'downloads',
  description: 'Download tracks from SoundCloud',
  usage: '.soundcloud <URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || !url.includes('soundcloud.com')) {
      return reply('🎵 *SoundCloud Downloader*\n\n_Example: `.soundcloud https://soundcloud.com/artist/track`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '🎵', key: msg.key } });
      const result = await downloadSoundCloud(url);

      const audioUrl = result.url || result.download || result.audio || result.link;
      const title = result.title || result.name || 'SoundCloud Track';
      const artist = result.artist || result.author || '';

      if (!audioUrl) return reply('❌ Could not extract audio URL.');

      const _tmpSC = require('path').join(require('os').tmpdir(), 'ns_sc_' + Date.now() + '.mp3');
      const audio = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      require('fs').writeFileSync(_tmpSC, Buffer.from(audio.data));

      await sock.sendMessage(from, {
        audio: { url: _tmpSC },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
      }, { quoted: msg });
      require('fs').unlink(_tmpSC, () => {});

      await reply(`🎵 *${title}*${artist ? `\n🎤 ${artist}` : ''}\n\n_NovaSpark Bot ⚡_`);
    } catch (e) {
      await reply(`❌ SoundCloud Error: ${e.message}`);
    }
  },
};
