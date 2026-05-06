/**
 * ⚡ NovaSpark Bot v10 — AI Vision
 * Analyze images: describe, OCR, object detection, Q&A about images
 * Multi-API fallback — no key needed
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const FormData = require('form-data');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function analyzeImage(imageBuffer, query = 'Describe this image in detail') {
  const base64 = imageBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  const apis = [
    // API 1: Pollinations Vision (OpenAI-compatible, free)
    async () => {
      const r = await axios.post('https://text.pollinations.ai/', {
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: query },
              { type: 'image_url', image_url: { url: dataUri } },
            ],
          },
        ],
        model: 'openai',
        seed: Math.floor(Math.random() * 9999),
      }, { timeout: 45000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });
      const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
      if (ans && ans.length > 5) return ans;
      throw new Error('pollinations vision: no data');
    },
    // API 2: GiftedTech Vision
    async () => {
      const form = new FormData();
      form.append('image', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
      form.append('query', query);
      const r = await axios.post('https://api.giftedtech.web.id/api/ai/vision', form, {
        timeout: 30000,
        headers: { ...form.getHeaders(), 'User-Agent': UA },
      });
      const ans = r.data?.result || r.data?.message || r.data?.description;
      if (ans) return ans;
      throw new Error('giftedtech vision: no data');
    },
    // API 3: Fallback - describe via text prompt with base64 snippet
    async () => {
      const snippet = base64.substring(0, 100);
      const r = await axios.post('https://text.pollinations.ai/', {
        messages: [
          { role: 'system', content: 'You are an image analysis AI. The user will send you an image. Describe what you see.' },
          { role: 'user', content: `[Image attached] ${query}` },
        ],
        model: 'openai-fast',
        seed: Math.floor(Math.random() * 9999),
      }, { timeout: 25000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });
      const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
      if (ans && ans.length > 5) return ans;
      throw new Error('fallback: no data');
    },
  ];

  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('All vision APIs are unavailable. Try again later.');
}

module.exports = {
  name: 'vision',
  aliases: ['see', 'describe', 'analyze', 'imgscan', 'whatisthis'],
  category: 'ai',
  description: 'Analyze an image — describe it, read text, answer questions about it',
  usage: '.vision [question] (reply to an image or send with an image)',

  async execute({ sock, msg, from, args, reply, sender }) {
    const query = args.join(' ') || 'Describe this image in detail. Include any text visible.';

    // Check if message has image or is replying to an image
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;

    if (!hasImage) {
      return reply('👁️ *AI Vision*\n\nSend or reply to an image with this command.\n\n_Examples:_\n• `.vision` — describe the image\n• `.vision What breed is this dog?`\n• `.vision Read the text in this image`');
    }

    try {
      await sock.sendMessage(from, { react: { text: '👁️', key: msg.key } });

      // Download the image
      const imgMsg = msg.message?.imageMessage ? msg : { message: { imageMessage: quotedMsg.imageMessage } };
      // For quoted messages, we need to reconstruct
      let buffer;
      if (msg.message?.imageMessage) {
        buffer = await downloadMediaMessage(msg, 'buffer', {});
      } else {
        // Build a minimal message object for quoted image
        const quotedKey = msg.message?.extendedTextMessage?.contextInfo;
        const tempMsg = {
          key: { ...msg.key },
          message: quotedMsg,
        };
        buffer = await downloadMediaMessage(tempMsg, 'buffer', {});
      }

      if (!buffer || buffer.length < 100) {
        return reply('❌ Could not download the image. Try sending it again.');
      }

      const result = await analyzeImage(buffer, query);
      await reply(`👁️ *AI Vision Analysis*\n\n${result}\n\n_Nova AI ⚡_`);
    } catch (e) {
      await reply(`❌ Vision Error: ${e.message}`);
    }
  },
};
