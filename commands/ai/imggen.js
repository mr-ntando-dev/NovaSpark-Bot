/**
 * ⚡ NovaSpark Bot v10 — Advanced AI Image Generator
 * Multiple styles, models, aspect ratios, and prompt enhancement
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const STYLES = {
  realistic: 'photorealistic, 8k, ultra detailed, professional photography',
  anime: 'anime style, vibrant colors, manga illustration, detailed',
  cartoon: 'cartoon style, colorful, fun, animated, pixar-like',
  painting: 'oil painting, masterpiece, gallery quality, artistic brushstrokes',
  cyberpunk: 'cyberpunk style, neon lights, futuristic, dark city, high tech',
  fantasy: 'fantasy art, magical, ethereal, epic scene, detailed environment',
  minimal: 'minimalist, clean, simple, modern design, flat colors',
  '3d': '3D render, octane render, cinema 4D, high detail, studio lighting',
  watercolor: 'watercolor painting, soft colors, artistic, flowing',
  pixel: 'pixel art, retro gaming style, 16-bit, nostalgic',
};

const SIZES = {
  square: '1024x1024',
  wide: '1024x576',
  tall: '576x1024',
  banner: '1024x384',
};

async function generateImage(prompt, style = 'realistic', size = 'square') {
  const stylePrompt = STYLES[style] || STYLES.realistic;
  const dimensions = SIZES[size] || SIZES.square;
  const [width, height] = dimensions.split('x').map(Number);
  const enhancedPrompt = `${prompt}, ${stylePrompt}, masterpiece, best quality`;

  const apis = [
    // Pollinations Image
    async () => {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${Date.now() % 99999}&nologo=true&enhance=true`;
      const r = await axios.get(url, { timeout: 60000, responseType: 'arraybuffer', headers: { 'User-Agent': UA } });
      if (r.data && r.data.length > 1000) return Buffer.from(r.data);
      throw new Error('No image');
    },
    // Pollinations with different model
    async () => {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&model=flux&seed=${Date.now() % 99999}&nologo=true`;
      const r = await axios.get(url, { timeout: 60000, responseType: 'arraybuffer', headers: { 'User-Agent': UA } });
      if (r.data && r.data.length > 1000) return Buffer.from(r.data);
      throw new Error('No image');
    },
  ];

  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('Image generation unavailable.');
}

module.exports = {
  name: 'imggen',
  aliases: ['generate', 'draw', 'art', 'create', 'imagine3'],
  category: 'ai',
  description: 'Advanced AI image generation with styles and sizes',
  usage: '.imggen [--style <style>] [--size <size>] <prompt>',

  async execute({ sock, msg, from, args, reply }) {
    let style = 'realistic';
    let size = 'square';
    let promptArgs = [];

    // Parse flags
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--style' && args[i + 1]) { style = args[++i].toLowerCase(); continue; }
      if (args[i] === '--size' && args[i + 1]) { size = args[++i].toLowerCase(); continue; }
      promptArgs.push(args[i]);
    }

    const prompt = promptArgs.join(' ');
    if (!prompt) {
      const styleList = Object.keys(STYLES).join(', ');
      const sizeList = Object.keys(SIZES).join(', ');
      return reply(`🎨 *AI Image Generator v2*\n\n*Styles:* ${styleList}\n*Sizes:* ${sizeList}\n\n_Examples:_\n• \`.imggen a sunset over mountains\`\n• \`.imggen --style anime a warrior princess\`\n• \`.imggen --style cyberpunk --size wide futuristic city\`\n• \`.imggen --style 3d cute robot character\``);
    }

    if (!STYLES[style]) style = 'realistic';
    if (!SIZES[size]) size = 'square';

    try {
      await sock.sendMessage(from, { react: { text: '🎨', key: msg.key } });
      const imageBuffer = await generateImage(prompt, style, size);

      await sock.sendMessage(from, {
        image: imageBuffer,
        caption: `🎨 *AI Generated*\n\n📝 ${prompt}\n🖌️ Style: ${style} | 📐 Size: ${size}\n\n_Nova AI ⚡_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(`❌ Image Error: ${e.message}`);
    }
  },
};
