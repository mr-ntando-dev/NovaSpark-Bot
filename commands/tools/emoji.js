/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .emoji <name> — Look up an emoji by name / keyword
 * By Dev-Ntando
 */
'use strict';

// Curated emoji lookup map — fast, offline, no API needed
const EMOJIS = {
  fire: '🔥', heart: '❤️', love: '💖', star: '⭐', laugh: '😂',
  cry: '😢', angry: '😡', cool: '😎', party: '🎉', music: '🎵',
  money: '💰', food: '🍔', pizza: '🍕', rocket: '🚀', brain: '🧠',
  ghost: '👻', skull: '💀', wave: '👋', clap: '👏', eyes: '👀',
  check: '✅', cross: '❌', warning: '⚠️', info: 'ℹ️', idea: '💡',
  question: '❓', sleep: '😴', shock: '😱', wink: '😉', pray: '🙏',
  cat: '🐱', dog: '🐶', lion: '🦁', snake: '🐍', bird: '🦅',
  sun: '☀️', moon: '🌙', rain: '🌧️', snow: '❄️', thunder: '⚡',
  crown: '👑', gem: '💎', sword: '⚔️', shield: '🛡️', key: '🔑',
  lock: '🔒', unlock: '🔓', eyes2: '👁️', target: '🎯', robot: '🤖',
  alien: '👽', devil: '😈', angel: '😇', flower: '🌸', tree: '🌳',
};

module.exports = {
  name: 'emoji',
  aliases: ['findemoji', 'emojilookup'],
  description: 'Look up an emoji by name or keyword',
  category: 'tools',
  usage: '.emoji <name>',

  execute: async ({ args, reply }) => {
    if (!args[0]) {
      const list = Object.entries(EMOJIS).slice(0, 20).map(([k, v]) => `${v} ${k}`).join('  |  ');
      return reply(`😄 *Emoji Lookup*\n\n_Usage: .emoji <name>_\n\nSample keywords:\n${list}\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    }
    const key = args[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = EMOJIS[key];
    if (!found) {
      return reply(`❌ No emoji found for "*${args[0]}*". Try: fire, heart, star, laugh, crown, etc.`);
    }
    return reply(`${found}  ← *${args[0]}*\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
  },
};
