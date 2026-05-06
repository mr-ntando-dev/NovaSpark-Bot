/**
 * ⚡ NovaSpark Bot v6.0 — 2026 Edition
 * .autogm — Auto Good Morning / Good Night message scheduler
 * Sends a daily greeting to specified groups or owner DM at set times.
 * Owner only.
 * By Dev-Ntando
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const config = require('../../config');

const DATA_FILE = path.resolve(__dirname, '../../data/autogm.json');

const DEFAULT_GM = '🌅 *Good Morning!* ☀️\n\nWishing everyone a blessed and productive day!\n\n_⚡ NovaSpark Bot_';
const DEFAULT_GN = '🌙 *Good Night!* 🌟\n\nRest well and wake up stronger tomorrow!\n\n_⚡ NovaSpark Bot_';

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return getDefaultState();
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return getDefaultState(); }
}
function getDefaultState() {
  const af = config.autoFeatures || {};
  return {
    gm: {
      enabled: (af.autoGoodMorning && af.autoGoodMorning.enabled) || false,
      time:    (af.autoGoodMorning && af.autoGoodMorning.time)    || '06:00',
      message: (af.autoGoodMorning && af.autoGoodMorning.message) || DEFAULT_GM,
      targets: (af.autoGoodMorning && af.autoGoodMorning.targets) || [],
    },
    gn: {
      enabled: (af.autoGoodNight && af.autoGoodNight.enabled) || false,
      time:    (af.autoGoodNight && af.autoGoodNight.time)    || '22:00',
      message: (af.autoGoodNight && af.autoGoodNight.message) || DEFAULT_GN,
      targets: (af.autoGoodNight && af.autoGoodNight.targets) || [],
    },
  };
}
function writeState(obj) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

const _sent = new Set();
let _timer  = null;

module.exports.startAutoGMScheduler = function startAutoGMScheduler(sock) {
  if (_timer) return;
  _timer = setInterval(async () => {
    const s   = readState();
    const tz  = config.timezone || 'Africa/Harare';
    const now = new Date().toLocaleTimeString('en-ZA', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });

    for (const type of ['gm', 'gn']) {
      const cfg = s[type];
      if (!cfg.enabled || cfg.time !== now) continue;
      const key = `${type}_${now}`;
      if (_sent.has(key)) continue;
      _sent.add(key);

      const targets = cfg.targets && cfg.targets.length
        ? cfg.targets
        : [`${Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber}@s.whatsapp.net`];

      for (const jid of targets) {
        try {
          await sock.sendMessage(jid, { text: cfg.message });
        } catch (e) {
          console.error(`[AutoGM] Failed to send to ${jid}:`, e.message);
        }
      }
    }

    // Clear sent cache at midnight
    const [h, m] = now.split(':').map(Number);
    if (h === 0 && m === 0) _sent.clear();
  }, 60000);
};

module.exports = {
  ...module.exports,

  name: 'autogm',
  aliases: ['autogoodmorning', 'autogoodnight', 'agm'],
  description: 'Schedule daily Good Morning / Good Night messages',
  category: 'owner',
  ownerOnly: true,
  usage: '.autogm gm on <HH:MM> | .autogm gn on <HH:MM> | .autogm gm off | .autogm gm msg <text> | .autogm gm add <jid> | .autogm status',

  async execute({ sock, args, reply, from }) {
    const type   = (args[0] || '').toLowerCase(); // gm | gn
    const action = (args[1] || '').toLowerCase();
    const rest   = args.slice(2).join(' ');
    const s      = readState();

    if (!type || type === 'status') {
      return reply(
        `🌅 *Auto Good Morning / Good Night*\n${'━'.repeat(32)}\n\n` +
        `🌅 *Good Morning*\n` +
        `  Status: *${s.gm.enabled ? '🟢 ON' : '🔴 OFF'}*\n` +
        `  Time:   *${s.gm.time}*\n` +
        `  Targets: ${s.gm.targets.length ? s.gm.targets.join(', ') : 'Owner DM'}\n\n` +
        `🌙 *Good Night*\n` +
        `  Status: *${s.gn.enabled ? '🟢 ON' : '🔴 OFF'}*\n` +
        `  Time:   *${s.gn.time}*\n` +
        `  Targets: ${s.gn.targets.length ? s.gn.targets.join(', ') : 'Owner DM'}\n\n` +
        `_Usage: .autogm gm on 06:00_`
      );
    }

    if (type !== 'gm' && type !== 'gn') {
      return reply('❓ Usage: `.autogm gm on 06:00` or `.autogm gn on 22:00`');
    }

    if (action === 'on' || action === 'enable') {
      const time = rest || (type === 'gm' ? '06:00' : '22:00');
      if (!/^\d{2}:\d{2}$/.test(time)) return reply('❌ Invalid time. Use HH:MM format.');
      s[type].enabled = true;
      s[type].time    = time;
      writeState(s);
      module.exports.startAutoGMScheduler(sock);
      return reply(`✅ *Auto ${type.toUpperCase()} ON*\n⏰ Time: *${time}* (${config.timezone})`);
    }

    if (action === 'off' || action === 'disable') {
      s[type].enabled = false;
      writeState(s);
      return reply(`🔕 *Auto ${type.toUpperCase()} OFF*.`);
    }

    if (action === 'msg' || action === 'message' || action === 'set') {
      if (!rest) return reply('❓ Usage: `.autogm gm msg Your message here`');
      s[type].message = rest;
      writeState(s);
      return reply(`✅ *${type.toUpperCase()} message updated!*\n\n_${rest}_`);
    }

    if (action === 'add') {
      const jid = rest.includes('@') ? rest : `${rest.replace(/\D/g, '')}@s.whatsapp.net`;
      if (!s[type].targets.includes(jid)) s[type].targets.push(jid);
      writeState(s);
      return reply(`✅ Added *${jid}* to ${type.toUpperCase()} targets.`);
    }

    if (action === 'remove') {
      const jid = rest.includes('@') ? rest : `${rest.replace(/\D/g, '')}@s.whatsapp.net`;
      s[type].targets = s[type].targets.filter(t => t !== jid);
      writeState(s);
      return reply(`✅ Removed *${jid}* from ${type.toUpperCase()} targets.`);
    }

    if (action === 'addhere') {
      if (!s[type].targets.includes(from)) s[type].targets.push(from);
      writeState(s);
      return reply(`✅ Added *this chat* to ${type.toUpperCase()} targets.`);
    }

    if (action === 'removehere') {
      s[type].targets = s[type].targets.filter(t => t !== from);
      writeState(s);
      return reply(`✅ Removed *this chat* from ${type.toUpperCase()} targets.`);
    }

    if (action === 'test') {
      await sock.sendMessage(from, { text: s[type].message });
      return reply(`✅ Test ${type.toUpperCase()} message sent.`);
    }

    return reply(
      `❓ *AutoGM Commands*\n\n` +
      `• .autogm gm on <HH:MM>\n` +
      `• .autogm gm off\n` +
      `• .autogm gm msg <message>\n` +
      `• .autogm gm addhere\n` +
      `• .autogm gm add <number>\n` +
      `• .autogm gm test\n` +
      `• .autogm gn on <HH:MM>\n` +
      `• .autogm status`
    );
  },
};
