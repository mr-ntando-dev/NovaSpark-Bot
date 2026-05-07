/**
 * ⚡ NovaSpark Bot v5 — Imagine (AI Image Generation)
 * Text-to-image using free public AI image APIs
 * Multi-API fallback: Pollinations → Prodia → Siputzx
 * Expanded from existing imagine + Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function generateImage(prompt) {
  // API 1 — Pollinations (free, reliable)
  try {
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true`;
    const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 40000, headers: { 'User-Agent': UA } });
    if (r.data && r.data.byteLength > 5000) return Buffer.from(r.data);
    throw new Error('empty');
  } catch {}

  // API 2 — Siputzx imagine
  try {
    const r = await axios.get(`https://api.siputzx.my.id/api/ai/text2img?prompt=${encodeURIComponent(prompt)}`, { responseType: 'arraybuffer', timeout: 40000, headers: { 'User-Agent': UA } });
    if (r.data && r.data.byteLength > 5000) return Buffer.from(r.data);
    throw new Error('empty');
  } catch {}

  // API 3 — GiftedTech
  try {
    const r = await axios.get(`https://api.giftedtech.my.id/api/ai/imagine?apikey=gifted&prompt=${encodeURIComponent(prompt)}`, { timeout: 40000, headers: { 'User-Agent': UA } });
    const imgUrl = r.data?.result || r.data?.url || r.data?.image;
    if (imgUrl) {
      const dl = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': UA } });
      return Buffer.from(dl.data);
    }
    throw new Error('no url');
  } catch {}

  throw new Error('All image generation APIs failed. Try a simpler prompt.');
}

module.exports = {
  name: 'imagine2',
  aliases: ['txt2img', 'aimagine', 'genimage', 'aiart', 'aidraw'],
  category: 'ai',
  description: 'Generate an AI image from a text prompt',
  usage: '.imagine <prompt>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const prompt = args.join(' ');
    if (!prompt) return reply('🎨 Describe what you want to generate!\n\n_Example: .imagine a dragon flying over a city at sunset_');

    try {
      await sock.sendMessage(from, { react: { text: '🎨', key: msg.key } });
      await reply(`🎨 Generating: _"${prompt}"_\n\n⏳ Please wait...`);

      const imgBuf = await generateImage(prompt);

      await sock.sendMessage(from, {
        image:   imgBuf,
        caption: `🎨 *AI Image*\n_Prompt: ${prompt}_\n\n_⚡ NovaSpark Bot_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(`❌ Image generation failed: ${e.message}`);
    }
  },
};
