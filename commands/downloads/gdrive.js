/**
 * ⚡ NovaSpark Bot v10 — Google Drive Downloader
 * Download public files from Google Drive
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function extractFileId(url) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function downloadGDrive(url) {
  const fileId = extractFileId(url);
  if (!fileId) throw new Error('Invalid Google Drive URL');

  const enc = encodeURIComponent(url);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/gdrive?url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/gdrive?apikey=gifted&url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
    // Direct GDrive download URL
    async () => {
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const r = await axios.head(directUrl, { timeout: 10000, maxRedirects: 5, headers: { 'User-Agent': UA } });
      const filename = r.headers['content-disposition']?.match(/filename="?([^";\n]+)/)?.[1] || 'file';
      const size = r.headers['content-length'] || 0;
      return { url: directUrl, filename, size, fileId };
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('Google Drive download failed. File may be private.');
}

module.exports = {
  name: 'gdrive',
  aliases: ['googledrive', 'drive', 'gd'],
  category: 'downloads',
  description: 'Download files from Google Drive',
  usage: '.gdrive <URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || !url.includes('drive.google.com')) {
      return reply('📂 *Google Drive Downloader*\n\n_Example: `.gdrive https://drive.google.com/file/d/abc123/view`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '📂', key: msg.key } });
      const result = await downloadGDrive(url);

      const dlUrl = result.url || result.download || result.link;
      const filename = result.filename || result.name || 'file';
      const size = result.size || result.filesize || 'Unknown';

      if (!dlUrl) return reply('❌ Could not get download link.');

      const head = await axios.head(dlUrl, { timeout: 10000, headers: { 'User-Agent': UA } }).catch(() => null);
      const fileSize = head?.headers?.['content-length'] || 0;

      if (fileSize > 50 * 1024 * 1024) {
        return reply(`📂 *Google Drive*\n\n📄 ${filename}\n📊 Size: ${size}\n\n🔗 Direct: ${dlUrl}\n\n_File too large for WhatsApp_`);
      }

      const file = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 120000, headers: { 'User-Agent': UA } });

      await sock.sendMessage(from, {
        document: Buffer.from(file.data),
        fileName: filename,
        mimetype: 'application/octet-stream',
        caption: `📂 *Google Drive*\n📄 ${filename}\n\n_NovaSpark Bot ⚡_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(`❌ GDrive Error: ${e.message}`);
    }
  },
};
