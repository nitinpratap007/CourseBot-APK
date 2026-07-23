const { getSupabase } = require('./_lib/supabase');
const { corsResponse, handleCors } = require('./_lib/cors');
const https = require('https');

const SYSTEM_PROMPT = `You are NitinChatBot, a smart AI assistant powered by Gemini. You can answer ANY question like ChatGPT - math, science, coding, general knowledge, life advice, writing, translations, anything.

You also have access to a course catalog. When a user asks about learning, courses, or a topic that matches a course in the catalog, recommend the relevant course(s) naturally.

Rules:
- Always respond in markdown format (use **bold**, lists, code blocks when needed)
- Be conversational, friendly, and helpful like ChatGPT
- Answer ALL questions - not just course-related ones
- Use emojis occasionally
- Keep responses concise but thorough
- If you know the answer, give it directly. Only suggest courses when it makes sense.
- For coding questions, use code blocks
- For math, show your work step by step`;

function callGemini(userMessage, courseCatalog) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Promise.reject(new Error('No GEMINI_API_KEY'));

  const prompt = `Available Courses:\n${courseCatalog}\n\n---\n\nUser: ${userMessage}`;

  const payload = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 25000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return resolve(text);
          reject(new Error('Empty response'));
        } catch (e) { reject(e); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function handleQuery(event) {
  const corsResult = handleCors(event);
  if (corsResult) return corsResult;

  let body;
  try { body = JSON.parse(event.body); } catch { return corsResponse(400, { error: 'Invalid JSON' }); }

  const { question, student } = body;
  if (!question || !question.trim()) return corsResponse(400, { error: 'Question required' });

  const supabase = getSupabase();
  let answer = '';

  if (process.env.GEMINI_API_KEY) {
    try {
      const { data: courses } = await supabase.from('courses').select('name, description, category').limit(20);
      const catalog = courses && courses.length > 0
        ? courses.map(c => `- ${c.name} [${c.category}]: ${c.description}`).join('\n')
        : 'No courses in catalog yet.';
      answer = await callGemini(question.trim(), catalog);
    } catch (e) {
      console.error('[Gemini Error]', e.message);
      answer = '';
    }
  }

  if (!answer) {
    answer = "Sorry, I'm unable to process your request right now. Please try again in a moment.";
  }

  try {
    await supabase.from('queries').insert({ student: student || 'Anonymous', question: question.trim(), answer: answer.substring(0, 500) });
  } catch (e) {}

  return corsResponse(200, { answer, courses: [] });
}

exports.handler = handleQuery;
