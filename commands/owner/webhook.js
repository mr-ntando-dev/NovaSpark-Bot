/**
 * ⚡ NovaSpark Bot v10 — Webhook Integration
 * Send/receive webhooks for external service integration
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const database = require('../../database');
const config = require('../../config');

function getWebhooks() {
  return database.getSetting('webhooks') || [];
}

function saveWebhooks(hooks) {
  database.setSetting('webhooks', hooks);
}

module.exports = {
  name: 'webhook',
  aliases: ['wh', 'webhooks', 'hook'],
  category: 'owner',
  description: 'Manage webhook integrations for external notifications',
  usage: '.webhook <add|remove|list|test|send>',
  ownerOnly: true,

  async execute({ sock, msg, from, args, reply, sender }) {
    const sub = (args[0] || 'list').toLowerCase();

    switch (sub) {
      case 'add': case 'create': {
        const name = args[1];
        const url = args[2];
        if (!name || !url) return reply('❌ Usage: `.webhook add <name> <url>`\n\n_Example: `.webhook add discord https://discord.com/api/webhooks/...`_');
        if (!url.startsWith('http')) return reply('❌ URL must start with http:// or https://');

        const hooks = getWebhooks();
        hooks.push({ name, url, createdAt: Date.now(), events: ['all'] });
        saveWebhooks(hooks);
        return reply(`✅ Webhook "${name}" added!\n\n_It will receive bot events._`);
      }

      case 'remove': case 'delete': {
        const name = args[1];
        if (!name) return reply('❌ Usage: `.webhook remove <name>`');
        let hooks = getWebhooks();
        const before = hooks.length;
        hooks = hooks.filter(h => h.name !== name);
        if (hooks.length === before) return reply(`❌ Webhook "${name}" not found.`);
        saveWebhooks(hooks);
        return reply(`✅ Webhook "${name}" removed.`);
      }

      case 'list': {
        const hooks = getWebhooks();
        if (!hooks.length) return reply('🔗 No webhooks configured.\n\nUse `.webhook add <name> <url>` to add one.');
        const list = hooks.map((h, i) => `${i + 1}. *${h.name}* — ${h.url.substring(0, 40)}...`).join('\n');
        return reply(`🔗 *Webhooks*\n\n${list}`);
      }

      case 'test': {
        const name = args[1];
        const hooks = getWebhooks();
        const hook = name ? hooks.find(h => h.name === name) : hooks[0];
        if (!hook) return reply('❌ No webhook found. Add one first.');

        try {
          await axios.post(hook.url, {
            event: 'test',
            bot: config.botName,
            message: 'NovaSpark webhook test',
            timestamp: new Date().toISOString(),
          }, { timeout: 10000 });
          return reply(`✅ Test sent to "${hook.name}" successfully!`);
        } catch (e) {
          return reply(`❌ Webhook test failed: ${e.message}`);
        }
      }

      case 'send': {
        const name = args[1];
        const message = args.slice(2).join(' ');
        if (!name || !message) return reply('❌ Usage: `.webhook send <name> <message>`');

        const hooks = getWebhooks();
        const hook = hooks.find(h => h.name === name);
        if (!hook) return reply(`❌ Webhook "${name}" not found.`);

        try {
          await axios.post(hook.url, {
            event: 'custom',
            bot: config.botName,
            content: message,
            sender: sender,
            timestamp: new Date().toISOString(),
          }, { timeout: 10000 });
          return reply(`✅ Message sent to "${name}" webhook.`);
        } catch (e) {
          return reply(`❌ Send failed: ${e.message}`);
        }
      }

      default:
        return reply('🔗 *Webhook Commands*\n\n• `.webhook add <name> <url>`\n• `.webhook remove <name>`\n• `.webhook list`\n• `.webhook test [name]`\n• `.webhook send <name> <message>`');
    }
  },

  // Helper for other modules to trigger webhooks
  async fireWebhook(event, data) {
    const hooks = getWebhooks();
    for (const hook of hooks) {
      if (hook.events.includes('all') || hook.events.includes(event)) {
        try {
          await axios.post(hook.url, { event, ...data, timestamp: new Date().toISOString() }, { timeout: 5000 });
        } catch {}
      }
    }
  },
};
