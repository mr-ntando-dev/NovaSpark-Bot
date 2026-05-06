/**
 * ⚡ NovaSpark Bot v10 — AI Agent Mode
 * Multi-step reasoning with tool use: search, calculate, translate, code
 * The AI decides which tools to use and chains them together
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const APIs = require('../../utils/api');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// ── Tool definitions ──────────────────────────────────────────────────────────
const TOOLS = {
  calculate: {
    description: 'Evaluate a math expression',
    execute: async (expr) => {
      try {
        // Safe math evaluation
        const sanitized = expr.replace(/[^0-9+\-*/().%^ ]/g, '');
        const result = Function(`"use strict"; return (${sanitized.replace(/\^/g, '**')})`)();
        return `Result: ${result}`;
      } catch {
        return 'Error: Invalid math expression';
      }
    },
  },
  search: {
    description: 'Search the web for information',
    execute: async (query) => {
      try {
        const r = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`, { timeout: 10000 });
        const abstract = r.data?.AbstractText || r.data?.Abstract;
        if (abstract) return abstract;
        const topics = (r.data?.RelatedTopics || []).slice(0, 3).map(t => t.Text).filter(Boolean).join('\n');
        if (topics) return topics;
        return `Search results for "${query}" - no direct answer found.`;
      } catch {
        return 'Search temporarily unavailable.';
      }
    },
  },
  translate: {
    description: 'Translate text to another language',
    execute: async (input) => {
      try {
        const [text, lang] = input.split('|').map(s => s.trim());
        const to = lang || 'en';
        const result = await APIs.translate(text, to);
        return result;
      } catch (e) {
        return `Translation error: ${e.message}`;
      }
    },
  },
  weather: {
    description: 'Get weather for a city',
    execute: async (city) => {
      try {
        const data = await APIs.getWeather(city);
        return `Weather in ${city}: ${data.temperature || data.temp || 'N/A'}, ${data.description || data.condition || 'N/A'}`;
      } catch {
        return 'Weather data unavailable.';
      }
    },
  },
  time: {
    description: 'Get current date and time',
    execute: async (tz) => {
      const timezone = tz || 'Africa/Harare';
      const now = new Date().toLocaleString('en-ZA', { timeZone: timezone, dateStyle: 'full', timeStyle: 'long' });
      return `Current time (${timezone}): ${now}`;
    },
  },
  wikipedia: {
    description: 'Search Wikipedia for information',
    execute: async (query) => {
      try {
        const result = await APIs.wikiSearch(query);
        return result.extract || result.summary || 'No Wikipedia article found.';
      } catch {
        return 'Wikipedia search failed.';
      }
    },
  },
};

const TOOL_LIST = Object.entries(TOOLS).map(([name, t]) => `• ${name}: ${t.description}`).join('\n');

async function agentThink(query, toolResults = []) {
  const toolContext = toolResults.length
    ? `\n\nTool Results:\n${toolResults.map(r => `[${r.tool}]: ${r.result}`).join('\n')}`
    : '';

  const systemPrompt = `You are NovaSpark Agent, an advanced AI assistant with access to tools.
Available tools:
${TOOL_LIST}

When you need to use a tool, respond ONLY with: TOOL:toolname:input
When you have enough information to answer, respond with: ANSWER:your final answer

Rules:
- Use tools when needed for accurate answers (math, current info, translations)
- You can chain multiple tool calls (one per response)
- Maximum 4 tool calls per query
- If no tool is needed, answer directly
- Be concise and helpful`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query + toolContext },
  ];

  const r = await axios.post('https://text.pollinations.ai/', {
    messages,
    model: 'openai',
    seed: Math.floor(Math.random() * 9999),
  }, { timeout: 30000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });

  const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
  if (!ans) throw new Error('Agent received no response');
  return ans;
}

async function runAgent(query, maxSteps = 4) {
  const toolResults = [];
  let steps = 0;

  while (steps < maxSteps) {
    const response = await agentThink(query, toolResults);

    // Check if agent wants to use a tool
    if (response.startsWith('TOOL:')) {
      const parts = response.split(':');
      const toolName = parts[1]?.trim().toLowerCase();
      const toolInput = parts.slice(2).join(':').trim();

      if (TOOLS[toolName]) {
        const result = await TOOLS[toolName].execute(toolInput);
        toolResults.push({ tool: toolName, input: toolInput, result });
        steps++;
        continue;
      }
    }

    // Check if agent has an answer
    if (response.startsWith('ANSWER:')) {
      return { answer: response.replace('ANSWER:', '').trim(), toolResults, steps };
    }

    // If neither, treat the whole response as the answer
    return { answer: response, toolResults, steps };
  }

  // If max steps reached, ask for final answer
  const finalPrompt = `Based on these tool results, provide a final answer to: "${query}"\n\nResults:\n${toolResults.map(r => `[${r.tool}]: ${r.result}`).join('\n')}`;
  const r = await axios.post('https://text.pollinations.ai/', {
    messages: [
      { role: 'system', content: 'Synthesize the information and provide a clear, concise answer.' },
      { role: 'user', content: finalPrompt },
    ],
    model: 'openai-fast',
    seed: Math.floor(Math.random() * 9999),
  }, { timeout: 25000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } });

  const final = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
  return { answer: final || 'I could not determine an answer.', toolResults, steps };
}

module.exports = {
  name: 'agent',
  aliases: ['smart', 'think', 'reason', 'solve'],
  category: 'ai',
  description: 'AI Agent with multi-step reasoning and tool use (search, calculate, translate, etc.)',
  usage: '.agent <complex question>',

  async execute({ sock, msg, from, args, reply }) {
    const query = args.join(' ');
    if (!query) {
      return reply(`🧠 *NovaSpark Agent*\n\nI can solve complex questions by reasoning step-by-step and using tools.\n\n*Available Tools:*\n${TOOL_LIST}\n\n_Examples:_\n• \`.agent What's 15% tip on $47.80?\`\n• \`.agent What's the weather in London and translate it to French?\`\n• \`.agent Who invented the telephone and when?\``);
    }

    try {
      await sock.sendMessage(from, { react: { text: '🧠', key: msg.key } });
      const { answer, toolResults, steps } = await runAgent(query);

      let response = `🧠 *NovaSpark Agent*\n\n${answer}`;

      if (toolResults.length > 0) {
        response += `\n\n⚙️ _Used ${toolResults.length} tool(s) in ${steps} step(s)_`;
      }

      response += '\n\n_Nova AI ⚡_';
      await reply(response);
    } catch (e) {
      await reply(`❌ Agent Error: ${e.message}`);
    }
  },
};
