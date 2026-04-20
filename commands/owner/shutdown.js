/**
 * ⚡ NovaSpark Bot v5 — Shutdown & Restart
 * .shutdown — gracefully shut down the bot (owner only)
 * .restart  — restart the bot process (owner only)
 * By Dev-Ntando
 */
'use strict';

module.exports = [
  // ── .shutdown ────────────────────────────────────────────────────────────
  {
    name: 'shutdown',
    aliases: ['turnoff', 'stopbot'],
    description: '🔴 Shut down the bot gracefully',
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, from, msg, reply }) {
      await reply(
        '🔴 *NovaSpark Bot is shutting down...*\n\n' +
        '_Goodbye. It was a pleasure. Kind of._\n\n' +
        '⚡ NovaSpark Bot v5'
      );
      // Give the reply time to send before exiting
      setTimeout(() => process.exit(0), 2000);
    },
  },

  // ── .restart ─────────────────────────────────────────────────────────────
  {
    name: 'restart',
    aliases: ['reboot', 'restartbot'],
    description: '🔄 Restart the bot process',
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, from, reply }) {
      await reply(
        '🔄 *NovaSpark Bot is restarting...*\n\n' +
        '_Back in a moment. Try to manage without me._\n\n' +
        '⚡ NovaSpark Bot v5'
      );
      setTimeout(() => {
        // If running under PM2 / nodemon this will trigger a clean restart.
        // process.exitCode = 1 signals a crash-restart to process managers.
        process.exit(1);
      }, 2000);
    },
  },
];
