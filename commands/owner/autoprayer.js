/**
 * ⚡ NovaSpark Bot v6.0 — 2026 Edition
 * .autoprayer — Daily rotating prayer / devotional sender
 * Owner only.
 * By Dev-Ntando
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const config = require('../../config');

const DATA_FILE = path.resolve(__dirname, '../../data/autoprayer.json');

const BUILT_IN_PRAYERS = [
  `🙏 *Morning Prayer*\n\nHeavenly Father, thank You for the gift of this new day.\nGuide my steps, guard my heart, and let Your will be done in all I do.\nIn Jesus' name, *Amen.* 🙌`,
  `🌿 *Prayer for Peace*\n\nLord, in the midst of every storm, You are my anchor.\nGrant me Your peace that surpasses all understanding.\nProtect my family and loved ones today.\nIn Jesus' name, *Amen.* 🕊️`,
  `🔥 *Prayer for Strength*\n\nFather, I come to You weak but I know You are strong.\nFill me with Your Spirit and make me bold.\nLet Your power be perfected in my weakness.\n*Philippians 4:13* — I can do all things through Christ.\n*Amen.* 💪`,
  `💛 *Prayer for Provision*\n\nLord, You are Jehovah Jireh — my Provider.\nOpen doors that no man can shut.\nBless the work of my hands and meet my needs.\nIn Jesus' name, *Amen.* 🙏`,
  `🌅 *Prayer for Favour*\n\nFather, let Your favour surround me like a shield today.\nLet every opportunity I need fall into my path.\nMay people go out of their way to bless me.\nIn Jesus' name, *Amen.* ⭐`,
  `🛡️ *Prayer for Protection*\n\nLord, cover me with the blood of Jesus.\nNo weapon formed against me shall prosper.\nAngels encamp around me and my household.\nIn Jesus' name, *Amen.* 🙌`,
  `❤️ *Prayer for Healing*\n\nJehovah Rapha — You are the God who heals.\nTouch every sickness, every pain, every broken place.\nBy Your stripes we are healed.\n_Isaiah 53:5_ — In Jesus' name, *Amen.* ✝️`,
  `🌟 *Prayer for Wisdom*\n\nFather, give me the wisdom of Solomon.\nLet me make the right decisions, speak the right words.\nGuide me by Your Word and Your Spirit.\n_James 1:5_ — In Jesus' name, *Amen.* 📖`,
  `🤲 *Prayer of Gratitude*\n\nThank You Lord for life, health, and strength.\nFor every blessing seen and unseen.\nFor waking me up with a sound mind.\nYou are worthy of all praise. *Amen.* 🙏`,
  `✨ *Prayer for Breakthrough*\n\nFather, every wall that has stood against my progress — let it fall today.\nThis is my season of breakthrough.\nWhat has been delayed will not be denied.\nIn Jesus' name, *Amen.* 🔓`,
  `🌱 *Prayer for New Beginnings*\n\nLord, I release the old and embrace the new.\nYou make all things new.\nThank You for second chances and fresh starts.\nIn Jesus' name, *Amen.* 🌸`,
  `💼 *Prayer for Work & Business*\n\nFather, bless the work of my hands.\nGive me favor with clients, employers, and partners.\nLet my business flourish and my career grow.\nIn Jesus' name, *Amen.* 📈`,
  `👨‍👩‍👧 *Prayer for Family*\n\nLord, bless my family.\nBind us together with love and peace.\nProtect our children and guide our parents.\nEvery division shall be healed.\nIn Jesus' name, *Amen.* ❤️`,
  `🎯 *Prayer of Declaration*\n\nI declare: I am blessed, I am favoured, I am healed.\nI am more than a conqueror through Christ.\nNo weapon formed against me shall prosper.\nThis is my day of victory! *Amen.* 🦁`,
  `🌙 *Evening Prayer*\n\nFather, thank You for bringing me through this day.\nForgive any wrong I have done.\nAs I sleep, let Your angels watch over me.\nRefresh me for tomorrow.\nIn Jesus' name, *Amen.* 🌟`,
];

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return getDefault();
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return getDefault(); }
}
function getDefault() {
  const af = config.autoFeatures || {};
  return {
    enabled: (af.autoPrayer && af.autoPrayer.enabled) || false,
    time:    (af.autoPrayer && af.autoPrayer.time)    || '05:30',
    message: (af.autoPrayer && af.autoPrayer.message) || '',
    targets: (af.autoPrayer && af.autoPrayer.targets) || [],
  };
}
function writeState(obj) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

function getDailyPrayer() {
  const day = Math.floor(Date.now() / 86400000);
  return BUILT_IN_PRAYERS[day % BUILT_IN_PRAYERS.length];
}

const _sent = new Set();
let _timer  = null;

module.exports.startAutoPrayerScheduler = function startAutoPrayerScheduler(sock) {
  if (_timer) return;
  _timer = setInterval(async () => {
    const s   = readState();
    if (!s.enabled) return;
    const tz  = config.timezone || 'Africa/Harare';
    const now = new Date().toLocaleTimeString('en-ZA', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
    if (s.time !== now) return;
    const key = `prayer_${now}`;
    if (_sent.has(key)) return;
    _sent.add(key);

    const msgText = s.message || getDailyPrayer();
    const targets = s.targets && s.targets.length
      ? s.targets
      : [`${Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber}@s.whatsapp.net`];

    for (const jid of targets) {
      try { await sock.sendMessage(jid, { text: msgText }); } catch {}
    }

    const [h, m] = now.split(':').map(Number);
    if (h === 0 && m === 0) _sent.clear();
  }, 60000);
};

module.exports = {
  ...module.exports,

  name: 'autoprayer',
  aliases: ['prayerschedule', 'dailyprayer'],
  description: 'Send a daily prayer/devotional message on schedule',
  category: 'owner',
  ownerOnly: true,
  usage: '.autoprayer on <HH:MM> | .autoprayer off | .autoprayer now | .autoprayer addhere | .autoprayer set <text>',

  async execute({ sock, args, reply, from }) {
    const action = (args[0] || '').toLowerCase();
    const rest   = args.slice(1).join(' ');
    const s      = readState();

    if (!action || action === 'status') {
      return reply(
        `🙏 *Auto Prayer Sender*\n${'━'.repeat(28)}\n\n` +
        `Status:  *${s.enabled ? '🟢 ON' : '🔴 OFF'}*\n` +
        `Time:    *${s.time}*\n` +
        `Custom:  ${s.message ? 'Yes (custom message set)' : 'No (rotating built-in prayers)'}\n` +
        `Targets: ${s.targets.length ? s.targets.join(', ') : 'Owner DM'}\n\n` +
        `_Usage: .autoprayer on 05:30_`
      );
    }

    if (action === 'on' || action === 'enable') {
      const time = rest || '05:30';
      if (!/^\d{2}:\d{2}$/.test(time)) return reply('❌ Invalid time. Use HH:MM format.');
      s.enabled = true;
      s.time    = time;
      writeState(s);
      module.exports.startAutoPrayerScheduler(sock);
      return reply(`✅ *Auto Prayer ON* — sending daily prayer at *${time}* (${config.timezone})`);
    }

    if (action === 'off' || action === 'disable') {
      s.enabled = false;
      writeState(s);
      return reply('🔕 *Auto Prayer OFF*.');
    }

    if (action === 'now' || action === 'test') {
      const msgText = s.message || getDailyPrayer();
      await sock.sendMessage(from, { text: msgText });
      return reply('✅ Prayer sent!');
    }

    if (action === 'set' || action === 'msg') {
      if (!rest) return reply('❓ Usage: .autoprayer set <your custom prayer text>');
      s.message = rest;
      writeState(s);
      return reply('✅ Custom prayer message set!');
    }

    if (action === 'clear') {
      s.message = '';
      writeState(s);
      return reply('✅ Custom prayer cleared — using rotating built-in prayers.');
    }

    if (action === 'addhere') {
      if (!s.targets.includes(from)) s.targets.push(from);
      writeState(s);
      return reply('✅ This chat added to prayer targets.');
    }

    if (action === 'removehere') {
      s.targets = s.targets.filter(t => t !== from);
      writeState(s);
      return reply('✅ This chat removed from prayer targets.');
    }

    if (action === 'list') {
      const list = BUILT_IN_PRAYERS.map((p, i) => `${i + 1}. ${p.split('\n')[0].replace(/\*/g, '')}`).join('\n');
      return reply(`🙏 *Built-in Prayers (${BUILT_IN_PRAYERS.length} total)*\n\n${list}`);
    }

    return reply(
      `🙏 *AutoPrayer Commands*\n\n` +
      `• .autoprayer on <HH:MM>\n` +
      `• .autoprayer off\n` +
      `• .autoprayer now\n` +
      `• .autoprayer set <text>\n` +
      `• .autoprayer clear\n` +
      `• .autoprayer addhere\n` +
      `• .autoprayer list\n` +
      `• .autoprayer status`
    );
  },
};
