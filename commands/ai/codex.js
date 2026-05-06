/**
 * ⚡ NovaSpark Bot v10 — AI Code Interpreter (Codex)
 * Write, explain, debug, and review code
 * Supports multiple languages: Python, JS, C++, Java, etc.
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const MODES = {
  write: 'Write clean, well-commented code based on the user\'s request. Include the programming language name at the top.',
  explain: 'Explain this code step by step in simple terms. Use bullet points.',
  debug: 'Find bugs in this code and provide the fixed version with explanations of what was wrong.',
  review: 'Review this code for best practices, performance, security, and suggest improvements.',
  convert: 'Convert this code to the specified language while maintaining functionality.',
  optimize: 'Optimize this code for better performance and readability.',
};

async function codeAI(systemPrompt, userQuery) {
  const apis = [
    // Pollinations POST (OpenAI-compatible)
    async () => {
      const r = await axios.post('https://text.pollinations.ai/', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
        model: 'openai',
        seed: Math.floor(Math.random() * 9999),
      }, { timeout: 35000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });
      const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
      if (ans && ans.length > 10) return ans;
      throw new Error('no data');
    },
    // Pollinations GET
    async () => {
      const prompt = `${systemPrompt}\n\nUser request: ${userQuery}`;
      const r = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${Date.now() % 9999}`, {
        timeout: 30000, headers: { 'User-Agent': UA },
      });
      const ans = typeof r.data === 'string' ? r.data.trim() : null;
      if (ans && ans.length > 10) return ans;
      throw new Error('no data');
    },
    // GiftedTech
    async () => {
      const prompt = `${systemPrompt}\n\n${userQuery}`;
      const r = await axios.get(`https://api.giftedtech.web.id/api/ai/gpt4o?apikey=gifted&q=${encodeURIComponent(prompt)}`, {
        timeout: 20000, headers: { 'User-Agent': UA },
      });
      const ans = r.data?.result || r.data?.message;
      if (ans) return ans;
      throw new Error('no data');
    },
  ];

  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('Code AI is currently unavailable.');
}

module.exports = {
  name: 'codex',
  aliases: ['code2', 'codeai', 'debug', 'codewrite', 'codereview'],
  category: 'ai',
  description: 'AI Code Interpreter — write, explain, debug, review, convert, or optimize code',
  usage: '.codex <mode> <code or request>',

  async execute({ sock, msg, from, args, reply, sender }) {
    const mode = (args[0] || '').toLowerCase();
    const input = args.slice(1).join(' ');

    // If alias was used as mode
    const aliasMap = { debug: 'debug', codereview: 'review', codewrite: 'write' };
    const effectiveMode = MODES[mode] ? mode : aliasMap[msg.__usedAlias] || 'write';
    const effectiveInput = MODES[mode] ? input : args.join(' ');

    if (!effectiveInput) {
      const modeList = Object.entries(MODES).map(([k, v]) => `• *${k}* — ${v.split('.')[0]}`).join('\n');
      return reply(`💻 *NovaSpark Codex*\n\nAI-powered code assistant.\n\n*Modes:*\n${modeList}\n\n_Examples:_\n• \`.codex write a Python function to sort a list\`\n• \`.codex debug def add(a,b): return a - b\`\n• \`.codex explain for i in range(10): print(i)\`\n• \`.codex convert to JavaScript: print("hello")\`\n• \`.codex review function sum(a,b){return a+b}\``);
    }

    const systemPrompt = `You are NovaSpark Codex, an expert programming AI assistant. Your task: ${MODES[effectiveMode] || MODES.write}

Rules:
- Always use proper code blocks with language markers
- Be concise but thorough
- Include comments in code
- If the language isn't specified, infer it from context or default to Python
- Format output for readability in WhatsApp (use *bold* for headers, monospace for code)`;

    try {
      await sock.sendMessage(from, { react: { text: '💻', key: msg.key } });
      const result = await codeAI(systemPrompt, effectiveInput);
      await reply(`💻 *NovaSpark Codex* — _${effectiveMode}_\n\n${result}\n\n_Nova AI ⚡_`);
    } catch (e) {
      await reply(`❌ Codex Error: ${e.message}`);
    }
  },
};
