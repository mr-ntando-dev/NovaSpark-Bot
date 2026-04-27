/**
 * ⚡ NovaSpark Bot v5 — AI Music Generator
 * .genmusic <prompt> — generates a full song:
 *   • AI cover art image (pollinations.ai image — separate from text, no rate limit)
 *   • Full lyrics with Intro/Verse/Chorus/Bridge/Outro
 *   • TTS audio (Google TTS chunked, no API key needed)
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function progressBar(pct, len) {
  len = len || 14;
  const filled = Math.round(pct / 100 * len);
  return '█'.repeat(filled) + '░'.repeat(len - filled);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function makeSongTitle(prompt) {
  const stop = ['a','an','the','of','about','for','in','on','with','and','or','to','is'];
  const words = prompt.trim().split(/\s+/)
    .filter(w => !stop.includes(w.toLowerCase()))
    .slice(0, 4);
  if (!words.length) words.push(...prompt.trim().split(/\s+/).slice(0, 3));
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── LYRICS GENERATION ────────────────────────────────────────────────────────
// API 1: gurusensei llama (free, reliable)
async function lyricsGurusensei(prompt, songTitle) {
  const q = encodeURIComponent(
    'You are a professional songwriter. Write ONLY complete song lyrics (no explanation, no preamble). ' +
    'Include sections labeled [Intro] [Verse 1] [Chorus] [Verse 2] [Bridge] [Chorus] [Outro]. ' +
    'Song title: "' + songTitle + '". Theme: ' + prompt
  );
  const r = await axios.get('https://api.gurusensei.workers.dev/llama?prompt=' + q, {
    timeout: 35000, headers: { 'User-Agent': UA }
  });
  const text = r.data?.response?.response || r.data?.response || '';
  if (typeof text === 'string' && text.length > 100) return text.trim();
  throw new Error('gurusensei empty response');
}

// API 2: pollinations text with retry + jitter
async function lyricsPollinations(prompt, songTitle) {
  const userPrompt = 'Write complete song lyrics called "' + songTitle + '" about: ' + prompt +
    '. Include [Intro][Verse 1][Chorus][Verse 2][Bridge][Outro] sections. Only output lyrics, no explanation.';
  const seed = Math.floor(Math.random() * 999999);
  const url = 'https://text.pollinations.ai/' + encodeURIComponent(userPrompt) +
    '?model=mistral&seed=' + seed;
  // wait 2s before retrying pollinations (avoid burst rate limit)
  await sleep(2000);
  const r = await axios.get(url, { timeout: 40000, headers: { 'User-Agent': UA } });
  const text = typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
  if (text && text.length > 100 && !text.includes('"error"')) return text.trim();
  throw new Error('pollinations text failed');
}

// API 3: Fallback — craft lyrics locally using templates
function lyricsTemplate(prompt, songTitle) {
  const t = prompt.toLowerCase();
  const isGospel = /gospel|praise|worship|god|jesus|holy|church|prayer/.test(t);
  const isLove = /love|heart|miss|romance|girl|boy|together|apart/.test(t);
  const isHustle = /hustle|grind|money|success|rich|work|boss|dream/.test(t);

  let theme = isGospel ? 'faith and praise' : isLove ? 'love and longing' : isHustle ? 'hustle and success' : prompt;

  return (
    '[Intro]\n' +
    'Yeah... listen...\n' +
    'This one right here is for ' + theme + '\n\n' +
    '[Verse 1]\n' +
    'Every morning I wake up with a purpose in my soul\n' +
    'Got a story left to tell and a fire left to burn\n' +
    'I been through the valleys, I been through the rain\n' +
    'But every single struggle made me stronger in the game\n\n' +
    '[Chorus]\n' +
    songTitle + ' — that\'s the name\n' +
    'Nothing gonna stop me, I was built for this flame\n' +
    songTitle + ' — hear my name\n' +
    'Rising from the ashes, I will never be the same\n\n' +
    '[Verse 2]\n' +
    'They said I would not make it, said I\'d fall before I rise\n' +
    'But I kept my eyes on heaven and the stars beyond the skies\n' +
    'Now look at where I\'m standing, all the doubters lost their voice\n' +
    'I turned my pain to power, and my silence into noise\n\n' +
    '[Bridge]\n' +
    'When the night gets dark and the road gets long\n' +
    'I remember why I started, why I\'ve got to stay strong\n' +
    'Every scar a lesson, every tear a stepping stone\n' +
    'I was never really lost because I was never alone\n\n' +
    '[Chorus]\n' +
    songTitle + ' — that\'s the name\n' +
    'Nothing gonna stop me, I was built for this flame\n' +
    songTitle + ' — hear my name\n' +
    'Rising from the ashes, I will never be the same\n\n' +
    '[Outro]\n' +
    'Yeah... ' + songTitle + '...\n' +
    'This one\'s for everyone out there fighting for their dreams\n' +
    'Keep going...\n'
  );
}

async function generateLyrics(prompt, songTitle) {
  const fns = [lyricsGurusensei, lyricsPollinations];
  for (const fn of fns) {
    try { return await fn(prompt, songTitle); } catch {}
  }
  // Last resort: template
  return lyricsTemplate(prompt, songTitle);
}

// ── COVER ART ─────────────────────────────────────────────────────────────────
function generateCoverArtUrl(prompt, songTitle) {
  const imgPrompt = encodeURIComponent(
    'professional album cover art, cinematic, dark moody lighting, ' +
    songTitle + ', ' + prompt +
    ', high contrast, 4k, trending on artstation, music cover design'
  );
  return 'https://image.pollinations.ai/prompt/' + imgPrompt +
    '?width=512&height=512&nologo=true&seed=' + Math.floor(Math.random() * 99999);
}

// ── TTS AUDIO (chunked Google TTS + concat) ───────────────────────────────────
async function generateAudio(lyrics) {
  // Extract clean lines (skip section headers like [Chorus])
  const lines = lyrics.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('[') && !l.startsWith('(') && l.length > 3);

  // Take first 20 lines max, build chunks of max 190 chars
  const targetLines = lines.slice(0, 20);
  const chunks = [];
  let current = '';
  for (const line of targetLines) {
    if ((current + ' ' + line).length > 190) {
      if (current) chunks.push(current.trim());
      current = line;
    } else {
      current += (current ? ' ' : '') + line;
    }
  }
  if (current) chunks.push(current.trim());

  const buffers = [];
  for (const chunk of chunks.slice(0, 6)) { // max 6 chunks = ~1140 chars spoken
    try {
      const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' +
        encodeURIComponent(chunk) + '&tl=en&client=gtx';
      const r = await axios.get(url, {
        responseType: 'arraybuffer', timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://translate.google.com/' }
      });
      if (r.data && r.data.byteLength > 500) {
        buffers.push(Buffer.from(r.data));
      }
      await sleep(300); // small delay between chunks
    } catch { /* skip failed chunk */ }
  }

  if (!buffers.length) throw new Error('All TTS chunks failed');
  return Buffer.concat(buffers);
}

// ── COMMAND ──────────────────────────────────────────────────────────────────
module.exports = {
  name: 'genmusic',
  aliases: ['makemusic', 'aimusic', 'createsong', 'songgen'],
  category: 'ai',
  description: 'Generate an AI song with cover art + full lyrics + audio',
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

    // ── STEP 1: Announce ─────────────────────────────────────────────────────
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
      // ── STEP 2: Cover art URL (non-blocking, image API doesn't rate limit) ──
      const coverUrl = generateCoverArtUrl(prompt, songTitle);

      // ── STEP 3: Lyrics ───────────────────────────────────────────────────
      await sock.sendMessage(from, {
        text:
          '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
          '  🎵 *NovaSpark Music AI*\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
          '🎼 *Song:* ' + songTitle + '\n\n' +
          progressBar(35) + ' 35%\n' +
          '✍️ Writing lyrics...',
      }, { quoted: msg });

      const lyrics = await generateLyrics(prompt, songTitle);

      // ── STEP 4: Audio ────────────────────────────────────────────────────
      await sock.sendMessage(from, {
        text:
          '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
          '  🎵 *NovaSpark Music AI*\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
          '🎼 *Song:* ' + songTitle + '\n\n' +
          progressBar(70) + ' 70%\n' +
          '🎤 Generating audio...',
      }, { quoted: msg });

      let audioBuffer = null;
      try { audioBuffer = await generateAudio(lyrics); } catch {}

      // ── STEP 5: Send cover art + caption ─────────────────────────────────
      await sock.sendMessage(from, {
        image:   { url: coverUrl },
        caption:
          '🎵 *' + songTitle + '*\n' +
          '🎼 _' + prompt + '_\n\n' +
          '🎤 Lyrics below ↓',
      }, { quoted: msg });

      // ── STEP 6: Send audio ───────────────────────────────────────────────
      if (audioBuffer && audioBuffer.length > 1000) {
        const tmpFile = path.join(os.tmpdir(), 'ns_genmusic_' + Date.now() + '.mp3');
        fs.writeFileSync(tmpFile, audioBuffer);
        await sock.sendMessage(from, {
          audio:    fs.readFileSync(tmpFile),
          mimetype: 'audio/mpeg',
          fileName: songTitle + '.mp3',
          ptt:      false,
        }, { quoted: msg });
        fs.unlink(tmpFile, () => {});
      }

      // ── STEP 7: Send full lyrics ─────────────────────────────────────────
      await sock.sendMessage(from, {
        text:
          '📜 *Lyrics — ' + songTitle + '*\n' +
          '━'.repeat(30) + '\n\n' +
          lyrics + '\n\n' +
          '━'.repeat(30) + '\n' +
          '_⚡ Generated by NovaSpark Music AI_',
      }, { quoted: msg });

    } catch (e) {
      await reply(
        '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
        '  ❌ *Generation Failed*\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
        '• Error: ' + e.message + '\n\n' +
        '_Please try again. If this keeps failing, try a shorter prompt._'
      );
    }
  },
};
