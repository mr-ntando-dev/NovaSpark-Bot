/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   NovaSpark Smart Detector — Auto-classify incoming messages    ║
 * ║   Detects: math · homework · essay · translate · weather ·     ║
 * ║            summarize · studytips · image-math · general AI     ║
 * ║   By Dev-Ntando                                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
'use strict';

// ── Patterns ──────────────────────────────────────────────────────────────────

const MATH_PATTERNS = [
  // equation triggers
  /\b(solve|calculate|compute|evaluate|simplify|factorise|factorize|differentiate|integrate|expand|find the|what is|what's)\b.{0,60}[\d\+\-\*\/\=\^\(\)]/i,
  // naked math expressions
  /^\s*[\d\s\+\-\*\/\^=\(\)\.%]+[\+\-\*\/\^=][\d\s\+\-\*\/\^=\(\)\.%]+\s*[=?]?\s*$/,
  // word math
  /\b(derivative|integral|limit|equation|inequality|matrix|determinant|quadratic|pythagoras|trigonometry|sin|cos|tan|log|sqrt|percentage|fraction|algebra|geometry|calculus)\b/i,
  // typical homework math phrasing
  /\b(if\s+x|let\s+x|prove that|show that|find\s+(x|y|the value|the area|the volume|the perimeter|the angle))/i,
];

const WEATHER_PATTERNS = [
  /\b(weather|temperature|forecast|how hot|how cold|rain|raining|sunny|cloudy|humidity|wind speed|will it rain|what'?s the temp|degrees today|climate in|weather in|weather at|weather for)\b/i,
  /\btemp(erature)?\s+(in|of|at|for)\b/i,
];

const HOMEWORK_PATTERNS = [
  /\b(homework|home work|hw|assignment|school work|class work|can you help me (with|on)|help me (answer|solve|understand|explain)|what is (the meaning|the answer|the definition)|explain (to me|briefly|in detail|the concept)|definition of|what causes|why does|how does|who was|what happened (in|during|when)|essay question|short note|give me notes on)\b/i,
  /\b(history|biology|chemistry|physics|geography|economics|accounting|literature|english grammar|civics|science|social studies|computer science)\s+(question|topic|answer|notes|homework|assignment|test|exam)\b/i,
];

const ESSAY_PATTERNS = [
  /\b(write (an? |me an? )?(essay|article|composition|report|story|letter|speech|paragraph|introduction|conclusion)|give me an essay|essay on|article about|write about|write a (short |long |full )?essay)\b/i,
];

const TRANSLATE_PATTERNS = [
  /\b(translate|translation|say .{1,30} in|how (do you|do I|do u) say .{1,40} in|what (is|does) .{1,40} mean in|convert to (french|spanish|portuguese|arabic|chinese|japanese|zulu|shona|ndebele|swahili|german|italian|russian|hindi|turkish|korean)|in (french|spanish|portuguese|arabic|chinese|japanese|zulu|shona|ndebele|swahili|german|italian|russian|hindi|turkish|korean))\b/i,
];

const SUMMARIZE_PATTERNS = [
  /\b(summarize|summarise|give me a summary|tldr|tl;dr|brief me|sum up|short version|key points of|main points of|give me the gist)\b/i,
];

const STUDYTIPS_PATTERNS = [
  /\b(study tips|how (to|do I|should I) (study|revise|prepare|pass)|revision tips|exam tips|how to pass|learning tips|study guide for|how to remember|memory tips for)\b/i,
];

// ── Image math OCR patterns (applied on OCR'd text from images) ───────────────
const IMAGE_MATH_PATTERNS = [
  /[\d\s\+\-\*\/\^\=\(\)]+[\+\-\*\/\^\=][\d\s\+\-\*\/\^\=\(\)]+/,
  /\b(solve|find|calculate|simplify|factorise)\b/i,
  /\b(equation|expression|formula|problem|question)\b/i,
];

// ── Classifier ────────────────────────────────────────────────────────────────

/**
 * Classify a text message.
 * Returns one of: 'math' | 'weather' | 'homework' | 'essay' | 'translate' |
 *                 'summarize' | 'studytips' | 'chat' | null
 * null = let generic autochat handle it
 */
function classifyText(text) {
  if (!text || text.trim().length < 2) return null;
  const t = text.trim();

  // Order matters — more specific first
  if (ESSAY_PATTERNS.some(p => p.test(t)))      return 'essay';
  if (TRANSLATE_PATTERNS.some(p => p.test(t)))   return 'translate';
  if (SUMMARIZE_PATTERNS.some(p => p.test(t)))   return 'summarize';
  if (STUDYTIPS_PATTERNS.some(p => p.test(t)))   return 'studytips';
  if (WEATHER_PATTERNS.some(p => p.test(t)))     return 'weather';
  if (MATH_PATTERNS.some(p => p.test(t)))        return 'math';
  if (HOMEWORK_PATTERNS.some(p => p.test(t)))    return 'homework';

  return null; // fallback to generic AI chat
}

/**
 * Classify OCR text from an image — specifically for math detection.
 * Returns 'math' | null
 */
function classifyImageOCR(ocrText) {
  if (!ocrText || ocrText.trim().length < 3) return null;
  if (IMAGE_MATH_PATTERNS.some(p => p.test(ocrText))) return 'math';
  return null;
}

module.exports = { classifyText, classifyImageOCR };
