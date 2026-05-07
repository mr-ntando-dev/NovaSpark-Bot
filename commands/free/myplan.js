'use strict';
const database = require('../../database');
const config   = require('../../config');

module.exports = {
  name: 'myplan',
  aliases: ['plan', 'upgrade', 'planhelp', 'planmenu'],
  description: 'Show all available commands and your plan status',
  category: 'free',
  execute: async ({ sender, reply }) => {
    const userId   = sender.split('@')[0];
    const premium  = database.isPremium(userId);
    const profile  = database.getProfile(userId);
    const ownerNum = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;

    const freeFeatures = [
      // AI / Autochat
      '⚡ AutoChat AI — always on, auto-detects message type',
      '🔢 .math — solve any math, step by step',
      '🌤️ .weather — real-time weather for any city',
      '📚 .homework — AI homework answer',
      '✍️ .essay — full structured essay',
      '📋 .summarize — bullet-point summary',
      '🌍 .translate — any language',
      '📖 .studytips — AI study tips',
      '📄 .pdf — generate a school project PDF',
      // v3 NEW
      '🖼️ .sticker — turn any image/video into a sticker',
      '📰 .news [topic] — live headlines (world/tech/zim/sport…)',
      '📲 .qr <text> — generate a scannable QR code',
      '🎨 .imagine <prompt> — AI image generation (FREE)',
      '🎙️ .tts [lang] <text> — text-to-speech voice note',
      '💱 .currency 100 USD ZAR — live exchange rates',
      '📊 .poll Q | A | B | C — native WhatsApp poll',
      '🧠 .fact — random verified interesting fact',
      '📖 .urban <word> — Urban Dictionary slang lookup',
      '⚖️ .bmi <kg> <cm> — BMI + health advice',
      '👥 .groupinfo — group analytics (groups only)',
      '🔥 .roast @user — AI-generated personalised roast',
      '🎭 .autochat persona <name> — switch AI personality',
    ];

    const premiumFeatures = [
      '💎 Everything in Free — with priority AI',
      '🎓 .examprep — full exam revision notes',
      '💻 .code — generate working code in any language',
      '🔔 .remind — set reminders (30s to 1d)',
      '📊 .mystats — personal usage analytics',
      '📚 .autostudy — daily study tips on schedule',
      '🎭 .setpersona — fully custom AI personality',
    ];

    // All users enjoy Premium for free
    await reply(
      `💎 *${profile?.name || 'Your'} Premium Plan — FREE!*\n\n` +
      `🎉 You have access to ALL features at no cost:\n\n` +
      [...freeFeatures, ...premiumFeatures].map(f => `  ${f}`).join('\n') +
      `\n\n_Enjoy every NovaSpark feature — on the house! 🎁_\n\n_Nova AI ⚡_`
    );
  },
};
