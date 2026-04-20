/**
 * ⚡ NovaSpark Bot v5 — Remini AI (Image Enhancer)
 * Upscale & enhance blurry/low-quality images using AI
 * Reply to image or send URL
 * Ported & adapted from Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios  = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function uploadToImgBB(buf) {
  const base64 = buf.toString('base64');
  const r = await axios.post('https://api.imgbb.com/1/upload?key=none', `image=${encodeURIComponent(base64)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    timeout: 30000,
  });
  if (r.data?.data?.url) return r.data.data.url;
  // fallback: catbox
  const form = new (require('form-data'))();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buf, { filename: 'img.jpg', contentType: 'image/jpeg' });
  const r2 = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders(), timeout: 30000 });
  if (r2.data?.startsWith('http')) return r2.data.trim();
  throw new Error('upload failed');
}

async function enhanceImage(imageUrl) {
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/tools/remini?url=${encodeURIComponent(imageUrl)}`, { timeout: 60000, headers: { 'User-Agent': UA } });
      const res = r.data?.data?.result_url || r.data?.result || r.data?.url;
      if (res) return res;
      throw new Error('no result');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.my.id/api/tools/remini?apikey=gifted&url=${encodeURIComponent(imageUrl)}`, { timeout: 60000, headers: { 'User-Agent': UA } });
      const res = r.data?.result || r.data?.url || r.data?.image;
      if (res) return res;
      throw new Error('no result');
    },
  ];
  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('Remini API unavailable. Try again later.');
}

module.exports = {
  name: 'remini',
  aliases: ['enhance', 'upscale', 'hd', 'aienhance'],
  category: 'ai',
  description: 'Enhance/upscale an image using AI',
  usage: '.remini (reply to image or send URL)',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    try {
      let imageUrl = args[0] || null;

      if (!imageUrl) {
        // Try quoted image
        const ctx = msg.message?.extendedTextMessage?.contextInfo;
        const imgMsg = ctx?.quotedMessage?.imageMessage || msg.message?.imageMessage;

        if (imgMsg) {
          await reply('📸 Uploading image for enhancement...');
          const stream = await downloadContentFromMessage(imgMsg, 'image');
          const chunks = [];
          for await (const chunk of stream) chunks.push(chunk);
          const buf = Buffer.concat(chunks);
          imageUrl = await uploadToImgBB(buf);
        }
      }

      if (!imageUrl) {
        return reply('📸 Reply to an image or send `.remini <image URL>` to enhance it!');
      }

      await sock.sendMessage(from, { react: { text: '✨', key: msg.key } });
      await reply('✨ Enhancing image with AI... this may take 15-30 seconds.');

      const resultUrl = await enhanceImage(imageUrl);

      await sock.sendMessage(from, {
        image:   { url: resultUrl },
        caption: `✨ *Image Enhanced!*\n_Powered by Remini AI_\n\n_⚡ NovaSpark Bot_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(`❌ Enhancement failed: ${e.message}`);
    }
  },
};
