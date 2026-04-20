/**
 * ⚡ NovaSpark Bot — Unified Server Entry Point
 * Runs the WhatsApp bot + Admin Panel in a single process
 * Deployable on Render (Web Service)
 */

'use strict';

// ── Launch Admin Panel HTTP server first (required for Render health check) ───
require('./admin/server');

// ── Then start the WhatsApp bot ───────────────────────────────────────────────
require('./index');
