/**
 * ⚡ NovaSpark Bot v10 — APK Downloader
 * Search and download Android APK files
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function searchAPK(query) {
  const enc = encodeURIComponent(query);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/apk?query=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/apk?apikey=gifted&query=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
  ];

  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('APK search failed.');
}

module.exports = {
  name: 'apk',
  aliases: ['apkdl', 'getapk', 'app'],
  category: 'downloads',
  description: 'Search and download APK files',
  usage: '.apk <app name>',

  async execute({ sock, msg, from, args, reply }) {
    const query = args.join(' ');
    if (!query) return reply('📱 *APK Downloader*\n\n_Example: `.apk WhatsApp` or `.apk Telegram`_');

    try {
      await sock.sendMessage(from, { react: { text: '📱', key: msg.key } });
      const result = await searchAPK(query);

      if (Array.isArray(result)) {
        // Show search results
        const list = result.slice(0, 5).map((app, i) =>
          `${i + 1}. *${app.name || app.title}*\n   📊 ${app.size || 'N/A'} | ⭐ ${app.rating || 'N/A'}\n   🔗 ${app.link || app.url || 'N/A'}`
        ).join('\n\n');
        return reply(`📱 *APK Search: "${query}"*\n\n${list}\n\n_Copy the link and use .apk <link> to download_`);
      }

      // Direct download
      const dlUrl = result.url || result.download || result.link;
      const name = result.name || result.title || query;
      const size = result.size || 'Unknown';

      if (dlUrl) {
        const _tmpAPK = require('path').join(require('os').tmpdir(), 'ns_apk_' + Date.now() + '.apk');
        const file = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 120000, headers: { 'User-Agent': UA } });
        require('fs').writeFileSync(_tmpAPK, Buffer.from(file.data));

        if (require('fs').statSync(_tmpAPK).size > 50 * 1024 * 1024) {
          require('fs').unlink(_tmpAPK, () => {});
          return reply(`📱 *${name}*\n📊 Size: ${size}\n\n🔗 Download: ${dlUrl}\n\n_Too large for WhatsApp_`);
        }

        await sock.sendMessage(from, {
          document: { url: _tmpAPK },
          fileName: `${name.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
          mimetype: 'application/vnd.android.package-archive',
          caption: `📱 *${name}*\n📊 ${size}\n\n_NovaSpark Bot ⚡_`,
        }, { quoted: msg });
        require('fs').unlink(_tmpAPK, () => {});
      } else {
        return reply(`📱 *${name}*\n📊 ${size}\n\n❌ Direct download unavailable.`);
      }
    } catch (e) {
      await reply(`❌ APK Error: ${e.message}`);
    }
  },
};
