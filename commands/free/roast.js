/**
 * NovaSpark Bot v3 — AI Roast Generator
 * .roast @user or .roast <name>
 * Generates a personalised, funny (not cruel) roast using AI
 * By Dev-Ntando
 */
'use strict';

const APIs     = require('../../utils/api');
const database = require('../../database');

module.exports = {
  name: 'roast',
  aliases: ['burn', 'clap'],
  description: 'Get an AI-generated personalised roast for anyone',
  category: 'free',

  execute: async ({ sock, from, sender, args, msg, reply }) => {
    database.logCommand(sender, 'roast');

    // Resolve target name — from mention, args, or quoted message sender
    let targetName = args.join(' ').replace(/@\d+/g, '').trim();

    // If they mentioned someone
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!targetName && mentioned.length > 0) {
      targetName = '+' + mentioned[0].split('@')[0];
    }

    // If they replied to a message
    if (!targetName) {
      const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (quotedParticipant) {
        targetName = '+' + quotedParticipant.split('@')[0];
      }
    }

    if (!targetName) {
      return reply(
        '🔥 *Roast Generator*\n\n' +
        'Usage: *.roast @user* or *.roast <name>*\n\n' +
        'Examples:\n' +
        '  .roast @Dev-Ntando\n' +
        '  .roast John\n' +
        '  (or reply to someone\'s message with *.roast*)'
      );
    }

    // Self-roast Easter egg
    const senderNum = sender.split('@')[0];
    const isSelf = targetName === senderNum || targetName.replace('+', '') === senderNum;

    await sock.sendPresenceUpdate('composing', from);
    await reply(`🔥 _Cooking up a roast for ${targetName}..._`);

    try {
      const system = isSelf
        ? `You are NovaSpark, a savage but friendly roast comedian. 
The person is roasting THEMSELVES — be especially brutal but never genuinely mean.
Make it funny, creative, and self-aware. 3-5 sentences. 
End with a "redemption line" that's actually kind.
End your reply with: _Nova AI ⚡_`
        : `You are NovaSpark, a sharp, witty, savage roast comedian.
Write a personalised roast for someone named "${targetName}".
Be creative and funny — jokes about the name, imagined personality quirks, absurd scenarios.
NEVER be genuinely cruel, racist, sexist, or bring up real personal tragedies.
Keep it 3-5 sentences. Punchy. Unexpected.
End your reply with: _Nova AI ⚡_`;

      const prompt = isSelf
        ? `Write a brutal self-roast for someone who asked to be roasted. Their number is ${senderNum}.`
        : `Write a creative roast for a person named "${targetName}". Be original, funny, not cruel.`;

      const roastText = await APIs.chatAI(prompt, system);

      const header = isSelf
        ? `🔥 *Self-Roast for ${targetName}* 😂\n\n`
        : `🔥 *Roasting ${targetName}*\n\n`;

      await reply(header + roastText);
    } catch (err) {
      console.error('[roast]', err.message);
      // Fallback: pre-written roasts
      const fallbacks = [
        `${targetName} is like a software update — everyone ignores them hoping they'll go away. 😂 _Nova AI ⚡_`,
        `${targetName} is proof that even WiFi has a limit on connections. 😭🔥 _Nova AI ⚡_`,
        `They say diamonds are made under pressure. ${targetName} is clearly not under enough. 💎😬 _Nova AI ⚡_`,
        `${targetName} is like a Monday — nobody asked for them, but here we are. 😅 _Nova AI ⚡_`,
      ];
      await reply(`🔥 *Roasting ${targetName}*\n\n` + fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    }
  },
};
