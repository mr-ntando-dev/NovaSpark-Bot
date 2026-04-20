/**
 * NovaSpark Bot v3 — Text-to-Speech
 * .tts <text>  — converts text to a real voice note using Google TTS
 * No API key required. Uses the public Google Translate TTS endpoint.
 * By Dev-Ntando
 */
'use strict';

const axios    = require('axios');
const database = require('../../database');

// Language aliases for easy use
const LANG_ALIASES = {
  english: 'en',  en: 'en',
  shona:   'sn',  sn: 'sn',
  ndebele: 'nd',  nd: 'nd',
  zulu:    'zu',  zu: 'zu',
  xhosa:   'xh',  xh: 'xh',
  french:  'fr',  fr: 'fr',
  spanish: 'es',  es: 'es',
  arabic:  'ar',  ar: 'ar',
  hindi:   'hi',  hi: 'hi',
  swahili: 'sw',  sw: 'sw',
  portuguese: 'pt', pt: 'pt',
  german:  'de',  de: 'de',
};

module.exports = {
  name: 'tts',
  aliases: ['speak', 'voice', 'say'],
  description: 'Convert text to a real voice note (supports multiple languages)',
  category: 'free',

  execute: async ({ sock, from, sender, args, msg, reply }) => {
    database.logCommand(sender, 'tts');

    if (!args.length) {
      return reply(
        '🎙️ *Text-to-Speech*\n\n' +
        'Usage: *.tts [lang] <text>*\n\n' +
        'Examples:\n' +
        '  .tts Hello! I am NovaSpark Bot\n' +
        '  .tts fr Bonjour tout le monde!\n' +
        '  .tts sw Habari za asubuhi!\n\n' +
        'Supported languages:\n' +
        '  en · fr · es · de · ar · hi · sw · pt · sn · zu\n\n' +
        '_Max 200 characters_'
      );
    }

    // Check if first arg is a language code
    let lang = 'en';
    let textArgs = [...args];

    const possibleLang = args[0].toLowerCase();
    if (LANG_ALIASES[possibleLang]) {
      lang      = LANG_ALIASES[possibleLang];
      textArgs  = args.slice(1);
    }

    const text = textArgs.join(' ').trim();
    if (!text) return reply('❌ Please provide some text to speak.');
    if (text.length > 200) return reply(`❌ Text too long (${text.length}/200 chars). Please shorten it.`);

    await sock.sendPresenceUpdate('recording', from);

    try {
      // Google Translate TTS — public endpoint, no key, returns MP3
      const encoded = encodeURIComponent(text);
      const ttsUrl  = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;

      const { data: audioBuffer } = await axios.get(ttsUrl, {
        responseType: 'arraybuffer',
        timeout:      15000,
        headers: {
          'User-Agent':  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer':     'https://translate.google.com/',
          'Accept':      'audio/mpeg',
        },
      });

      const buffer = Buffer.from(audioBuffer);

      if (buffer.length < 1000) throw new Error('TTS response too small');

      await sock.sendMessage(from, {
        audio:    buffer,
        mimetype: 'audio/mpeg',
        ptt:      true,   // ← this makes it a WhatsApp voice note
      }, { quoted: msg });

    } catch (err) {
      console.error('[tts]', err.message);
      // Fallback: try a different free TTS
      try {
        const { data: fb } = await axios.get(
          `https://api.voicerss.org/?key=free&hl=${lang}-${lang.toUpperCase()}&src=${encodeURIComponent(text)}&f=16khz_16bit_mono`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        const fbBuf = Buffer.from(fb);
        if (fbBuf.length > 1000) {
          await sock.sendMessage(from, {
            audio: fbBuf, mimetype: 'audio/wav', ptt: true,
          }, { quoted: msg });
          return;
        }
      } catch (_) { /* both failed */ }

      await reply('❌ TTS service unavailable right now. Try again in a moment.\n\n_Tip: Google TTS works best for English (en)_');
    }
  },
};
