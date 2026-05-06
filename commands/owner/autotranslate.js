/**
 * ⚡ NovaSpark Bot v8.0 — Auto Translate Incoming Messages
 * .autotranslate on <lang>  — Translate all incoming msgs to target lang
 * .autotranslate off        — Disable
 * .autotranslate status     — Show current status
 * Uses MyMemory free translation API (no key needed)
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

async function translateText(text, to) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${to}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const json = await res.json();
    return json?.responseData?.translatedText || null;
  } catch {
    return null;
  }
}

const LANG_NAMES = {
  en: 'English', af: 'Afrikaans', zu: 'Zulu', sn: 'Shona', nd: 'Ndebele',
  xh: 'Xhosa', fr: 'French', es: 'Spanish', pt: 'Portuguese', ar: 'Arabic',
  zh: 'Chinese', hi: 'Hindi', sw: 'Swahili', de: 'German', it: 'Italian',
  ru: 'Russian', ja: 'Japanese', ko: 'Korean', tr: 'Turkish', nl: 'Dutch',
};

module.exports = {
  name: 'autotranslate',
  aliases: ['autotrans', 'translateall'],
  description: 'Auto-translate all incoming messages to a target language',
  category: 'owner',
  ownerOnly: false,

  // Called by the handler on every incoming message
  onMessage: async ({ sock, msg, from, text, sender, isOwner, isAdmin }) => {
    if (!text || text.startsWith('.')) return; // skip commands
    const gs = database.getGroupSettings ? database.getGroupSettings(from) : {};
    if (!gs.autoTranslate || !gs.autoTranslateLang) return;

    const translated = await translateText(text, gs.autoTranslateLang);
    if (!translated || translated.toLowerCase() === text.toLowerCase()) return;

    const langName = LANG_NAMES[gs.autoTranslateLang] || gs.autoTranslateLang.toUpperCase();
    await sock.sendMessage(from, {
      text: `🌍 *[${langName}]* ${translated}`,
    }, { quoted: msg });
  },

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      const lang = (args[1] || 'en').toLowerCase();
      database.updateGroupSettings(from, { autoTranslate: true, autoTranslateLang: lang });
      const langName = LANG_NAMES[lang] || lang.toUpperCase();
      return reply(
        `🌍 *Auto Translate: ON*\n\n` +
        `All incoming messages will be translated to *${langName}* (${lang})\n\n` +
        `_Supported codes: en, af, zu, sn, nd, xh, fr, es, pt, ar, zh, hi, sw, de, it, ru, ja, ko, tr, nl_`
      );
    }

    if (sub === 'off') {
      database.updateGroupSettings(from, { autoTranslate: false });
      return reply('🌍 *Auto Translate: OFF*');
    }

    const gs = database.getGroupSettings(from);
    const langName = gs.autoTranslateLang ? (LANG_NAMES[gs.autoTranslateLang] || gs.autoTranslateLang) : 'Not set';
    return reply(
      '🌍 *Auto Translate*\n\n' +
      `Status: *${gs.autoTranslate ? 'ON ✅' : 'OFF ❌'}*\n` +
      `Target Language: *${langName}*\n\n` +
      '`.autotranslate on <lang>` — Enable (e.g. `.autotranslate on en`)\n' +
      '`.autotranslate off` — Disable\n\n' +
      '_Language codes: en, af, zu, sn, fr, es, pt, ar, zh, sw, de, it..._'
    );
  },
};
