/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .spiritlevel [@user] — Fun spirit level / mood check
 * By Dev-Ntando
 */
'use strict';

const SPIRITS = [
  { emoji: '😇', label: 'Pure Saint',     range: [95, 100] },
  { emoji: '😎', label: 'Total Vibe',     range: [80, 94]  },
  { emoji: '😊', label: 'Good Energy',    range: [65, 79]  },
  { emoji: '😐', label: 'Mid Energy',     range: [50, 64]  },
  { emoji: '😤', label: 'Stressed Out',   range: [35, 49]  },
  { emoji: '😈', label: 'Chaotic Energy', range: [15, 34]  },
  { emoji: '💀', label: 'No Chill',       range: [0,  14]  },
];

module.exports = {
  name: 'spiritlevel',
  aliases: ['mood', 'vibecheck', 'vibe'],
  description: 'Check your spirit / vibe level today',
  category: 'fun',

  execute: async ({ args, sender, reply }) => {
    const target = args[0] ? args[0].replace(/[@+]/g, '') : sender.split('@')[0];
    const score  = Math.floor(Math.random() * 101);
    const spirit = SPIRITS.find(s => score >= s.range[0] && score <= s.range[1]);
    const bar    = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10));

    return reply(
      `${spirit.emoji} *Vibe Check — +${target}*\n` +
      `${'━'.repeat(28)}\n\n` +
      `*Level:* ${spirit.label}\n` +
      `*Score:* ${score}/100\n` +
      `[${bar}]\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
