/**
 * ⚡ NovaSpark Bot v9 — Pinterest Downloader
 * Images & Videos from Pinterest pins
 * API cascade: Siputzx → Yupra → EliteProTech → pinterestdownloader fallback
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const PIN_PATTERNS = [
  /https?:\/\/(?:www\.)?pinterest\.com\//,
  /https?:\/\/pin\.it\//,
  /https?:\/\/(?:www\.)?pinterest\.[a-z]+\//,
];

// ── API cascade ────────────────────────────────────────────────────────────
async function downloadPin(url) {
  const enc = encodeURIComponent(url);

  // API 1: Siputzx
  try {
    const r = await axios.get('https://api.siputzx.my.id/api/d/pinterest?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.status && d.data) {
      const mediaUrl = d.data.url || d.data.video || d.data.image;
      if (mediaUrl) return { url: mediaUrl, type: d.data.video ? 'video' : 'image', title: d.data.title || 'Pinterest' };
    }
  } catch {}

  // API 2: Yupra
  try {
    const r = await axios.get('https://api.yupra.my.id/api/downloader/pinterest?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.success && d.data) {
      const mediaUrl = d.data.url || d.data.video || d.data.image;
      if (mediaUrl) return { url: mediaUrl, type: d.data.type || (d.data.video ? 'video' : 'image'), title: d.data.title || 'Pinterest' };
    }
  } catch {}

  // API 3: EliteProTech
  try {
    const r = await axios.get('https://eliteprotech-apis.zone.id/pinterest?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.success && (d.url || d.downloadURL))
      return { url: d.url || d.downloadURL, type: d.type || 'image', title: d.title || 'Pinterest' };
  } catch {}

  throw new Error('All Pinterest APIs failed — pin may be private or deleted.');
}

// ── Command ────────────────────────────────────────────────────────────────
module.exports = {
  name: 'pinterest',
  aliases: ['pin', 'pindl', 'pindownload'],
  category: 'downloads',
  description: 'Download Pinterest images and videos',
  usage: '.pin <Pinterest URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = (args[0] || args.join(' ')).trim();
    if (!url) return reply(
      '📌 *Pinterest Downloader*\n\n' +
      'Usage: `.pin <Pinterest pin URL>`\n\n' +
      '_Supports: pinterest.com, pin.it_\n' +
      '_Downloads both images and videos_'
    );
    if (!PIN_PATTERNS.some(p => p.test(url)))
      return reply('❌ That does not look like a Pinterest link.');

    try {
      await sock.sendMessage(from, { react: { text: '📥', key: msg.key } });

      const data    = await downloadPin(url);
      const isVideo = data.type === 'video' || /\.(mp4|mov|webm)/i.test(data.url);

      if (isVideo) {
        const tmpFile = path.join(os.tmpdir(), 'ns_pin_' + Date.now() + '.mp4');
        const dl = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA }, maxRedirects: 10 });
        fs.writeFileSync(tmpFile, Buffer.from(dl.data));
        await sock.sendMessage(from, {
          video:    fs.readFileSync(tmpFile),
          mimetype: 'video/mp4',
          caption:  '📌 *' + (data.title || 'Pinterest Video') + '*\n\n_⚡ NovaSpark Bot_',
        }, { quoted: msg });
        fs.unlink(tmpFile, () => {});
      } else {
        await sock.sendMessage(from, {
          image:   { url: data.url },
          caption: '📌 *' + (data.title || 'Pinterest Image') + '*\n\n_⚡ NovaSpark Bot_',
        }, { quoted: msg });
      }

    } catch (e) {
      await reply(
        '❌ *Pinterest Download Failed*\n\n' +
        '• Reason: ' + e.message.split('\n')[0] + '\n\n' +
        '_💡 Make sure the pin is public and the URL is correct._'
      );
    }
  },
};
