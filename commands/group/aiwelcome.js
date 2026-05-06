/**
 * ⚡ NovaSpark Bot v10 — AI-Powered Welcome Messages
 * Generate personalized, unique welcome messages for each new member
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const database = require('../../database');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const WELCOME_STYLES = {
  friendly: 'warm, friendly, and casual. Use emojis. Make the person feel at home.',
  hype: 'extremely hyped and energetic! Use caps occasionally, lots of emojis, and make them feel like a celebrity just arrived.',
  formal: 'professional and respectful. Welcome them formally.',
  funny: 'humorous and witty. Include a joke or pun about their arrival.',
  poetic: 'poetic and creative. Write a short 2-line poem welcoming them.',
  custom: '', // Uses group's custom prompt
};

async function generateWelcome(memberName, groupName, memberCount, style = 'friendly', customPrompt = '') {
  const styleDesc = style === 'custom' ? customPrompt : WELCOME_STYLES[style] || WELCOME_STYLES.friendly;

  const r = await axios.post('https://text.pollinations.ai/', {
    messages: [
      { role: 'system', content: `Generate a unique welcome message for a new group member. Style: ${styleDesc}\n\nRules:\n- Keep it short (2-3 sentences max)\n- Mention their name\n- Make it unique each time\n- Include the group name if natural\n- Never use the same welcome twice` },
      { role: 'user', content: `New member: ${memberName}\nGroup: ${groupName}\nThey are member #${memberCount}` },
    ],
    model: 'openai-fast',
    seed: Math.floor(Math.random() * 99999),
  }, { timeout: 15000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });

  const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
  if (ans && ans.length > 5) return ans;
  return `Welcome to ${groupName}, ${memberName}! 🎉`;
}

module.exports = {
  name: 'aiwelcome',
  aliases: ['smartwelcome', 'aijoin'],
  category: 'group',
  description: 'AI-generated personalized welcome messages',
  usage: '.aiwelcome <on|off|style|test>',

  async execute({ sock, msg, from, args, reply, isAdmin }) {
    if (!isAdmin) return reply('❌ Admin only.');

    const sub = (args[0] || 'status').toLowerCase();
    const gs = database.getGroupSettings(from);

    switch (sub) {
      case 'on': case 'enable': {
        database.updateGroupSettings(from, { aiWelcome: true, aiWelcomeStyle: gs.aiWelcomeStyle || 'friendly' });
        return reply(`🎉 *AI Welcome* enabled!\n\nStyle: ${gs.aiWelcomeStyle || 'friendly'}\n_Each new member gets a unique AI-generated welcome._`);
      }
      case 'off': case 'disable': {
        database.updateGroupSettings(from, { aiWelcome: false });
        return reply('🎉 AI Welcome disabled.');
      }
      case 'style': {
        const style = (args[1] || '').toLowerCase();
        if (!style || !WELCOME_STYLES[style]) {
          const styles = Object.keys(WELCOME_STYLES).join(', ');
          return reply(`🎉 *Available Styles:* ${styles}\n\nUsage: \`.aiwelcome style <name>\``);
        }
        if (style === 'custom') {
          const prompt = args.slice(2).join(' ');
          if (!prompt) return reply('❌ Custom style needs a prompt.\n\n_Example: `.aiwelcome style custom Be sarcastic and funny`_');
          database.updateGroupSettings(from, { aiWelcomeStyle: 'custom', aiWelcomePrompt: prompt });
          return reply(`🎉 AI Welcome style set to *custom*:\n"${prompt}"`);
        }
        database.updateGroupSettings(from, { aiWelcomeStyle: style });
        return reply(`🎉 AI Welcome style set to: *${style}*`);
      }
      case 'test': {
        const groupMeta = await sock.groupMetadata(from).catch(() => ({ subject: 'Test Group' }));
        const welcome = await generateWelcome('TestUser', groupMeta.subject, 42, gs.aiWelcomeStyle || 'friendly', gs.aiWelcomePrompt);
        return reply(`🎉 *Test Welcome:*\n\n${welcome}`);
      }
      default: {
        const status = gs.aiWelcome ? '✅ ON' : '❌ OFF';
        const style = gs.aiWelcomeStyle || 'friendly';
        return reply(`🎉 *AI Welcome*\n\nStatus: ${status}\nStyle: ${style}\n\n*Commands:*\n• \`.aiwelcome on/off\`\n• \`.aiwelcome style <name>\`\n• \`.aiwelcome test\`\n\n*Styles:* ${Object.keys(WELCOME_STYLES).join(', ')}`);
      }
    }
  },

  // Handler for group join events
  async onMemberJoin(sock, groupId, memberJid, groupMeta) {
    const gs = database.getGroupSettings(groupId);
    if (!gs.aiWelcome) return;

    try {
      const memberName = memberJid.split('@')[0];
      const groupName = groupMeta?.subject || 'the group';
      const memberCount = groupMeta?.participants?.length || '?';
      const style = gs.aiWelcomeStyle || 'friendly';

      const welcome = await generateWelcome(memberName, groupName, memberCount, style, gs.aiWelcomePrompt);

      await sock.sendMessage(groupId, {
        text: `${welcome}\n\n@${memberName}`,
        mentions: [memberJid],
      });
    } catch {}
  },
};
