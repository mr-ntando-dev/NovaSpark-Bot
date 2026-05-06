/**
 * ⚡ NovaSpark Bot v10 — AI Document Analyzer
 * Summarize, extract, and answer questions about documents
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function analyzeDocument(text, query) {
  const r = await axios.post('https://text.pollinations.ai/', {
    messages: [
      { role: 'system', content: 'You are NovaSpark Document AI. Analyze the provided document text and respond to the user query. Be thorough but concise. Use bullet points for key findings.' },
      { role: 'user', content: `Document content:\n---\n${text.substring(0, 8000)}\n---\n\nQuery: ${query}` },
    ],
    model: 'openai',
    seed: Math.floor(Math.random() * 9999),
  }, { timeout: 40000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });

  const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
  if (ans && ans.length > 5) return ans;
  throw new Error('Document analysis failed');
}

module.exports = {
  name: 'docanalyze',
  aliases: ['doc', 'readdoc', 'pdfscan', 'summarizedoc'],
  category: 'ai',
  description: 'Analyze documents — summarize, extract key points, answer questions',
  usage: '.docanalyze [question] (reply to a document)',

  async execute({ sock, msg, from, args, reply }) {
    const query = args.join(' ') || 'Summarize this document. List the key points.';
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const hasDoc = msg.message?.documentMessage || quotedMsg?.documentMessage;
    const hasText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text;

    if (!hasDoc && !hasText) {
      return reply('📄 *AI Document Analyzer*\n\nReply to a document or long text message.\n\n_Examples:_\n• `.docanalyze` — Summarize\n• `.docanalyze What are the main arguments?`\n• `.docanalyze Extract all dates and names`');
    }

    try {
      await sock.sendMessage(from, { react: { text: '📄', key: msg.key } });

      let text;
      if (hasText) {
        text = hasText;
      } else {
        let buffer;
        if (msg.message?.documentMessage) {
          buffer = await downloadMediaMessage(msg, 'buffer', {});
        } else {
          const tempMsg = { key: { ...msg.key }, message: quotedMsg };
          buffer = await downloadMediaMessage(tempMsg, 'buffer', {});
        }
        text = buffer.toString('utf-8');
      }

      if (!text || text.length < 10) return reply('❌ Could not read document content.');

      const result = await analyzeDocument(text, query);
      await reply(`📄 *Document Analysis*\n\n${result}\n\n_Nova AI ⚡_`);
    } catch (e) {
      await reply(`❌ Doc Error: ${e.message}`);
    }
  },
};
