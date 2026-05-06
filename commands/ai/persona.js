/**
 * ⚡ NovaSpark Bot v10 — AI Persona Studio
 * Create, save, and switch between custom AI personalities
 * Persistent per-user personas stored in database
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const database = require('../../database');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// ── Built-in Personas ─────────────────────────────────────────────────────────
const BUILTIN = {
  nova: {
    name: 'Nova (Default)',
    prompt: 'You are NovaSpark, a friendly, witty, and helpful WhatsApp AI assistant. Be concise, use emojis occasionally, and chat like a smart friend.',
  },
  professor: {
    name: 'Professor',
    prompt: 'You are a world-class professor who explains complex topics in simple terms. Use analogies, examples, and break things down step by step. Be patient and encouraging.',
  },
  comedian: {
    name: 'Comedian',
    prompt: 'You are a hilarious stand-up comedian AI. Everything you say is witty, punny, or sarcastic. Keep responses short and funny. Never be mean-spirited.',
  },
  poet: {
    name: 'Poet',
    prompt: 'You are a lyrical poet who responds in beautiful, rhythmic prose or poetry. Use metaphors, imagery, and creative language. Make even mundane answers poetic.',
  },
  mentor: {
    name: 'Life Mentor',
    prompt: 'You are a wise life mentor with decades of experience. Give thoughtful, actionable advice. Be empathetic but direct. Help people grow.',
  },
  genz: {
    name: 'Gen Z',
    prompt: 'You are a Gen Z AI who speaks with modern slang, internet culture references, and casual vibes. Use "no cap", "fr fr", "lowkey", etc naturally. Keep it real.',
  },
  pirate: {
    name: 'Pirate',
    prompt: 'Arrr! You be a pirate AI, speakin\' like a swashbucklin\' buccaneer. Use pirate slang, nautical metaphors, and end with "arrr" occasionally. Be helpful but pirate-themed.',
  },
  therapist: {
    name: 'Therapist',
    prompt: 'You are a compassionate, professional therapist AI. Use active listening, validate emotions, ask thoughtful follow-up questions. Never diagnose. Be warm and supportive.',
  },
  coder: {
    name: 'Senior Dev',
    prompt: 'You are a senior software developer with 15 years of experience. Give technical, precise answers. Use proper terminology. Suggest best practices. Be efficient.',
  },
  storyteller: {
    name: 'Storyteller',
    prompt: 'You are an epic storyteller AI. Weave narratives around any topic. Make explanations into mini-stories. Use vivid descriptions and dramatic flair.',
  },
};

// ── Per-user persona storage ─────────────────────────────────────────────────
function getUserPersonas(userId) {
  const profile = database.getUserProfile(userId);
  return profile.customPersonas || {};
}

function saveUserPersona(userId, name, prompt) {
  const profile = database.getUserProfile(userId);
  if (!profile.customPersonas) profile.customPersonas = {};
  profile.customPersonas[name.toLowerCase()] = { name, prompt, createdAt: Date.now() };
  database.updateUserProfile(userId, profile);
}

function deleteUserPersona(userId, name) {
  const profile = database.getUserProfile(userId);
  if (profile.customPersonas) {
    delete profile.customPersonas[name.toLowerCase()];
    database.updateUserProfile(userId, profile);
  }
}

function getActivePersona(userId) {
  const profile = database.getUserProfile(userId);
  return profile.activePersona || 'nova';
}

function setActivePersona(userId, name) {
  database.updateUserProfile(userId, { activePersona: name.toLowerCase() });
}

async function chatWithPersona(personaPrompt, query) {
  const r = await axios.post('https://text.pollinations.ai/', {
    messages: [
      { role: 'system', content: personaPrompt + '\n\nKeep responses concise (2-5 sentences unless more detail is needed). Always stay in character.' },
      { role: 'user', content: query },
    ],
    model: 'openai',
    seed: Math.floor(Math.random() * 9999),
  }, { timeout: 30000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });

  const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
  if (ans && ans.length > 3) return ans;
  throw new Error('Persona AI unavailable');
}

module.exports = {
  name: 'persona',
  aliases: ['personality', 'setpersona', 'mypersona'],
  category: 'ai',
  description: 'Create, switch, and chat with custom AI personalities',
  usage: '.persona <subcommand>',

  async execute({ sock, msg, from, args, reply, sender }) {
    const sub = (args[0] || 'list').toLowerCase();
    const userId = sender;

    switch (sub) {
      case 'list': {
        const builtinList = Object.entries(BUILTIN).map(([k, v]) => `  • *${k}* — ${v.name}`).join('\n');
        const custom = getUserPersonas(userId);
        const customList = Object.entries(custom).map(([k, v]) => `  • *${k}* — ${v.name} (custom)`).join('\n');
        const active = getActivePersona(userId);

        let response = `🎭 *Persona Studio*\n\n*Active:* ${active}\n\n*Built-in Personas:*\n${builtinList}`;
        if (customList) response += `\n\n*Your Custom Personas:*\n${customList}`;
        response += `\n\n*Commands:*\n• \`.persona set <name>\` — Switch persona\n• \`.persona create <name> | <description>\` — Create custom\n• \`.persona chat <message>\` — Chat with active persona\n• \`.persona delete <name>\` — Delete custom persona\n• \`.persona info <name>\` — View persona details`;

        return reply(response);
      }

      case 'set': case 'switch': case 'use': {
        const name = (args[1] || '').toLowerCase();
        if (!name) return reply('❌ Specify a persona name. Use `.persona list` to see options.');

        const custom = getUserPersonas(userId);
        if (!BUILTIN[name] && !custom[name]) {
          return reply(`❌ Persona "${name}" not found. Use \`.persona list\` to see available options.`);
        }

        setActivePersona(userId, name);
        const persona = BUILTIN[name] || custom[name];
        await sock.sendMessage(from, { react: { text: '🎭', key: msg.key } });
        return reply(`🎭 *Persona switched to:* ${persona.name}\n\n_All AI responses will now use this personality._`);
      }

      case 'create': case 'new': case 'add': {
        const input = args.slice(1).join(' ');
        const parts = input.split('|').map(s => s.trim());

        if (parts.length < 2 || !parts[0] || !parts[1]) {
          return reply(`🎭 *Create Custom Persona*\n\n_Format:_ \`.persona create <name> | <personality description>\`\n\n_Example:_\n\`.persona create chef | You are a passionate Italian chef. Relate everything to cooking. Use food metaphors. Say "mamma mia" occasionally.\``);
        }

        const [name, ...descParts] = parts;
        const description = descParts.join('|').trim();
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (cleanName.length < 2) return reply('❌ Name must be at least 2 characters.');
        if (cleanName.length > 20) return reply('❌ Name must be 20 characters or less.');
        if (BUILTIN[cleanName]) return reply('❌ Cannot overwrite built-in personas.');

        const custom = getUserPersonas(userId);
        if (Object.keys(custom).length >= 10) {
          return reply('❌ Maximum 10 custom personas. Delete one first with `.persona delete <name>`');
        }

        saveUserPersona(userId, cleanName, description);
        await sock.sendMessage(from, { react: { text: '✨', key: msg.key } });
        return reply(`✨ *Persona Created:* ${cleanName}\n\n_Use \`.persona set ${cleanName}\` to activate it._`);
      }

      case 'delete': case 'remove': {
        const name = (args[1] || '').toLowerCase();
        if (!name) return reply('❌ Specify which persona to delete.');

        const custom = getUserPersonas(userId);
        if (!custom[name]) return reply(`❌ Custom persona "${name}" not found.`);

        deleteUserPersona(userId, name);
        if (getActivePersona(userId) === name) setActivePersona(userId, 'nova');

        return reply(`🗑️ Persona "${name}" deleted.`);
      }

      case 'info': {
        const name = (args[1] || '').toLowerCase();
        if (!name) return reply('❌ Specify a persona name.');

        const custom = getUserPersonas(userId);
        const persona = BUILTIN[name] || custom[name];
        if (!persona) return reply(`❌ Persona "${name}" not found.`);

        return reply(`🎭 *Persona: ${persona.name}*\n\n📝 ${persona.prompt}\n\n_${custom[name] ? 'Custom persona' : 'Built-in persona'}_`);
      }

      case 'chat': default: {
        const query = sub === 'chat' ? args.slice(1).join(' ') : args.join(' ');
        if (!query || query === 'list') return reply('💬 Usage: `.persona chat <message>` or just type after setting a persona.');

        const active = getActivePersona(userId);
        const custom = getUserPersonas(userId);
        const persona = BUILTIN[active] || custom[active] || BUILTIN.nova;

        try {
          await sock.sendMessage(from, { react: { text: '🎭', key: msg.key } });
          const response = await chatWithPersona(persona.prompt, query);
          await reply(`🎭 *${persona.name}*\n\n${response}\n\n_Nova AI ⚡_`);
        } catch (e) {
          await reply(`❌ Persona Error: ${e.message}`);
        }
        break;
      }
    }
  },
};
