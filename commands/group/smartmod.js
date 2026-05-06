/**
 * ⚡ NovaSpark Bot v10 — AI Smart Moderation
 * AI-powered content moderation (not just keyword matching)
 * Detects: harassment, spam, scams, NSFW intent, manipulation
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const database = require('../../database');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const CATEGORIES = ['harassment', 'spam', 'scam', 'nsfw', 'hate_speech', 'threats', 'manipulation'];

async function moderateMessage(text) {
  try {
    const r = await axios.post('https://text.pollinations.ai/', {
      messages: [
        { role: 'system', content: `You are a content moderation AI. Analyze the message and respond with ONLY a JSON object (no markdown, no explanation):
{"flagged": true/false, "category": "category_name", "severity": "low/medium/high", "reason": "brief reason"}

Categories: ${CATEGORIES.join(', ')}
If the message is safe, respond: {"flagged": false, "category": "none", "severity": "none", "reason": "safe"}
Be strict about scams, threats, and NSFW. Be lenient about casual banter and mild language.` },
        { role: 'user', content: text },
      ],
      model: 'openai-fast',
      seed: Math.floor(Math.random() * 9999),
    }, { timeout: 15000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });

    const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
    if (!ans) return { flagged: false };

    // Extract JSON from response
    const jsonMatch = ans.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { flagged: false };
  } catch {
    return { flagged: false };
  }
}

module.exports = {
  name: 'smartmod',
  aliases: ['aimod', 'automod', 'smartmoderation'],
  category: 'group',
  description: 'AI-powered smart content moderation',
  usage: '.smartmod <on|off|settings|log>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin }) {
    if (!isAdmin) return reply('❌ Admin only command.');

    const sub = (args[0] || 'status').toLowerCase();
    const gs = database.getGroupSettings(from);

    switch (sub) {
      case 'on': case 'enable': {
        database.updateGroupSettings(from, { smartMod: true });
        return reply('🛡️ *AI Smart Moderation* enabled.\n\nI\'ll now analyze messages for harassment, spam, scams, and more using AI.');
      }
      case 'off': case 'disable': {
        database.updateGroupSettings(from, { smartMod: false });
        return reply('🛡️ AI Smart Moderation disabled.');
      }
      case 'strict': {
        database.updateGroupSettings(from, { smartMod: true, smartModStrict: true });
        return reply('🛡️ AI Smart Moderation set to *STRICT* mode.\n\n_More aggressive filtering._');
      }
      case 'log': case 'logs': {
        const logs = gs.modLogs || [];
        if (!logs.length) return reply('📋 No moderation logs yet.');
        const recent = logs.slice(-10).map((l, i) =>
          `${i + 1}. [${l.category}] ${l.severity} — ${l.reason?.substring(0, 40)}`
        ).join('\n');
        return reply(`📋 *Mod Logs (last 10)*\n\n${recent}`);
      }
      case 'status': default: {
        const status = gs.smartMod ? '✅ ON' : '❌ OFF';
        const mode = gs.smartModStrict ? 'Strict' : 'Normal';
        return reply(`🛡️ *AI Smart Moderation*\n\nStatus: ${status}\nMode: ${mode}\n\n*Commands:*\n• \`.smartmod on\` — Enable\n• \`.smartmod off\` — Disable\n• \`.smartmod strict\` — Strict mode\n• \`.smartmod log\` — View logs`);
      }
    }
  },

  // Auto-check handler (called from handler.js)
  async check(sock, msg, from, body, groupSettings, senderNorm) {
    if (!groupSettings?.smartMod) return false;
    if (!body || body.length < 5) return false;

    const result = await moderateMessage(body);
    if (!result.flagged) return false;

    // Log it
    const gs = database.getGroupSettings(from);
    if (!gs.modLogs) gs.modLogs = [];
    gs.modLogs.push({ ...result, sender: senderNorm, time: Date.now(), text: body.substring(0, 100) });
    if (gs.modLogs.length > 100) gs.modLogs.splice(0, gs.modLogs.length - 100);
    database.updateGroupSettings(from, { modLogs: gs.modLogs });

    // Take action based on severity
    if (result.severity === 'high') {
      try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
      await sock.sendMessage(from, {
        text: `🛡️ *AI Mod* — Message removed\n\n⚠️ @${senderNorm.split('@')[0]}: ${result.reason}\nCategory: ${result.category} | Severity: ${result.severity}`,
        mentions: [senderNorm],
      });
      return true;
    }

    if (result.severity === 'medium') {
      await sock.sendMessage(from, {
        text: `⚠️ @${senderNorm.split('@')[0]} — Warning: ${result.reason}`,
        mentions: [senderNorm],
      }, { quoted: msg });
      return false; // Don't block, just warn
    }

    return false;
  },
};
