/**
 * NovaSpark Bot v3 — Live News
 * .news [topic]  — real-time headlines via RSS (no API key needed)
 * Topics: tech, sports, world, business, health, science, africa, zim
 * By Dev-Ntando
 */
'use strict';

const axios    = require('axios');
const database = require('../../database');

// ── Feed map — pick the most globally reliable, always-free RSS feeds ────────
const FEEDS = {
  world:    'https://feeds.bbci.co.uk/news/world/rss.xml',
  tech:     'https://feeds.bbci.co.uk/news/technology/rss.xml',
  business: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  sports:   'https://feeds.bbci.co.uk/sport/rss.xml',
  health:   'https://feeds.bbci.co.uk/news/health/rss.xml',
  science:  'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  africa:   'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
  zim:      'https://www.herald.co.zw/feed/',
};

const ALIASES = {
  sport: 'sports', football: 'sports', soccer: 'sports',
  technology: 'tech', programming: 'tech', coding: 'tech',
  zimbabwe: 'zim', harare: 'zim',
  global: 'world', international: 'world',
  economy: 'business', finance: 'business',
  medical: 'health', covid: 'health',
};

// ── Minimal RSS parser (no extra dependency) ─────────────────────────────────
async function parseRSS(url) {
  const { data } = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'NovaSpark-Bot/3.0 RSS Reader' },
  });

  const items = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(data)) !== null && items.length < 7) {
    const block = match[1];
    const title = (block.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/i)
                || block.match(/<title[^>]*>(.*?)<\/title>/i) || [])[1] || '';
    const link  = (block.match(/<link[^>]*>(.*?)<\/link>/i) || [])[1]
               || (block.match(/<link>(.*?)<\/link>/i) || [])[1] || '';
    const pub   = (block.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i) || [])[1] || '';

    const cleanTitle = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').trim();
    const cleanLink  = link.replace(/<!\[CDATA\[|\]\]>/g, '').trim();

    if (cleanTitle) items.push({ title: cleanTitle, link: cleanLink, pub });
  }
  return items;
}

module.exports = {
  name: 'news',
  aliases: ['headlines', 'breaking'],
  description: 'Get real-time news headlines — world · tech · sports · africa · zim · business · health · science',
  category: 'free',

  execute: async ({ sock, from, sender, args, reply }) => {
    database.logCommand(sender, 'news');

    let topic = (args[0] || 'world').toLowerCase();
    topic     = ALIASES[topic] || topic;

    const feedUrl = FEEDS[topic];
    if (!feedUrl) {
      const list = Object.keys(FEEDS).join(' · ');
      return reply(`📰 Unknown topic. Available: *${list}*\n\nUsage: *.news tech*`);
    }

    await sock.sendPresenceUpdate('composing', from);
    await reply(`📡 _Fetching ${topic} news..._`);

    try {
      const items = await parseRSS(feedUrl);
      if (!items.length) return reply('📰 No headlines found right now. Try again in a moment.');

      const topicEmoji = {
        world: '🌍', tech: '💻', business: '💼', sports: '⚽',
        health: '🏥', science: '🔬', africa: '🌍', zim: '🇿🇼',
      }[topic] || '📰';

      const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1);
      const now        = new Date().toLocaleTimeString('en-ZA', { timeZone: 'Africa/Harare', hour: '2-digit', minute: '2-digit' });

      let msg = `${topicEmoji} *${topicLabel} Headlines* — ${now}\n`;
      msg    += `${'─'.repeat(30)}\n\n`;

      items.forEach((item, i) => {
        msg += `*${i + 1}.* ${item.title}\n`;
        if (item.link) msg += `   🔗 ${item.link}\n`;
        msg += '\n';
      });

      msg += `_Nova AI ⚡ | Source: BBC/Herald RSS_`;

      await reply(msg);
    } catch (err) {
      console.error('[news]', err.message);
      await reply('❌ Could not fetch news right now. Check your internet connection on the server.');
    }
  },
};
