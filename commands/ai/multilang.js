/**
 * ⚡ NovaSpark Bot v10 — Multi-Language AI
 * Auto-detect language and respond in the same language
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function multiLangChat(query) {
  const r = await axios.post('https://text.pollinations.ai/', {
    messages: [
      { role: 'system', content: 'You are NovaSpark, a multilingual AI assistant. CRITICAL RULE: Detect the language the user is writing in and ALWAYS respond in that SAME language. If they write in Spanish, respond in Spanish. If Shona, respond in Shona. If French, respond in French. Be helpful and concise (2-4 sentences).' },
      { role: 'user', content: query },
    ],
    model: 'openai',
    seed: Math.floor(Math.random() * 9999),
  }, { timeout: 30000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });

  const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
  if (ans && ans.length > 3) return ans;
  throw new Error('Multi-lang AI unavailable');
}

module.exports = {
  name: 'multilang',
  aliases: ['lang', 'chat2', 'polyglot'],
  category: 'ai',
  description: 'AI that auto-detects your language and replies in it',
  usage: '.multilang <message in any language>',

  async execute({ sock, msg, from, args, reply }) {
    const query = args.join(' ');
    if (!query) return reply('🌍 *Multi-Language AI*\n\nWrite in ANY language and I\'ll respond in the same language.\n\n_Examples:_\n• `.multilang Bonjour, comment ça va?`\n• `.multilang Hola, qué hora es?`\n• `.multilang Mhoro, makadii?`');

    try {
      await sock.sendMessage(from, { react: { text: '🌍', key: msg.key } });
      const answer = await multiLangChat(query);
      await reply(`🌍 ${answer}\n\n_Nova AI ⚡_`);
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
