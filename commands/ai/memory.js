/**
 * ⚡ NovaSpark Bot v10 — AI Conversation Memory
 * Persistent long-term memory with context recall
 * Remembers user preferences, facts, and past conversations
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const database = require('../../database');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const MAX_MEMORY = 50; // max memory entries per user
const MAX_CONTEXT = 10; // messages to include in context

function getMemoryStore(userId) {
  return database.getMemory(userId) || [];
}

function saveMemoryEntry(userId, entry) {
  const mem = getMemoryStore(userId);
  mem.push({ ...entry, timestamp: Date.now() });
  if (mem.length > MAX_MEMORY) mem.splice(0, mem.length - MAX_MEMORY);
  database.setMemory(userId, mem);
}

function clearMemory(userId) {
  database.setMemory(userId, []);
}

function searchMemory(userId, query) {
  const mem = getMemoryStore(userId);
  const q = query.toLowerCase();
  return mem.filter(m =>
    m.content?.toLowerCase().includes(q) ||
    m.summary?.toLowerCase().includes(q) ||
    m.tags?.some(t => t.toLowerCase().includes(q))
  ).slice(-5);
}

async function chatWithMemory(userId, query) {
  const mem = getMemoryStore(userId);
  const recentMem = mem.slice(-MAX_CONTEXT);

  const memoryContext = recentMem.length
    ? `\n\nMemory (things you remember about this user):\n${recentMem.map(m => `- ${m.summary || m.content}`).join('\n')}`
    : '';

  const r = await axios.post('https://text.pollinations.ai/', {
    messages: [
      { role: 'system', content: `You are NovaSpark, a smart AI with persistent memory. You remember past conversations and user preferences.${memoryContext}\n\nRules:\n- Reference past conversations when relevant\n- If the user tells you something new about themselves, acknowledge it\n- Be concise (2-4 sentences)\n- If you learn something new, start your response with [MEMORY: brief fact to remember] on its own line, then your response` },
      { role: 'user', content: query },
    ],
    model: 'openai',
    seed: Math.floor(Math.random() * 9999),
  }, { timeout: 30000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });

  let ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
  if (!ans || ans.length < 3) throw new Error('Memory AI unavailable');

  // Extract memory tags
  const memMatch = ans.match(/\[MEMORY:\s*(.+?)\]/);
  if (memMatch) {
    saveMemoryEntry(userId, { content: query, summary: memMatch[1], tags: [memMatch[1].split(' ')[0]] });
    ans = ans.replace(/\[MEMORY:\s*.+?\]\n?/, '').trim();
  } else {
    // Save conversation anyway
    saveMemoryEntry(userId, { content: query, summary: query.substring(0, 100), tags: [] });
  }

  return ans;
}

module.exports = {
  name: 'memory',
  aliases: ['remember', 'recall', 'forget', 'memchat'],
  category: 'ai',
  description: 'AI with persistent memory — remembers your conversations and preferences',
  usage: '.memory <subcommand or message>',

  async execute({ sock, msg, from, args, reply, sender }) {
    const sub = (args[0] || '').toLowerCase();
    const userId = sender;

    switch (sub) {
      case 'clear': case 'reset': case 'wipe': {
        clearMemory(userId);
        await sock.sendMessage(from, { react: { text: '🗑️', key: msg.key } });
        return reply('🧠 Memory cleared. I\'ve forgotten everything about our past conversations.');
      }

      case 'show': case 'list': case 'view': {
        const mem = getMemoryStore(userId);
        if (!mem.length) return reply('🧠 No memories stored yet. Chat with me using `.memory <message>` and I\'ll start remembering!');

        const list = mem.slice(-10).map((m, i) => `${i + 1}. ${m.summary || m.content?.substring(0, 60)}`).join('\n');
        return reply(`🧠 *Your Memory* (${mem.length} entries)\n\n${list}\n\n_Use \`.memory clear\` to reset_`);
      }

      case 'search': case 'find': {
        const query = args.slice(1).join(' ');
        if (!query) return reply('🔍 Usage: `.memory search <topic>`');

        const results = searchMemory(userId, query);
        if (!results.length) return reply(`🔍 No memories found matching "${query}"`);

        const list = results.map((m, i) => `${i + 1}. ${m.summary || m.content?.substring(0, 80)}`).join('\n');
        return reply(`🔍 *Memory Search: "${query}"*\n\n${list}`);
      }

      default: {
        const query = args.join(' ');
        if (!query) return reply('🧠 *AI Memory*\n\nI remember our conversations!\n\n*Commands:*\n• `.memory <message>` — Chat (I\'ll remember)\n• `.memory show` — View memories\n• `.memory search <topic>` — Search memories\n• `.memory clear` — Erase all memories');

        try {
          await sock.sendMessage(from, { react: { text: '🧠', key: msg.key } });
          const response = await chatWithMemory(userId, query);
          await reply(`🧠 *NovaSpark*\n\n${response}\n\n_Nova AI ⚡_`);
        } catch (e) {
          await reply(`❌ Memory Error: ${e.message}`);
        }
      }
    }
  },
};
