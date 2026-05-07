/**
 * ⚡ NovaSpark Bot v10 — MediaFire Downloader
 * Direct download links from MediaFire URLs
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function getMediaFireLink(url) {
  const enc = encodeURIComponent(url);

  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/mediafire?url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/mediafire?apikey=gifted&url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
    // Scrape fallback
    async () => {
      const r = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': UA } });
      const html = r.data;
      const match = html.match(/href="(https?:\/\/download\d*\.mediafire\.com\/[^"]+)"/);
      if (match) return { url: match[1], filename: html.match(/class="filename"[^>]*>([^<]+)/)?.[1] || 'file', size: html.match(/class="details"[^>]*>([^<]+)/)?.[1] || 'Unknown' };
      throw new Error('no link found');
    },
  ];

  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('MediaFire download failed. Link may be expired.');
}

module.exports = {
  name: 'mediafire',
  aliases: ['mf', 'mediafiredl'],
  category: 'downloads',
  description: 'Download files from MediaFire links',
  usage: '.mediafire <URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || !url.includes('mediafire.com')) {
      return reply('📁 *MediaFire Downloader*\n\n_Example: `.mediafire https://www.mediafire.com/file/abc123/file.zip`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '📁', key: msg.key } });
      const result = await getMediaFireLink(url);

      const dlUrl = result.url || result.download || result.link;
      const filename = result.filename || result.name || 'file';
      const size = result.size || result.filesize || 'Unknown';

      // Try to download and send (limit 50MB)
      const head = await axios.head(dlUrl, { timeout: 10000, headers: { 'User-Agent': UA } }).catch(() => null);
      const contentLength = head?.headers?.['content-length'] || 0;

      if (contentLength > 50 * 1024 * 1024) {
        return reply(`📁 *MediaFire*\n\n📄 ${filename}\n📊 Size: ${size}\n\n🔗 Direct link:\n${dlUrl}\n\n_File too large to send via WhatsApp (>50MB)_`);
      }

      const _tmpMF = require('path').join(require('os').tmpdir(), 'ns_mf_' + Date.now() + '_' + filename);
      const file = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 120000, headers: { 'User-Agent': UA } });
      require('fs').writeFileSync(_tmpMF, Buffer.from(file.data));

      await sock.sendMessage(from, {
        document: { url: _tmpMF },
        fileName: filename,
        mimetype: 'application/octet-stream',
        caption: `📁 *MediaFire Download*\n\n📄 ${filename}\n📊 ${size}\n\n_NovaSpark Bot ⚡_`,
      }, { quoted: msg });
      require('fs').unlink(_tmpMF, () => {});
    } catch (e) {
      await reply(`❌ MediaFire Error: ${e.message}`);
    }
  },
};
