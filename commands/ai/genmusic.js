/**
 * ⚡ NovaSpark Bot v5 — AI Music Generator
 * .genmusic <prompt> — generates a unique song:
 *   • AI cover art image (via pollinations.ai)
 *   • AI-generated lyrics (via pollinations text)
 *   • TTS audio of the song (via tts api)
 * No API key required.
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

function progressBar(pct, len) {
  len = len || 14;
  const filled = Math.round(pct / 100 * len);
  return '█'.repeat(filled) + '░'.repeat(len - filled);
}

// Generate a creative song title from the prompt
function makeSongTitle(prompt) {
  const words = prompt.trim().split(/\s+/).slice(0, 5);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Generate lyrics via pollinations.ai free text API
async function generateLyrics(prompt, songTitle) {
  const systemPrompt = 'You are a professional songwriter. Write complete song lyrics with [Intro], [Verse 1], [Chorus], [Verse 2], [Bridge], [Outro] sections. Make it emotional, creative, and original. Use vivid imagery. Do NOT include any explanation — only the lyrics.';
  const userPrompt = 'Write a full song called "' + songTitle + '" about: ' + prompt + '. Make it radio-ready, 3-4 minutes long when sung.';

  const encoded = encodeURIComponent(userPrompt);
  const sysEncoded = encodeURIComponent(systemPrompt);
  const url = 'https://text.pollinations.ai/' + encoded + '?system=' + sysEncoded + '&model=openai&seed=' + Math.floor(Math.random() * 99999);

  const r = await axios.get(url, { timeout: 30000, headers: { 'User-Agent': 'NovaSpark-Bot/5.0' } });
  return (typeof r.data === 'string' ? r.data : JSON.stringify(r.data)).trim();
}

// Generate cover art via pollinations.ai free image API
async function generateCoverArt(prompt, songTitle) {
  const imgPrompt = encodeURIComponent(
    'album cover art, cinematic, professional music cover, ' +
    songTitle + ', ' + prompt +
    ', dark moody lighting, high contrast, detailed, 4k, trending on artstation'
  );
  const imgUrl = 'https://image.pollinations.ai/prompt/' + imgPrompt + '?width=512&height=512&nologo=true&seed=' + Math.floor(Math.random() * 99999);
  // Just return URL — Baileys will fetch it
  return imgUrl;
}

// Generate TTS audio of the first verse via Google TTS
async function generateAudio(lyrics, lang) {
  lang = lang || 'en';
  // Extract just the first verse + chorus to keep audio short
  const lines = lyrics.split('\n').filter(l => l.trim() && !l.startsWith('['));
  const snippet = lines.slice(0, 12).join(' ');
  const encoded = encodeURIComponent(snippet.slice(0, 200));
  const ttsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encoded + '&tl=' + lang + '&client=gtx';

  const r = await axios.get(ttsUrl, { responseType: 'arraybuffer', timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://translate.google.com/' } });
  return Buffer.from(r.data);
}

module.exports = {
  name: 'genmusic',
  aliases: ['makemusic', 'aimusic', 'createsong', 'songgen'],
  category: 'ai',
  description: 'Generate an AI song with cover art + lyrics + audio',
  usage: '.genmusic <describe your song>',

  async execute({ sock, msg, from, args, reply }) {
    const prompt = args.join(' ').trim();
    if (!prompt) return reply(
      '🎵 *AI Music Generator*\n\n' +
      'Usage: _.genmusic <describe your song>_\n\n' +
      'Examples:\n' +
      '• .genmusic a rap song about Mr Frank\n' +
      '• .genmusic gospel praise song in Zulu\n' +
      '• .genmusic sad love song about missing someone\n' +
      '• .genmusic afrobeats banger about hustle and success'
    );

    await sock.sendMessage(from, { react: { text: '🎵', key: msg.key } });

    const songTitle = makeSongTitle(prompt);

    // Step 1 — announce
    await sock.sendMessage(from, {
      text:
        '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
        '  🎵 *NovaSpark Music AI*\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
        '🎼 *Song:* ' + songTitle + '\n' +
        '📝 *Prompt:* _' + prompt + '_\n\n' +
        progressBar(10) + ' 10%\n' +
        '🎨 Generating cover art...',
    }, { quoted: msg });

    try {
      // Step 2 — cover art
      const coverUrl = await generateCoverArt(prompt, songTitle);

      // Step 3 — lyrics
      await sock.sendMessage(from, {
        text:
          '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
          '  🎵 *NovaSpark Music AI*\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
          '🎼 *Song:* ' + songTitle + '\n\n' +
          progressBar(45) + ' 45%\n' +
          '✍️ Writing lyrics...',
      }, { quoted: msg });

      const lyrics = await generateLyrics(prompt, songTitle);

      // Step 4 — TTS audio
      await sock.sendMessage(from, {
        text:
          '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
          '  🎵 *NovaSpark Music AI*\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
          '🎼 *Song:* ' + songTitle + '\n\n' +
          progressBar(75) + ' 75%\n' +
          '🎤 Generating audio...',
      }, { quoted: msg });

      let audioBuffer;
      try { audioBuffer = await generateAudio(lyrics, 'en'); } catch { audioBuffer = null; }

      // Step 5 — send cover art + metadata card
      await sock.sendMessage(from, {
        image: { url: coverUrl },
        caption:
          '🎵 *' + songTitle + '*\n' +
          '🎼 _' + prompt + '_\n\n' +
          '🎤 Lyrics below ↓',
      }, { quoted: msg });

      // Step 6 — send audio if generated
      if (audioBuffer && audioBuffer.length > 1000) {
        const tmpFile = path.join(os.tmpdir(), 'ns_genmusic_' + Date.now() + '.mp3');
        fs.writeFileSync(tmpFile, audioBuffer);
        await sock.sendMessage(from, {
          audio:    fs.readFileSync(tmpFile),
          mimetype: 'audio/mp4',
          fileName: songTitle + '.mp3',
          ptt:      false,
        }, { quoted: msg });
        fs.unlink(tmpFile, () => {});
      }

      // Step 7 — send lyrics
      await sock.sendMessage(from, {
        text:
          '📜 *Lyrics — ' + songTitle + '*\n' +
          '━'.repeat(30) + '\n\n' +
          lyrics + '\n\n' +
          '━'.repeat(30) + '\n' +
          '_⚡ Generated by NovaSpark Music AI_',
      }, { quoted: msg });

    } catch (e) {
      await reply('❌ Music generation failed: ' + e.message + '\n\n_Try again in a moment._');
    }
  },
};
