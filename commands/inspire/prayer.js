/**
 * ⚡ NovaSpark Bot v6.0 — 2026 Edition
 * .prayer — On-demand daily devotional prayer
 * .pray <request> — AI-generated prayer for a specific need
 * By Dev-Ntando
 */
'use strict';

const config = require('../../config');

// Rotating prayer pool (15 different prayers)
const PRAYERS = [
  `🙏 *Morning Prayer*\n\nHeavenly Father, thank You for the gift of this new day.\nGuide my steps, guard my heart, and let Your will be done in all I do.\nIn Jesus' name, *Amen.* 🙌`,
  `🌿 *Prayer for Peace*\n\nLord, in the midst of every storm, You are my anchor.\nGrant me Your peace that surpasses all understanding.\nProtect my family and loved ones today.\nIn Jesus' name, *Amen.* 🕊️`,
  `🔥 *Prayer for Strength*\n\nFather, I come to You weak but I know You are strong.\nFill me with Your Spirit and make me bold.\n_"I can do all things through Christ who strengthens me."_\n*Philippians 4:13* — In Jesus' name, *Amen.* 💪`,
  `💛 *Prayer for Provision*\n\nLord, You are Jehovah Jireh — my Provider.\nOpen doors that no man can shut.\nBless the work of my hands and meet every need.\nIn Jesus' name, *Amen.* 🙏`,
  `🌅 *Prayer for Favour*\n\nFather, let Your favour surround me like a shield today.\nLet every opportunity I need fall into my path.\nMay people go out of their way to bless me.\nIn Jesus' name, *Amen.* ⭐`,
  `🛡️ *Prayer for Protection*\n\nLord, cover me with the blood of Jesus.\nNo weapon formed against me shall prosper.\nAngels encamp around me and my household.\n_Isaiah 54:17_ — In Jesus' name, *Amen.* 🙌`,
  `❤️ *Prayer for Healing*\n\nJehovah Rapha — You are the God who heals.\nTouch every sickness, every pain, every broken place.\n_"By Your stripes we are healed."_ — Isaiah 53:5\nIn Jesus' name, *Amen.* ✝️`,
  `🌟 *Prayer for Wisdom*\n\nFather, give me the wisdom of Solomon.\nLet me make the right decisions and speak the right words.\n_"If any of you lacks wisdom, let him ask God."_ — James 1:5\nIn Jesus' name, *Amen.* 📖`,
  `🤲 *Prayer of Gratitude*\n\nThank You Lord for life, health, and strength.\nFor every blessing seen and unseen.\nFor waking me up with a sound mind today.\nYou are worthy of all praise. *Amen.* 🙏`,
  `✨ *Prayer for Breakthrough*\n\nFather, every wall that has stood against my progress — let it fall.\nThis is my season of breakthrough.\nWhat has been delayed will not be denied.\nIn Jesus' name, *Amen.* 🔓`,
  `🌱 *Prayer for New Beginnings*\n\nLord, I release the old and embrace the new.\nYou make all things new.\nThank You for second chances and fresh starts.\nIn Jesus' name, *Amen.* 🌸`,
  `💼 *Prayer for Work & Business*\n\nFather, bless the work of my hands.\nGive me favour with clients, employers, and partners.\nLet my business flourish and my career grow.\nIn Jesus' name, *Amen.* 📈`,
  `👨‍👩‍👧 *Prayer for Family*\n\nLord, bless my family.\nBind us together with love and peace.\nProtect our children and guide our parents.\nEvery division shall be healed.\nIn Jesus' name, *Amen.* ❤️`,
  `🎯 *Prayer of Declaration*\n\nI declare: I am blessed, I am favoured, I am healed.\nI am more than a conqueror through Christ.\nNo weapon formed against me shall prosper.\nThis is my day of victory! *Amen.* 🦁`,
  `🌙 *Evening Prayer*\n\nFather, thank You for bringing me through this day.\nForgive any wrong I have done.\nAs I rest, let Your angels watch over me.\nRefresh me for tomorrow.\nIn Jesus' name, *Amen.* 🌟`,
];

function getDailyPrayer() {
  const day = Math.floor(Date.now() / 86400000);
  return PRAYERS[day % PRAYERS.length];
}

async function generateAIPrayer(request) {
  // Simple built-in AI prayer generator (no API key needed)
  const templates = [
    `🙏 *Prayer for ${request}*\n\nHeavenly Father, I bring before You my need regarding *${request}*.\nYou are the God of the impossible and nothing is too hard for You.\nI trust You to move on my behalf in this situation.\nGive me patience, faith, and Your perfect peace as I wait on You.\nIn Jesus' mighty name, *Amen.* ✝️`,
    `🙏 *Prayer Regarding ${request}*\n\nLord, You know every detail about *${request}*.\nI surrender this to You completely.\nYour ways are higher than my ways and Your thoughts higher than my thoughts.\nI believe You are working all things together for my good.\n*Romans 8:28* — In Jesus' name, *Amen.* 🌟`,
    `🙏 *Intercession for ${request}*\n\nFather God, I come before Your throne of grace concerning *${request}*.\nYou are Jehovah El Roi — the God who sees.\nYou see this need. You know this situation.\nI trust You to bring breakthrough, healing, and restoration.\nIn the powerful name of Jesus, *Amen.* 💛`,
  ];
  const i = Math.floor(Math.random() * templates.length);
  return templates[i];
}

module.exports = {
  name: 'prayer',
  aliases: ['pray', 'devotion', 'devotional'],
  description: 'Daily devotional prayer or AI-generated prayer for a specific need',
  category: 'inspire',
  usage: '.prayer | .pray <your request>',

  async execute({ args, reply }) {
    const request = args.join(' ').trim();

    if (request) {
      // AI-generated prayer for specific request
      const prayer = await generateAIPrayer(request);
      return reply(
        `${prayer}\n\n` +
        `_⚡ NovaSpark Bot — Type .prayer for today's devotional_`
      );
    }

    // Daily rotating prayer
    return reply(
      `${getDailyPrayer()}\n\n` +
      `_📖 Today's verse: Type .verse_\n` +
      `_✝️ TB Joshua video: Type .tbj_\n\n` +
      `_⚡ NovaSpark Bot_`
    );
  },
};
