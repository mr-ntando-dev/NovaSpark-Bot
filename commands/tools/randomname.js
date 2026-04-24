/**
 * ⚡ NovaSpark Bot v10.0 — 2026 Edition
 * .randomname — Generate random names (baby names, usernames, business names)
 * By Dev-Ntando
 */
'use strict';

const FIRST_MALE   = ['Ethan','Liam','Noah','Aiden','Lucas','Mason','Logan','James','Oliver','Elijah','Caleb','Nathan','Zane','Kai','Jaxon','Ryder','Finn','Blake','Cole','Miles'];
const FIRST_FEMALE = ['Sofia','Aria','Luna','Zoe','Mia','Chloe','Isla','Nova','Nala','Layla','Jade','Zara','Ivy','Aurora','Eden','Seraphina','Elise','Maya','Nadia','Raina'];
const LAST        = ['Stone','Rivers','Blaze','Night','Storm','Frost','Hawk','Cross','Vale','Ash','Quinn','Pierce','Drake','Voss','Kane','Reid','Fox','Grey','Lane','West'];

const ADJ  = ['Shadow','Cosmic','Neon','Dark','Arctic','Solar','Ghost','Steel','Fire','Pixel','Cyber','Storm','Night','Gold','Iron'];
const NOUN = ['Wolf','Phoenix','Blade','Echo','Viper','Hawk','Raven','Nova','Cipher','Rex','Titan','Blaze','Striker','Frost','Drift'];

const BIZ_PREFIX = ['Apex','Nova','Zenith','Prime','Core','Elite','Alpha','Nexus','Vibe','Bolt','Surge','Crest','Spark','Forge'];
const BIZ_SUFFIX = ['Labs','Hub','Works','Studio','Group','Tech','Media','Co','Pro','Digital','Solutions','Agency','Zone','HQ'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = {
  name: 'randomname',
  aliases: ['rname', 'genname', 'namegen', 'username'],
  description: '🎲 Generate random names — baby, username, or business',
  category: 'tools',
  usage: '.randomname [baby|user|biz|all]',

  execute: async ({ args, reply }) => {
    const type = (args[0] || 'all').toLowerCase();

    if (type === 'baby' || type === 'all') {
      const maleName   = `${rand(FIRST_MALE)} ${rand(LAST)}`;
      const femaleName = `${rand(FIRST_FEMALE)} ${rand(LAST)}`;

      if (type === 'baby') {
        return reply(
          `👶 *Baby Name Generator*\n${'━'.repeat(28)}\n\n` +
          `👦 *Boy:*  ${maleName}\n` +
          `👧 *Girl:* ${femaleName}\n\n` +
          `_⚡ NovaSpark Bot — Dev-Ntando_`
        );
      }
    }

    if (type === 'user' || type === 'all') {
      const usernames = [
        `${rand(ADJ)}${rand(NOUN)}${Math.floor(Math.random() * 999)}`,
        `${rand(NOUN)}_${rand(ADJ).toLowerCase()}`,
        `x_${rand(NOUN).toLowerCase()}_${Math.floor(Math.random() * 99)}`,
        `${rand(ADJ).toLowerCase()}.${rand(NOUN).toLowerCase()}`,
      ];

      if (type === 'user') {
        return reply(
          `👤 *Username Generator*\n${'━'.repeat(28)}\n\n` +
          usernames.map((u, i) => `${i + 1}. @${u}`).join('\n') +
          `\n\n_⚡ NovaSpark Bot — Dev-Ntando_`
        );
      }
    }

    if (type === 'biz' || type === 'all') {
      const bizNames = [
        `${rand(BIZ_PREFIX)} ${rand(BIZ_SUFFIX)}`,
        `${rand(BIZ_PREFIX)}${rand(NOUN)} ${rand(BIZ_SUFFIX)}`,
        `${rand(ADJ)} ${rand(BIZ_SUFFIX)}`,
        `${rand(BIZ_PREFIX)} ${rand(NOUN)} ${rand(BIZ_SUFFIX)}`,
      ];

      if (type === 'biz') {
        return reply(
          `🏢 *Business Name Generator*\n${'━'.repeat(28)}\n\n` +
          bizNames.map((n, i) => `${i + 1}. ${n}`).join('\n') +
          `\n\n_⚡ NovaSpark Bot — Dev-Ntando_`
        );
      }
    }

    // All
    const maleName   = `${rand(FIRST_MALE)} ${rand(LAST)}`;
    const femaleName = `${rand(FIRST_FEMALE)} ${rand(LAST)}`;
    const username   = `${rand(ADJ)}${rand(NOUN)}${Math.floor(Math.random() * 999)}`;
    const bizName    = `${rand(BIZ_PREFIX)} ${rand(BIZ_SUFFIX)}`;

    return reply(
      `🎲 *Random Name Generator*\n${'━'.repeat(28)}\n\n` +
      `👦 *Baby (Boy):*    ${maleName}\n` +
      `👧 *Baby (Girl):*   ${femaleName}\n` +
      `👤 *Username:*      @${username}\n` +
      `🏢 *Business:*      ${bizName}\n\n` +
      `_Run again for new names!_\n_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
