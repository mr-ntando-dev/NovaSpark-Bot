'use strict';
const database = require('../../database');
const config   = require('../../config');

module.exports = {
  name: 'myplan',
  aliases: ['plan', 'upgrade'],
  description: 'Check your current plan and available features',
  category: 'free',
  execute: async ({ sender, reply }) => {
    const userId   = sender.split('@')[0];
    const premium  = database.isPremium(userId);
    const profile  = database.getProfile(userId);
    const ownerNum = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;

    const freeFeatures = [
      '⚡ AutoChat AI (smart replies, memory, personas)',
      '📚 Homework Helper (.homework)',
      '✍️ Essay Writer (.essay)',
      '📋 Summarizer (.summarize)',
      '🌍 Translator (.translate)',
      '📖 Study Tips (.studytips)',
      '📄 Project PDF Generator (.pdf)',
      '🎭 5 AI Personas',
      '🖼️ Auto Image Generation & Analysis',
      '📝 OCR (read text from images)',
    ];

    const premiumFeatures = [
      '💎 Everything in Free',
      '🎓 Exam Prep AI (.examprep)',
      '💻 Code Generator (.code)',
      '🔢 Math Solver (.math)',
      '🔔 Reminder System (.remind)',
      '📊 Analytics Dashboard (.mystats)',
      '📚 Auto Study Mode (.autostudy)',
      '🎭 Custom AI Persona (.setpersona)',
      '📄 Unlimited PDF types (CV, research paper, report)',
      '⚡ Priority AI — faster & more detailed responses',
    ];

    if (premium) {
      await reply(
        `💎 *${profile?.name || 'You\'re on'} Premium Plan!*\n\n` +
        `🎉 You have access to ALL features:\n\n` +
        premiumFeatures.map(f => `  ${f}`).join('\n') +
        `\n\n_Thank you for supporting NovaSpark Bot! ⚡_`
      );
    } else {
      await reply(
        `🆓 *${profile?.name ? profile.name + '\'s' : 'Your'} Free Plan*\n\n` +
        `✅ *What you have:*\n${freeFeatures.map(f => `  ${f}`).join('\n')}\n\n` +
        `🔒 *Unlock Premium:*\n${premiumFeatures.map(f => `  ${f}`).join('\n')}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💬 *To upgrade, contact:*\nwa.me/${ownerNum}\n\n` +
        `_NovaSpark Bot ⚡ by Dev-Ntando_`
      );
    }
  },
};
