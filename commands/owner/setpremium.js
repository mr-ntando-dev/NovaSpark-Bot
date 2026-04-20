'use strict';
const database = require('../../database');

module.exports = {
  name: 'setpremium',
  aliases: ['addpremium', 'givepremium'],
  description: '[OWNER] Grant or remove premium access for a user',
  category: 'owner',
  execute: async ({ sock, msg, from, sender, args, isOwner, reply }) => {
    if (!isOwner) return reply('👑 This command is only for the bot owner.');

    const sub  = (args[0] || '').toLowerCase();
    const raw  = args[1] || '';

    // Extract number from mention or raw number
    let target = raw.replace(/[^0-9]/g, '');

    // Try quoted mention
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (mentioned) target = mentioned.split('@')[0];

    if (sub === 'list') {
      const list = database.listPremium();
      if (!list.length) return reply('💎 No premium users yet.');
      return reply(`💎 *Premium Users (${list.length}):*\n\n${list.map((n, i) => `${i + 1}. ${n}`).join('\n')}`);
    }

    if (!target || target.length < 7) {
      return reply(
        '👑 *Premium Manager*\n\n' +
        'Usage:\n' +
        '  *.setpremium add @user* — grant premium\n' +
        '  *.setpremium remove @user* — revoke premium\n' +
        '  *.setpremium add 263786831091* — by number\n' +
        '  *.setpremium list* — list all premium users'
      );
    }

    if (sub === 'add' || sub === 'grant' || sub === 'give') {
      database.setPremium(target);
      await reply(`💎 *Premium granted!*\n\nUser *${target}* now has Premium access.\nThey can use all Premium features.`);
      // Notify the user
      try {
        await sock.sendMessage(`${target}@s.whatsapp.net`, {
          text: `🎉 *Congratulations!*\n\nYou have been upgraded to *NovaSpark Premium*! 💎\n\nYou now have access to:\n• Exam Prep AI (.examprep)\n• Code Generator (.code)\n• Math Solver (.math)\n• Reminder System (.remind)\n• Analytics (.mystats)\n• Auto Study Mode (.autostudy)\n• Custom AI Persona (.setpersona)\n• Priority AI responses\n\nType *.myplan* to see all your features!\n\n_NovaSpark Bot ⚡_`
        });
      } catch { /* user might not have a chat open */ }
    } else if (sub === 'remove' || sub === 'revoke' || sub === 'take') {
      database.removePremium(target);
      await reply(`🔒 Premium *revoked* for user *${target}*.`);
    } else {
      await reply('❓ Use: *.setpremium add/remove @user* or *.setpremium list*');
    }
  },
};
