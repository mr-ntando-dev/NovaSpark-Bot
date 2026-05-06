/**
 * ⚡ NovaSpark Bot v11 — .scam
 * Heuristic AI scam/phishing detector — no API key needed.
 * Scores a message 0-100 for scam likelihood with reasoning.
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

// ── Heuristic scam signal library ────────────────────────────────────────────
const SIGNALS = [
  // Urgency / pressure
  { re: /\b(urgent|act now|limited time|expires? (today|tonight|in \d+)|hurry|last chance|don'?t miss|immediate(ly)?)\b/i, score: 12, label: 'Urgency pressure' },
  // Money promises
  { re: /\b(win|winner|won|you'?ve been selected|congratulations|prize|reward|claim your|free (money|cash|gift|iphone|phone))\b/i, score: 15, label: 'Prize / reward bait' },
  // Click link pressure
  { re: /\b(click (here|the link|below)|tap (here|link)|visit now|open link|follow (the )?link)\b/i, score: 10, label: 'Forced link click' },
  // Credential harvesting
  { re: /\b(verify (your )?(account|identity|details|number|password)|confirm (your )?(details|account|info)|update (your )?(info|details|account))\b/i, score: 18, label: 'Credential harvesting' },
  // Impersonation keywords
  { re: /\b(whatsapp (team|support|official)|facebook (team|support)|google (team|security)|bank (alert|notification)|paypal|western union|moneygram)\b/i, score: 20, label: 'Brand impersonation' },
  // Suspicious URLs
  { re: /https?:\/\/[^\s]*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})[^\s]*/i, score: 25, label: 'Raw IP URL (red flag)' },
  { re: /https?:\/\/[^\s]*(bit\.ly|tinyurl|ow\.ly|t\.co\/(?!twitter)|is\.gd|cutt\.ly|rb\.gy)[^\s]*/i, score: 10, label: 'Shortened URL' },
  { re: /https?:\/\/[^\s]*(login|secure|verify|account|update|confirm|banking)[^\s]*/i, score: 15, label: 'Suspicious URL keyword' },
  // Money transfer requests
  { re: /\b(send (me )?(money|cash|\$|zim|usd|rand)|transfer|mobile money|ecocash|innbucks|mukuru|send \d+)\b/i, score: 20, label: 'Money transfer request' },
  // Too-good-to-be-true
  { re: /\b(\$\d{3,}|\d{3,} (usd|dollars?|rand|zim)|earn \d+|make \d+ (per|a) (day|week|month)|passive income|work from home)\b/i, score: 12, label: 'Unrealistic financial claim' },
  // Secrecy / warning not to share
  { re: /\b(don'?t (tell|share|show|forward)|keep (it |this )?(secret|private|between us)|just between (you and me|us))\b/i, score: 14, label: 'Secrecy request' },
  // OTP fishing
  { re: /\b(otp|one.?time.?(pin|password|code)|verification code|send (me |the )?code|share (the |your )?code)\b/i, score: 22, label: 'OTP / code phishing' },
  // Personal info fishing
  { re: /\b(id number|national id|passport number|date of birth|mother'?s maiden|ssn|social security|bank account number|card number|cvv|pin number)\b/i, score: 20, label: 'Personal info fishing' },
  // Lottery / inheritance
  { re: /\b(lottery|jackpot|inheritance|deceased (relative|client)|attorney|barrister|next of kin|fund transfer)\b/i, score: 22, label: 'Lottery / 419 fraud' },
  // Job scam
  { re: /\b(job offer|hiring now|work from home|easy (money|job)|no experience needed|be your own boss|mlm|network marketing)\b/i, score: 10, label: 'Job / MLM scam' },
];

const POSITIVE_SIGNALS = [
  { re: /\b(police|report|scam alert|warning|be careful|watch out|fraud alert)\b/i, score: -8, label: 'Scam warning (positive)' },
];

function analyzeText(text) {
  const hits = [];
  let total = 0;
  for (const sig of SIGNALS) {
    if (sig.re.test(text)) {
      hits.push(sig.label);
      total += sig.score;
    }
  }
  for (const sig of POSITIVE_SIGNALS) {
    if (sig.re.test(text)) {
      hits.push(sig.label);
      total += sig.score; // negative
    }
  }
  return { score: Math.min(100, Math.max(0, total)), hits };
}

function verdict(score) {
  if (score >= 70) return { emoji: '🚨', label: 'HIGH RISK — Very likely a scam', color: 'red' };
  if (score >= 45) return { emoji: '⚠️', label: 'MEDIUM RISK — Suspicious content', color: 'orange' };
  if (score >= 20) return { emoji: '🟡', label: 'LOW RISK — Some suspicious signals', color: 'yellow' };
  return { emoji: '✅', label: 'LIKELY SAFE — No major scam signals', color: 'green' };
}

function scoreBar(score) {
  const filled = Math.round(score / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled) + ` ${score}/100`;
}

module.exports = {
  name:        'scam',
  aliases:     ['scamcheck', 'phishing', 'fraud', 'checkscam'],
  category:    'tools',
  description: 'Heuristic AI scam & phishing detector — reply to a message or pass text',
  usage:       '.scam <text>  OR  reply to a message with .scam',

  execute: async ({ sock, msg, from, args, reply, sender }) => {
    // Get text from quoted message or args
    let text = '';
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted) {
      text = quoted.conversation
        || quoted.extendedTextMessage?.text
        || quoted.imageMessage?.caption
        || '';
    }
    if (!text && args.length) text = args.join(' ');
    if (!text) {
      return reply([
        '🔍 *Scam Detector*',
        '',
        'Usage:',
        '  • Reply to a suspicious message with `.scam`',
        '  • Or: `.scam <paste the suspicious text>`',
      ].join('\n'));
    }

    const { score, hits } = analyzeText(text);
    const v = verdict(score);

    const lines = [
      `${v.emoji} *SCAM ANALYSIS RESULT*`,
      '━━━━━━━━━━━━━━━━━━━━━━━',
      `📊 *Risk Score:* ${scoreBar(score)}`,
      `🏷️ *Verdict:* ${v.label}`,
      '━━━━━━━━━━━━━━━━━━━━━━━',
    ];

    if (hits.length) {
      lines.push(`\n⚠️ *Signals detected (${hits.length}):*`);
      for (const h of hits) lines.push(`  ▸ ${h}`);
    } else {
      lines.push('\n✅ No scam signals detected in this text.');
    }

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`_Scanned ${text.length} characters · NovaSpark v${config.botVersion}_`);
    if (score >= 45) {
      lines.push('');
      lines.push('🛡️ *Advice:* Do NOT click any links, share personal info, send money, or forward this message. Report it.');
    }

    return reply(lines.join('\n'));
  },
};
