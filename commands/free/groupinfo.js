/**
 * NovaSpark Bot v3 — Group Info & Analytics
 * .groupinfo — shows rich group details: members, admins, creation date, description
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

module.exports = {
  name: 'groupinfo',
  aliases: ['ginfo', 'groupinfostats', 'group'],
  description: 'Show detailed group information and analytics',
  category: 'free',

  execute: async ({ sock, from, sender, isGroup, reply }) => {
    database.logCommand(sender, 'groupinfo');

    if (!isGroup) {
      return reply('👥 *Group Info* only works in groups.\nTry it in one of your group chats!');
    }

    await sock.sendPresenceUpdate('composing', from);

    try {
      const meta = await sock.groupMetadata(from);

      const totalMembers  = meta.participants?.length ?? 0;
      const admins        = (meta.participants ?? []).filter(p => p.admin === 'admin' || p.admin === 'superadmin');
      const superAdmins   = (meta.participants ?? []).filter(p => p.admin === 'superadmin');
      const regularMems   = totalMembers - admins.length;

      // Format creation date
      const created = meta.creation
        ? new Date(meta.creation * 1000).toLocaleString('en-ZA', {
            timeZone: 'Africa/Harare',
            weekday: 'short', year: 'numeric',
            month:   'long',  day: 'numeric',
          })
        : 'Unknown';

      // Group age
      let ageStr = '';
      if (meta.creation) {
        const ageMs  = Date.now() - meta.creation * 1000;
        const ageDays = Math.floor(ageMs / 86400000);
        if (ageDays > 365) {
          const yrs = Math.floor(ageDays / 365);
          const rem = ageDays % 365;
          ageStr = `${yrs} year${yrs > 1 ? 's' : ''}${rem > 0 ? ` ${rem} days` : ''}`;
        } else {
          ageStr = `${ageDays} day${ageDays !== 1 ? 's' : ''}`;
        }
      }

      // Admin names
      const adminNames = admins.map(a => {
        const num = a.id.split('@')[0];
        const role = a.admin === 'superadmin' ? ' 👑' : ' 🛡️';
        return `    • +${num}${role}`;
      }).join('\n') || '    • None';

      const desc = meta.desc
        ? meta.desc.trim().slice(0, 300) + (meta.desc.length > 300 ? '…' : '')
        : '_No description set_';

      // Member breakdown bar
      const memberBar = (count, total, char = '█') => {
        const bars = Math.round((count / total) * 10);
        return char.repeat(bars) + '░'.repeat(10 - bars);
      };

      const msg =
        `👥 *Group Analytics*\n` +
        `${'═'.repeat(30)}\n\n` +
        `📌 *Name:*  ${meta.subject || 'Unknown'}\n` +
        `🔖 *ID:*  ...${from.slice(-20)}\n` +
        `📅 *Created:*  ${created}\n` +
        `⏳ *Age:*  ${ageStr || 'Unknown'}\n\n` +
        `${'─'.repeat(30)}\n` +
        `👤 *Members:*  ${totalMembers}\n` +
        `    Regular:  ${regularMems}  ${memberBar(regularMems, totalMembers)}\n` +
        `    Admins:   ${admins.length}  ${memberBar(admins.length, totalMembers)}\n\n` +
        `🛡️ *Admins (${admins.length}):*\n${adminNames}\n\n` +
        `${'─'.repeat(30)}\n` +
        `📝 *Description:*\n${desc}\n\n` +
        (meta.announce
          ? `🔒 *Send Messages:* Admins only\n`
          : `✅ *Send Messages:* All members\n`) +
        (meta.restrict
          ? `🔒 *Edit Group Info:* Admins only\n`
          : `✅ *Edit Group Info:* All members\n`) +
        `\n_Nova AI ⚡_`;

      await reply(msg);
    } catch (err) {
      console.error('[groupinfo]', err.message);
      await reply('❌ Could not fetch group info. Make sure I have the right permissions.');
    }
  },
};
