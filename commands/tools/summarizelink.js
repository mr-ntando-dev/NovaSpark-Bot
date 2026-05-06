/**
 * ⚡ NovaSpark Bot v11 — .summarizelink
 * Fetch any URL and produce a bullet-point summary using heuristic extraction.
 * No API key needed — works with pure Node.js https + cheerio-free HTML parsing.
 * By Dev-Ntando
 */
'use strict';
const https  = require('https');
const http   = require('http');
const url    = require('url');
const config = require('../../config');

// ── Tiny HTML → plain-text stripper ──────────────────────────────────────────
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ── Extract <title> ───────────────────────────────────────────────────────────
function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : '';
}

// ── Extract meta description ──────────────────────────────────────────────────
function extractMeta(html) {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
    || html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  return m ? m[1].trim() : '';
}

// ── Heuristic sentence-level summariser ──────────────────────────────────────
function summarize(text, maxBullets = 6) {
  // Split into sentences
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 350);

  if (!sentences.length) return [];

  // Score sentences: longer, earlier = higher weight; deduplicate
  const seen = new Set();
  const scored = sentences.slice(0, 60).map((s, i) => ({
    text: s,
    score: (1 / (i + 1)) * Math.min(s.length, 200),
  }));
  scored.sort((a, b) => b.score - a.score);

  const bullets = [];
  for (const { text } of scored) {
    const key = text.slice(0, 60).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    bullets.push(text);
    if (bullets.length >= maxBullets) break;
  }
  return bullets;
}

// ── HTTP fetch with redirect following ───────────────────────────────────────
function fetch(rawUrl, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Too many redirects'));
    const parsed  = url.parse(rawUrl);
    const client  = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      path:     parsed.path || '/',
      port:     parsed.port,
      method:   'GET',
      headers:  {
        'User-Agent': 'Mozilla/5.0 (compatible; NovaSpark-Bot/11; +https://github.com/mr-ntando-dev/NovaSpark-Bot)',
        'Accept':     'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    };
    const req = client.request(options, res => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.hostname}${res.headers.location}`;
        return resolve(fetch(loc, redirects + 1));
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      let size = 0;
      res.on('data', chunk => {
        size += chunk.length;
        if (size > 500_000) { req.destroy(); return; } // cap at 500KB
        chunks.push(chunk);
      });
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.end();
  });
}

module.exports = {
  name:        'summarizelink',
  aliases:     ['sumlink', 'tldr', 'readlink', 'websum'],
  category:    'tools',
  description: 'Fetch any URL and summarize its content into bullet points',
  usage:       '.summarizelink <url>',

  execute: async ({ sock, msg, from, args, reply }) => {
    const rawUrl = args[0];
    if (!rawUrl || !rawUrl.startsWith('http')) {
      return reply('Usage: `.summarizelink <url>`\nExample: `.summarizelink https://bbc.com/news/article`');
    }

    await sock.sendMessage(from, { text: '🌐 Fetching page... please wait.' }, { quoted: msg });

    let html;
    try {
      html = await fetch(rawUrl);
    } catch (e) {
      return reply(`❌ Could not fetch that URL: ${e.message}`);
    }

    const title   = extractTitle(html);
    const meta    = extractMeta(html);
    const plain   = stripHtml(html);
    const bullets = summarize(plain);

    if (!bullets.length && !meta) {
      return reply('⚠️ Could not extract meaningful content from that page. It may require JavaScript to load.');
    }

    const lines = [
      `📰 *${title || 'Article Summary'}*`,
      `🔗 ${rawUrl}`,
      '━━━━━━━━━━━━━━━━━━━━━━━',
    ];
    if (meta) lines.push(`📌 ${meta}`, '');
    if (bullets.length) {
      lines.push('📋 *Key Points:*');
      for (const b of bullets) lines.push(`  ▸ ${b}`);
    }
    lines.push('', `_Summarized by NovaSpark Bot v${config.botVersion}_`);

    return reply(lines.join('\n'));
  },
};
