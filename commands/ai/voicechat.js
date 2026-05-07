/**
 * ⚡ NovaSpark Bot v10 — AI Voice Chat
 * Transcribe voice messages + respond with AI
 * Supports voice note replies and voice-to-text
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function transcribeAudio(audioBuffer) {
  const apis = [
    // API 1: Whisper via free endpoint
    async () => {
      const form = new FormData();
      form.append('file', audioBuffer, { filename: 'audio.ogg', contentType: 'audio/ogg' });
      form.append('model', 'whisper-large-v3');
      const r = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
        timeout: 30000,
        headers: { ...form.getHeaders(), 'User-Agent': UA },
      });
      if (r.data?.text) return r.data.text;
      throw new Error('No transcription');
    },
    // API 2: GiftedTech STT
    async () => {
      const form = new FormData();
      form.append('audio', audioBuffer, { filename: 'audio.ogg', contentType: 'audio/ogg' });
      const r = await axios.post('https://api.giftedtech.web.id/api/ai/stt', form, {
        timeout: 30000,
        headers: { ...form.getHeaders(), 'User-Agent': UA },
      });
      const text = r.data?.result || r.data?.text || r.data?.transcription;
      if (text) return text;
      throw new Error('No transcription');
    },
    // API 3: Pollinations transcription
    async () => {
      const form = new FormData();
      form.append('file', audioBuffer, { filename: 'audio.ogg', contentType: 'audio/ogg' });
      const r = await axios.post('https://text.pollinations.ai/transcribe', form, {
        timeout: 30000,
        headers: { ...form.getHeaders(), 'User-Agent': UA },
      });
      const text = typeof r.data === 'string' ? r.data.trim() : r.data?.text;
      if (text) return text;
      throw new Error('No transcription');
    },
  ];

  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('Voice transcription is currently unavailable.');
}

async function getAIResponse(text) {
  const r = await axios.post('https://text.pollinations.ai/', {
    messages: [
      { role: 'system', content: 'You are NovaSpark, a helpful WhatsApp voice assistant. The user sent a voice note which has been transcribed. Respond naturally and concisely (2-4 sentences). Be friendly and helpful.' },
      { role: 'user', content: text },
    ],
    model: 'openai-fast',
    seed: Math.floor(Math.random() * 9999),
  }, { timeout: 25000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });

  const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
  if (ans && ans.length > 3) return ans;
  throw new Error('AI response unavailable');
}

module.exports = {
  name: 'voicechat',
  aliases: ['vc', 'transcribe', 'stt', 'voicechatmode', 'listen'],
  category: 'ai',
  description: 'Transcribe voice messages and get AI responses',
  usage: '.voicechat (reply to a voice note)',

  async execute({ sock, msg, from, args, reply }) {
    const mode = (args[0] || 'chat').toLowerCase(); // 'chat' or 'text'
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const hasAudio = msg.message?.audioMessage || quotedMsg?.audioMessage;

    if (!hasAudio) {
      return reply(`🎙️ *AI Voice Chat*\n\nReply to a voice note with this command.\n\n*Modes:*\n• \`.voicechat\` — Transcribe + AI response\n• \`.voicechat text\` — Just transcribe (no AI reply)\n\n_Send a voice note and reply to it with .voicechat_`);
    }

    try {
      await sock.sendMessage(from, { react: { text: '🎙️', key: msg.key } });

      // Download audio
      let buffer;
      if (msg.message?.audioMessage) {
        buffer = await downloadMediaMessage(msg, 'buffer', {});
      } else {
        const tempMsg = { key: { ...msg.key }, message: quotedMsg };
        buffer = await downloadMediaMessage(tempMsg, 'buffer', {});
      }

      if (!buffer || buffer.length < 100) {
        return reply('❌ Could not download the voice note. Try again.');
      }

      // Transcribe
      const transcription = await transcribeAudio(buffer);

      if (mode === 'text') {
        return reply(`🎙️ *Transcription*\n\n"${transcription}"\n\n_Nova AI ⚡_`);
      }

      // Get AI response to transcription
      const aiResponse = await getAIResponse(transcription);

      await reply(`🎙️ *Voice Chat*\n\n📝 *You said:* "${transcription}"\n\n🤖 *NovaSpark:* ${aiResponse}\n\n_Nova AI ⚡_`);
    } catch (e) {
      await reply(`❌ Voice Error: ${e.message}`);
    }
  },

  // Auto-handler for voice notes in autochat mode
  async handleVoiceNote(sock, msg, from, groupSettings) {
    if (!groupSettings?.voiceAI) return false;

    const hasAudio = msg.message?.audioMessage;
    if (!hasAudio) return false;

    try {
      const buffer = await downloadMediaMessage(msg, 'buffer', {});
      if (!buffer || buffer.length < 100) return false;

      const transcription = await transcribeAudio(buffer);
      const aiResponse = await getAIResponse(transcription);

      await sock.sendMessage(from, {
        text: `🎙️ *Voice Reply*\n\n📝 "${transcription}"\n\n🤖 ${aiResponse}\n\n_Nova AI ⚡_`,
      }, { quoted: msg });

      return true;
    } catch {
      return false;
    }
  },
};
