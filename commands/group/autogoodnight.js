/**
 * ⚡ NovaSpark Bot — Auto Good Night
 * Sends a good night message to all groups at a configurable time.
 * .autogoodnight on [22:00]
 * .autogoodnight off
 * .autogoodnight set [HH:MM] [custom message]
 */
'use strict';

const database = require('../../database');
const config   = require('../../config');

const MESSAGES = [
  '🌙 *Good Night!* Sleep well and wake up refreshed. 💤\n_NovaSpark Bot says goodnight!_',
  '🌠 *Goodnight, everyone!* May your dreams be as awesome as this group. 😴✨',
  '🌛 *Time to rest!* Tomorrow is a new day full of opportunities. 🌟\n_Goodnight from NovaSpark!_',
  '🛌 *Goodnight crew!* Log off, rest up, and come back stronger tomorrow. 💪🌙',
  '🌜 *NovaSpark says Goodnight!* Take care, sleep tight, and don\'t let the bugs bite! 🐛💤',
  '🌃 *Night, night!* The stars are out — time to recharge your human batteries. 😴⭐',
];

let _scheduler = null;

function startAutoGoodnight(sock) {
  if (_scheduler) clearInterval(_scheduler);
  _scheduler = setInterval(async () => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: config.timezone || 'Africa/Harare' }));
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    const time = `${hh}:${mm}`;

    // Get all group IDs from database
    const groups = database.getAllGroupIds ? database.getAllGroupIds() : [];
    for (const gid of groups) {
      const gs = database.getGroupSettings(gid);
      if (!gs.autoGoodnight?.enabled) continue;
      if ((gs.autoGoodnight.time || '22:00') !== time) continue;

      const msg = gs.autoGoodnight.msg || MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      try {
        await sock.sendMessage(gid, { text: msg });
      } catch {}
    }
  }, 60000); // check every minute
}

module.exports = {
  name:    'autogoodnight',
  aliases: ['goodnight', 'gnmode'],
  category: 'group',
  desc:    'Auto send a good night message to the group at a set time',
  usage:   '.autogoodnight on [HH:MM] | .autogoodnight off | .autogoodnight set [HH:MM] [msg]',
  example: '.autogoodnight on 22:30\n.autogoodnight off\n.autogoodnight set 23:00 Goodnight fam! 🌙',
  startAutoGoodnight,
  async execute({ sock, msg, args, from, isAdmin }) {
    if (!isAdmin) {
      return sock.sendMessage(from, { text: '❌ Only admins can change auto goodnight settings.' }, { quoted: msg });
    }

    const gs  = database.getGroupSettings(from) || {};
    if (!gs.autoGoodnight) gs.autoGoodnight = { enabled: false, time: '22:00' };

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'off') {
      gs.autoGoodnight.enabled = false;
      database.saveGroupSettings(from, gs);
      return sock.sendMessage(from, { text: '🌙 Auto Good Night disabled.' }, { quoted: msg });
    }

    if (sub === 'on' || sub === 'set') {
      const timeArg = args.find(a => /^\d{1,2}:\d{2}$/.test(a));
      const msgArgs = args.slice(timeArg ? args.indexOf(timeArg) + 1 : 1).join(' ').trim();

      if (timeArg) {
        const [h, m] = timeArg.split(':').map(Number);
        if (h < 0 || h > 23 || m < 0 || m > 59) {
          return sock.sendMessage(from, { text: '❌ Invalid time. Use HH:MM format (e.g. 22:00).' }, { quoted: msg });
        }
        gs.autoGoodnight.time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      }
      if (msgArgs) gs.autoGoodnight.msg = msgArgs;
      gs.autoGoodnight.enabled = true;
      database.saveGroupSettings(from, gs);

      return sock.sendMessage(from, {
        text: `🌙 *Auto Good Night enabled!*\n⏰ Time: ${gs.autoGoodnight.time}\n💬 Message: ${gs.autoGoodnight.msg || '(default rotation)'}`,
      }, { quoted: msg });
    }

    await sock.sendMessage(from, {
      text: `🌙 *Auto Good Night*\n\n• \`.autogoodnight on 22:00\` — Enable at 10 PM\n• \`.autogoodnight off\` — Disable\n• \`.autogoodnight set 23:00 Goodnight! 🌙\` — Custom time & message\n\nStatus: ${gs.autoGoodnight.enabled ? '✅ ON' : '❌ OFF'} | Time: ${gs.autoGoodnight.time || '22:00'}`,
    }, { quoted: msg });
  },
};
