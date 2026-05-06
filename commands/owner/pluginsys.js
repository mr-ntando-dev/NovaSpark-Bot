/**
 * ⚡ NovaSpark Bot v10 — Plugin System
 * Hot-reload plugins without restart
 * By Dev-Ntando
 */
'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../../config');

const PLUGINS_DIR = path.join(__dirname, '..', '..', 'plugins');

// Ensure plugins directory exists
if (!fs.existsSync(PLUGINS_DIR)) fs.mkdirSync(PLUGINS_DIR, { recursive: true });

// Loaded plugins registry
const loadedPlugins = new Map();

function loadPlugin(filename) {
  const filepath = path.join(PLUGINS_DIR, filename);
  if (!fs.existsSync(filepath)) throw new Error(`Plugin file not found: ${filename}`);

  // Clear require cache for hot reload
  delete require.cache[require.resolve(filepath)];
  const plugin = require(filepath);

  if (!plugin.name) throw new Error(`Plugin missing 'name' export: ${filename}`);

  loadedPlugins.set(plugin.name, { ...plugin, filename, loadedAt: Date.now() });
  return plugin;
}

function unloadPlugin(name) {
  const plugin = loadedPlugins.get(name);
  if (!plugin) return false;
  const filepath = path.join(PLUGINS_DIR, plugin.filename);
  delete require.cache[require.resolve(filepath)];
  loadedPlugins.delete(name);
  return true;
}

function loadAllPlugins() {
  if (!fs.existsSync(PLUGINS_DIR)) return 0;
  const files = fs.readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.js'));
  let loaded = 0;
  for (const file of files) {
    try { loadPlugin(file); loaded++; }
    catch (e) { console.warn(`⚠️ Plugin load error (${file}): ${e.message}`); }
  }
  return loaded;
}

module.exports = {
  name: 'plugin',
  aliases: ['plugins', 'pl', 'addon'],
  category: 'owner',
  description: 'Hot-reload plugin system — add features without restart',
  usage: '.plugin <load|unload|list|reload|info>',
  ownerOnly: true,

  loadedPlugins,
  loadPlugin,
  unloadPlugin,
  loadAllPlugins,

  async execute({ sock, msg, from, args, reply }) {
    const sub = (args[0] || 'list').toLowerCase();

    switch (sub) {
      case 'list': case 'ls': {
        const files = fs.existsSync(PLUGINS_DIR) ? fs.readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.js')) : [];
        if (!files.length && !loadedPlugins.size) return reply('🧩 No plugins found.\n\nDrop .js files in the `plugins/` folder and use `.plugin load <filename>`');

        let response = '🧩 *Plugin System*\n\n';
        if (loadedPlugins.size) {
          response += '*Loaded:*\n';
          for (const [name, p] of loadedPlugins) {
            response += `  ✅ ${name} — ${p.description || 'No description'}\n`;
          }
        }
        const unloaded = files.filter(f => {
          try { const p = require(path.join(PLUGINS_DIR, f)); return !loadedPlugins.has(p.name); }
          catch { return true; }
        });
        if (unloaded.length) {
          response += `\n*Available (not loaded):*\n`;
          unloaded.forEach(f => { response += `  ⬜ ${f}\n`; });
        }
        return reply(response);
      }

      case 'load': {
        const filename = args[1];
        if (!filename) return reply('❌ Usage: `.plugin load <filename.js>`');
        try {
          const p = loadPlugin(filename.endsWith('.js') ? filename : filename + '.js');
          return reply(`✅ Plugin loaded: *${p.name}*\n${p.description || ''}`);
        } catch (e) {
          return reply(`❌ Load failed: ${e.message}`);
        }
      }

      case 'unload': case 'remove': {
        const name = args[1];
        if (!name) return reply('❌ Usage: `.plugin unload <name>`');
        if (unloadPlugin(name)) return reply(`✅ Plugin unloaded: ${name}`);
        return reply(`❌ Plugin "${name}" not found in loaded plugins.`);
      }

      case 'reload': {
        const name = args[1];
        if (name) {
          const plugin = loadedPlugins.get(name);
          if (!plugin) return reply(`❌ Plugin "${name}" not loaded.`);
          try {
            loadPlugin(plugin.filename);
            return reply(`🔄 Plugin reloaded: *${name}*`);
          } catch (e) {
            return reply(`❌ Reload failed: ${e.message}`);
          }
        }
        // Reload all
        const count = loadAllPlugins();
        return reply(`🔄 Reloaded all plugins. ${count} loaded.`);
      }

      case 'info': {
        const name = args[1];
        if (!name) return reply('❌ Usage: `.plugin info <name>`');
        const p = loadedPlugins.get(name);
        if (!p) return reply(`❌ Plugin "${name}" not loaded.`);
        return reply(`🧩 *${p.name}*\n\n📝 ${p.description || 'N/A'}\n📁 File: ${p.filename}\n⏰ Loaded: ${new Date(p.loadedAt).toLocaleString()}\n🏷️ Category: ${p.category || 'N/A'}`);
      }

      default:
        return reply('🧩 *Plugin Commands*\n\n• `.plugin list` — List plugins\n• `.plugin load <file>` — Load a plugin\n• `.plugin unload <name>` — Unload\n• `.plugin reload [name]` — Reload one/all\n• `.plugin info <name>` — Plugin details');
    }
  },

  // Handle plugin commands in message handler
  async handlePluginCommand(sock, msg, from, command, args, ctx) {
    const plugin = loadedPlugins.get(command);
    if (plugin && typeof plugin.execute === 'function') {
      await plugin.execute({ sock, msg, from, args, ...ctx });
      return true;
    }
    // Check aliases
    for (const [, p] of loadedPlugins) {
      if (p.aliases?.includes(command) && typeof p.execute === 'function') {
        await p.execute({ sock, msg, from, args, ...ctx });
        return true;
      }
    }
    return false;
  },
};
