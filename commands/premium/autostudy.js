'use strict';
const APIs     = require('../../utils/api');
const database = require('../../database');

const studyIntervals = new Map();

module.exports = {
  name: 'autostudy',
  aliases: ['dailystudy', 'studymode'],
  description: '[PREMIUM] Auto-send daily study tips on a schedule',
  category: 'premium',
  studyIntervals,
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const userId = sender.split('@')[0];
    if (!database.isPremium(userId)) return reply('💎 *.autostudy* is a *Premium* feature.\nType *.myplan* for upgrade info.');
    const sub     = (args[0] || '').toLowerCase();
    database.logCommand(sender, 'autostudy');

    if (sub === 'off') {
      const entry = studyIntervals.get(userId);
      if (entry) { clearInterval(entry.timer); studyIntervals.delete(userId); }
      return reply('📚 Auto Study Mode *OFF*. Stay sharp! 💪');
    }

    if (sub === 'status') {
      const entry = studyIntervals.get(userId);
      if (!entry) return reply('📚 Auto Study Mode is currently *OFF*.\nType *.autostudy on <subject>* to start.');
      return reply(`📚 Auto Study Mode *ON*\nSubject: *${entry.subject}*\nFrequency: Every *${entry.label}*`);
    }

    // Parse: .autostudy on|6h|12h|24h <subject>
    let intervalMs = 24 * 3600000;
    let label      = '24 hours';
    let subjectStart = 1;

    if (['6h', '6'].includes(sub))        { intervalMs = 6  * 3600000; label = '6 hours';  }
    else if (['12h', '12'].includes(sub)) { intervalMs = 12 * 3600000; label = '12 hours'; }
    else if (['on'].includes(sub))        { intervalMs = 24 * 3600000; label = '24 hours'; }
    else                                   { subjectStart = 0; }

    const subject = args.slice(subjectStart).join(' ').trim() || 'general academics';

    if (studyIntervals.has(userId)) {
      clearInterval(studyIntervals.get(userId).timer);
    }

    const profile = database.getProfile(userId);
    const context = profile ? `Student: ${profile.name}, Age: ${profile.age}, School: ${profile.school}.` : '';
    const system  = `You are NovaSpark, an academic motivational coach. ${context}
Give 3-5 fresh, practical, specific study tips for the subject today.
Vary the tips each time — be creative, motivating, and actionable.
Keep it concise and energetic. Use WhatsApp bold (*) for tip titles.`;

    const send = async () => {
      try {
        const tips = await APIs.chatAI(`Give daily study tips for: ${subject}`, system);
        await sock.sendMessage(from, {
          text: `📚 *Daily Study Tips: ${subject}*\n\n${tips}\n\n_Auto Study Mode_

_Nova AI ⚡_`
        });
      } catch { /* silent */ }
    };

    await send();
    const timer = setInterval(send, intervalMs);
    studyIntervals.set(userId, { timer, subject, chatId: from, label });

    await reply(
      `📚 *Auto Study Mode ON!*\n\n` +
      `📖 Subject: *${subject}*\n` +
      `⏰ Frequency: Every *${label}*\n\n` +
      `Type *.autostudy off* to stop.\n` +
      `Type *.autostudy status* to check.`
    );
  },
};
