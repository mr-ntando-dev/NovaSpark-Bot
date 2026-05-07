/**
 * ⚡ NovaSpark v9 — Class Timetable Manager
 * .timetable add Monday 08:00 Math Mr. Dube
 * .timetable show [day] — Show today's or a specific day's schedule
 * .timetable delete Monday 08:00
 * .timetable clear [day] — Clear timetable
 * Per-group. Perfect for school groups.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAYS_DISPLAY = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const TT_KEY = (gid) => `timetable_${gid}`;

function getTT(gid) {
  return database.getSetting ? (database.getSetting(TT_KEY(gid)) || {}) : {};
}
function saveTT(gid, obj) {
  if (database.setSetting) database.setSetting(TT_KEY(gid), obj);
}
function todayName() {
  return DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}

module.exports = {
  name: 'timetable',
  aliases: ['classtable', 'myschedule'],
  description: '📅 Group class timetable manager',
  category: 'tools',

  execute: async ({ from, args, reply, isAdmin, isOwner }) => {
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'add') {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only can add to timetable.');
      const day = (args[1] || '').toLowerCase();
      if (!DAYS.includes(day)) return reply(`📅 Invalid day. Use: ${DAYS_DISPLAY.join(', ')}`);
      const time = args[2];
      if (!/^\d{2}:\d{2}$/.test(time || '')) return reply('📅 Invalid time format. Use HH:MM (e.g. 08:00)');
      const subject = args.slice(3).join(' ').trim();
      if (!subject) return reply('📅 Include subject/class info. E.g.: *.timetable add Monday 08:00 Math - Mr. Dube*');

      const tt = getTT(from);
      if (!tt[day]) tt[day] = [];
      // Remove duplicate time slot
      tt[day] = tt[day].filter(e => e.time !== time);
      tt[day].push({ time, subject });
      tt[day].sort((a, b) => a.time.localeCompare(b.time));
      saveTT(from, tt);
      const dDisplay = DAYS_DISPLAY[DAYS.indexOf(day)];
      return reply(`✅ Added to timetable!\n📅 *${dDisplay} ${time}* — ${subject}`);
    }

    if (sub === 'show' || sub === 'view') {
      const dayArg = (args[1] || '').toLowerCase();
      const day = DAYS.includes(dayArg) ? dayArg : todayName();
      const tt = getTT(from);
      const slots = tt[day];
      const dDisplay = DAYS_DISPLAY[DAYS.indexOf(day)];
      if (!slots || !slots.length) {
        return reply(`📅 No classes on *${dDisplay}*.\n\nAdd: *.timetable add ${dDisplay} 08:00 Math*`);
      }
      const lines = slots.map(s => `  🕐 *${s.time}* — ${s.subject}`).join('\n');
      return reply(`📅 *${dDisplay} Schedule* (${slots.length} classes)\n\n${lines}`);
    }

    if (sub === 'week' || sub === 'all') {
      const tt = getTT(from);
      const hasData = DAYS.some(d => tt[d] && tt[d].length);
      if (!hasData) return reply('📅 Timetable is empty. Add classes with *.timetable add*');
      const sections = DAYS.map(d => {
        const slots = tt[d];
        if (!slots || !slots.length) return null;
        const dDisplay = DAYS_DISPLAY[DAYS.indexOf(d)];
        const lines = slots.map(s => `  🕐 ${s.time} — ${s.subject}`).join('\n');
        return `📅 *${dDisplay}*\n${lines}`;
      }).filter(Boolean);
      return reply(`📅 *Full Week Timetable*\n\n${sections.join('\n\n')}`);
    }

    if (sub === 'delete' || sub === 'del' || sub === 'remove') {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      const day = (args[1] || '').toLowerCase();
      const time = args[2];
      if (!DAYS.includes(day) || !time) return reply('📅 Usage: *.timetable delete Monday 08:00*');
      const tt = getTT(from);
      if (!tt[day]) return reply(`📅 No classes on ${day}.`);
      const before = tt[day].length;
      tt[day] = tt[day].filter(e => e.time !== time);
      if (tt[day].length === before) return reply(`📅 No class found at *${time}* on *${day}*.`);
      saveTT(from, tt);
      return reply(`🗑️ Removed class at *${time}* on *${DAYS_DISPLAY[DAYS.indexOf(day)]}*`);
    }

    if (sub === 'clear') {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      const dayArg = (args[1] || '').toLowerCase();
      const tt = getTT(from);
      if (DAYS.includes(dayArg)) {
        tt[dayArg] = [];
        saveTT(from, tt);
        return reply(`🗑️ Cleared all classes for *${DAYS_DISPLAY[DAYS.indexOf(dayArg)]}*`);
      }
      saveTT(from, {});
      return reply('🗑️ Full timetable cleared!');
    }

    return reply(
      '📅 *Timetable Commands*\n\n' +
      '*.timetable add Monday 08:00 Math* — Add class\n' +
      '*.timetable show* — Today\'s schedule\n' +
      '*.timetable show Friday* — Specific day\n' +
      '*.timetable week* — Full week view\n' +
      '*.timetable delete Monday 08:00* — Remove class\n' +
      '*.timetable clear [day]* — Clear day or all (admin)'
    );
  },
};
