const { getSupabase } = require('./_lib/supabase');
const { corsResponse, handleCors } = require('./_lib/cors');

async function callGeminiAPI(userMessage, courseContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No GEMINI_API_KEY env var');

  const systemPrompt = `You are NitinChatBot, a friendly course recommendation assistant. Recommend courses from the provided catalog. Respond in markdown. Be conversational and helpful like ChatGPT. Use emojis. If no courses match, give general advice.`;

  const fullPrompt = `${systemPrompt}\n\nCourse Catalog:\n${courseContext}\n\nUser: ${userMessage}\n\nAssistant:`;

  const payload = JSON.stringify({
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });

  const json = await res.json();

  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No text in response: ' + JSON.stringify(json).substring(0, 300));
  return text;
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
  let debug = {};

  if (process.env.GEMINI_API_KEY) {
    debug.keyLen = process.env.GEMINI_API_KEY.length;
    try {
      const { data: courses } = await supabase.from('courses').select('name, description, category').limit(20);
      const ctx = courses && courses.length > 0
        ? courses.map(c => `- ${c.name} (${c.category}): ${c.description}`).join('\n')
        : 'No courses available yet.';
      debug.ctxLen = ctx.length;
      answer = await callGeminiAPI(question, ctx);
      debug.source = 'gemini';
    } catch (e) {
      debug.error = e.message;
      console.error('[Gemini] Error:', e.message);
      answer = '';
    }
  } else {
    debug.error = 'No GEMINI_API_KEY';
  }

  if (!answer) {
    answer = "I'm having trouble connecting to my AI brain right now. Please try again in a moment!";
  }

  try {
    await supabase.from('queries').insert({ student: student || 'Anonymous', question, answer: answer.substring(0, 500) });
  } catch (e) {}

  return corsResponse(200, { answer, courses: [], debug });
}

exports.handler = handleQuery;
