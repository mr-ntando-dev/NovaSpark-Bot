/**
 * ⚡ NovaSpark Bot v8.0 — Auto Status Saver
 * .autostatus on/off    — Save all contacts' statuses automatically
 * .autostatus saved     — List saved statuses
 * .autostatus forward <n> <jid>  — Forward saved status to a chat
 * Intercepts status updates from contacts and saves them silently
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');
const fs = require('fs');
const path = require('path');

const STATUS_DIR = path.join(__dirname, '../../data/saved_statuses');
if (!fs.existsSync(STATUS_DIR)) fs.mkdirSync(STATUS_DIR, { recursive: true });

module.exports = {
  name: 'autostatus',
  aliases: ['statussaver', 'savestatus'],
  description: 'Auto-save WhatsApp statuses from all contacts',
  category: 'owner',
  ownerOnly: true,

  onStatusUpdate: async ({ sock, status, sender }) => {
    const global = database.getGlobalSetting ? database.getGlobalSetting('autoStatusSave') : false;
    if (!global) return;

    try {
      const num = sender.split('@')[0];
      const ts = Date.now();
      const entry = {
        id: ts,
        sender: num,
        type: status.type || 'text',
        caption: status.caption || '',
        ts,
        savedAt: new Date().toISOString(),
      };

      // Save to database
      if (database.saveStatus) database.saveStatus(entry);
    } catch {}
  },

  execute: async ({ sock, msg, from, args, reply, isOwner }) => {
    if (!isOwner) return reply('👑 Owner only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      if (database.setGlobalSetting) database.setGlobalSetting('autoStatusSave', true);
      return reply(
        '📸 *Auto Status Saver: ON*\n\n' +
        'All contact statuses will be saved automatically.\n' +
        '_Use `.autostatus saved` to view saved statuses._'
      );
    }
    if (sub === 'off') {
      if (database.setGlobalSetting) database.setGlobalSetting('autoStatusSave', false);
      return reply('📸 *Auto Status Saver: OFF*');
    }
    if (sub === 'saved') {
      const saved = database.getSavedStatuses ? database.getSavedStatuses().slice(-20) : [];
      if (!saved.length) return reply('📭 No statuses saved yet.\n\nEnable with `.autostatus on`');
      const lines = saved.map((s, i) =>
        `${i+1}. 👤 +${s.sender} — ${s.type} — ${new Date(s.ts).toLocaleDateString('en-ZA')}`
      ).join('\n');
      return reply(`📸 *Saved Statuses (last 20)*\n\n${lines}\n\n_Use \`.autostatus forward <#> <jid>\` to forward one._`);
    }
    if (sub === 'forward') {
      const idx = parseInt(args[1]) - 1;
      const dest = args[2];
      if (isNaN(idx) || !dest) return reply('❌ Usage: `.autostatus forward <#> <jid>`');
      const saved = database.getSavedStatuses ? database.getSavedStatuses() : [];
      const entry = saved[idx];
      if (!entry) return reply('❌ Status not found.');
      await sock.sendMessage(dest, { text: `📸 *Status from +${entry.sender}*\n\n${entry.caption || '(No text)'}` });
      return reply(`✅ Status forwarded to \`${dest}\``);
    }
    if (sub === 'clear') {
      if (database.clearSavedStatuses) database.clearSavedStatuses();
      return reply('🗑️ All saved statuses cleared.');
    }

    const isOn = database.getGlobalSetting ? database.getGlobalSetting('autoStatusSave') : false;
    const count = database.getSavedStatuses ? database.getSavedStatuses().length : 0;
    return reply(
      '📸 *Auto Status Saver*\n\n' +
      `Status: *${isOn ? 'ON ✅' : 'OFF ❌'}*\n` +
      `Saved: *${count} statuses*\n\n` +
      '`.autostatus on/off` — Toggle\n' +
      '`.autostatus saved` — View saved statuses\n' +
      '`.autostatus forward <#> <jid>` — Forward a status\n' +
      '`.autostatus clear` — Clear all saved'
    );
  },
};
