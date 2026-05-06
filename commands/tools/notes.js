/**
 * ⚡ NovaSpark v9 — Group Notes / Pinboard
 * .note add <title> | <content> — Add a note
 * .note list — List all notes
 * .note get <title> — Read a note
 * .note delete <title> — Delete a note (admin only)
 * .note clear — Clear all notes (admin only)
 * Per-group notepad. Perfect for rules, links, announcements.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'note',
  aliases: ['notes', 'pinboard', 'notepad'],
  description: '📝 Group notepad — save and retrieve notes',
  category: 'tools',

  execute: async ({ from, args, reply, isAdmin, isOwner }) => {
    const sub = (args[0] || '').toLowerCase();

    // Helper
    const getNotes = () => {
      const s = database.getSetting ? database.getSetting(`notes_${from}`) : null;
      return s || {};
    };
    const saveNotes = (obj) => {
      if (database.setSetting) database.setSetting(`notes_${from}`, obj);
    };

    if (sub === 'list') {
      const notes = getNotes();
      const keys = Object.keys(notes);
      if (!keys.length) return reply('📝 No notes saved yet.\n\nAdd one: *.note add title | content*');
      const list = keys.map((k, i) => `${i + 1}. *${k}*`).join('\n');
      return reply(`📝 *Group Notes (${keys.length})*\n\n${list}\n\nRead: *.note get <title>*`);
    }

    if (sub === 'get') {
      const title = args.slice(1).join(' ').trim().toLowerCase();
      if (!title) return reply('📝 Usage: *.note get <title>*');
      const notes = getNotes();
      const note = notes[title];
      if (!note) return reply(`📝 Note "*${title}*" not found.\n\nSee all: *.note list*`);
      return reply(`📝 *${title.toUpperCase()}*\n\n${note.content}\n\n_Saved by @${note.by} on ${note.date}_`);
    }

    if (sub === 'add') {
      const rest = args.slice(1).join(' ');
      const sep = rest.indexOf('|');
      if (sep === -1) return reply('📝 Usage: *.note add title | content*\n\nExample: *.note add rules | 1. Be respectful 2. No spam*');
      const title = rest.slice(0, sep).trim().toLowerCase();
      const content = rest.slice(sep + 1).trim();
      if (!title || !content) return reply('📝 Both title and content are required.');
      if (title.length > 50) return reply('📝 Title too long (max 50 chars).');
      const notes = getNotes();
      notes[title] = { content, by: 'user', date: new Date().toLocaleDateString('en-ZA') };
      saveNotes(notes);
      return reply(`✅ Note "*${title}*" saved!\n\nRead it: *.note get ${title}*`);
    }

    if (sub === 'delete' || sub === 'del' || sub === 'remove') {
      if (!isAdmin && !isOwner) return reply('🛡️ Only admins can delete notes.');
      const title = args.slice(1).join(' ').trim().toLowerCase();
      if (!title) return reply('📝 Usage: *.note delete <title>*');
      const notes = getNotes();
      if (!notes[title]) return reply(`📝 Note "*${title}*" not found.`);
      delete notes[title];
      saveNotes(notes);
      return reply(`🗑️ Note "*${title}*" deleted.`);
    }

    if (sub === 'clear') {
      if (!isAdmin && !isOwner) return reply('🛡️ Only admins can clear notes.');
      saveNotes({});
      return reply('🗑️ All group notes cleared!');
    }

    return reply(
      '📝 *Group Notes — Commands*\n\n' +
      '*.note add title | content* — Save a note\n' +
      '*.note list* — See all notes\n' +
      '*.note get title* — Read a note\n' +
      '*.note delete title* — Delete (admin)\n' +
      '*.note clear* — Clear all (admin)'
    );
  },
};
