/**
 * ⚡ NovaSpark Bot v8.0 — Auto Birthday Wisher
 * .birthday add @user DD/MM       — Register a birthday
 * .birthday list                  — View all birthdays
 * .birthday remove @user          — Remove a birthday
 * .birthday test @user            — Preview birthday message
 * .birthday setmsg <msg>          — Custom birthday message (supports @user)
 * Auto-posts birthday wishes at midnight (00:00) every day
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

let birthdayCheckerStarted = false;

function todayMMDD() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

function buildBdayMsg(template, userJid, groupName) {
  const num = userJid.split('@')[0];
  return (template || '🎂🎉 *Happy Birthday @user!* 🎉🎂\n\nMay this special day bring you endless joy and blessings! 🙏\n\n_From everyone in @group_ 🥳')
    .replace(/@user/g, `@${num}`)
    .replace(/@group/g, groupName || 'the group');
}

module.exports = {
  name: 'birthday',
  aliases: ['bday', 'autobirthday', 'bdaywish'],
  description: 'Auto birthday wishes for group members',
  category: 'owner',
  ownerOnly: false,

  onStartup: async (sock) => {
    if (birthdayCheckerStarted) return;
    birthdayCheckerStarted = true;

    const check = async () => {
      const today = todayMMDD();
      const allBirthdays = database.getAllBirthdays ? database.getAllBirthdays() : [];
      for (const b of allBirthdays) {
        if (b.date !== today) continue;
        if (b.wishedYear === new Date().getFullYear()) continue; // already wished today

        try {
          const metadata = await sock.groupMetadata(b.group).catch(() => null);
          const groupName = metadata?.subject || 'the group';
          const msg = buildBdayMsg(b.customMsg, b.jid, groupName);
          await sock.sendMessage(b.group, {
            text: msg,
            mentions: [b.jid],
          });
          if (database.markBirthdayWished) database.markBirthdayWished(b.id, new Date().getFullYear());
        } catch {}
      }
    };

    // Check every hour
    setInterval(check, 3_600_000);
    setTimeout(check, 5000); // also check 5s after startup
  },

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner, mentionedJids }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'add') {
      const userJid = mentionedJids?.[0] || (args[1]?.includes('@') ? args[1] : null);
      const dateStr = args[2] || args[1]; // DD/MM
      if (!userJid || !dateStr || !dateStr.includes('/')) {
        return reply('📅 Usage: `.birthday add @user DD/MM`\nExample: `.birthday add @John 25/12`');
      }
      const [dd, mm] = dateStr.split('/').map(Number);
      if (!dd || !mm || dd > 31 || mm > 12) return reply('❌ Invalid date. Use DD/MM format.');
      const id = `${from}_${userJid}`;
      if (database.addBirthday) database.addBirthday({ id, group: from, jid: userJid, date: dateStr, customMsg: null });
      return reply(`🎂 Birthday registered!\n\n👤 @${userJid.split('@')[0]}\n📅 ${dateStr}\n\n_I'll auto-wish them on their special day!_`, { mentions: [userJid] });
    }

    if (sub === 'list') {
      const list = (database.getAllBirthdays ? database.getAllBirthdays() : []).filter(b => b.group === from);
      if (!list.length) return reply('📭 No birthdays registered for this group.');
      const lines = list.map(b => `• @${b.jid.split('@')[0]} — *${b.date}*`).join('\n');
      const mentions = list.map(b => b.jid);
      return sock.sendMessage(from, { text: `🎂 *Registered Birthdays*\n\n${lines}`, mentions }, { quoted: msg });
    }

    if (sub === 'remove') {
      const userJid = mentionedJids?.[0];
      if (!userJid) return reply('❌ Tag the user to remove. E.g. `.birthday remove @John`');
      const id = `${from}_${userJid}`;
      if (database.removeBirthday) database.removeBirthday(id);
      return reply(`🗑️ Birthday for @${userJid.split('@')[0]} removed.`, { mentions: [userJid] });
    }

    if (sub === 'setmsg') {
      const template = args.slice(1).join(' ');
      if (!template) return reply('❌ Provide a message. Use @user and @group as placeholders.');
      if (database.setBirthdayTemplate) database.setBirthdayTemplate(from, template);
      return reply(`✅ *Birthday message set:*\n\n${template}\n\n_@user = tagged member, @group = group name_`);
    }

    if (sub === 'test') {
      const userJid = mentionedJids?.[0] || `${from.split('@')[0]}@s.whatsapp.net`;
      const metadata = await sock.groupMetadata(from).catch(() => null);
      const gs = database.getGroupSettings ? database.getGroupSettings(from) : {};
      const msg2 = buildBdayMsg(gs.birthdayTemplate, userJid, metadata?.subject);
      return sock.sendMessage(from, { text: `🎂 *Birthday Message Preview:*\n\n${msg2}`, mentions: [userJid] }, { quoted: msg });
    }

    return reply(
      '🎂 *Auto Birthday*\n\n' +
      '`.birthday add @user DD/MM` — Register birthday\n' +
      '`.birthday list` — View all\n' +
      '`.birthday remove @user` — Remove\n' +
      '`.birthday setmsg <msg>` — Custom message\n' +
      '`.birthday test [@user]` — Preview message'
    );
  },
};
