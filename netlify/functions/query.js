const { getSupabase } = require('./_lib/supabase');
const { corsResponse, handleCors } = require('./_lib/cors');
const https = require('https');

async function callGeminiAPI(userMessage, courseContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No GEMINI_API_KEY env var');

  const systemPrompt = `You are NitinChatBot, a friendly course recommendation assistant. Recommend courses from the provided catalog. Respond in markdown. Be conversational and helpful like ChatGPT. Use emojis. If no courses match, give general advice.`;

  const fullPrompt = `Course Catalog:\n${courseContext}\n\nUser: ${userMessage}`;

  const payload = JSON.stringify({
    contents: [{ parts: [{ text: fullPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 25000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message || 'Gemini error'));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return resolve(text);
          reject(new Error('No text in Gemini response'));
        } catch (e) { reject(e); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Gemini timeout')); });
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
  const q = question.trim().toLowerCase();
  let answer = '';

  if (process.env.GEMINI_API_KEY) {
    try {
      const { data: courses } = await supabase.from('courses').select('name, description, category').limit(20);
      const ctx = courses && courses.length > 0
        ? courses.map(c => `- ${c.name} (${c.category}): ${c.description}`).join('\n')
        : 'No courses available yet.';
      answer = await callGeminiAPI(question, ctx);
    } catch (e) {
      console.error('[Gemini] Error:', e.message);
      answer = '';
    }
  }

  if (!answer) {
    answer = "I'm having trouble connecting to my AI brain right now. Please try again in a moment!";
  }

  try {
    await supabase.from('queries').insert({ student: student || 'Anonymous', question, answer: answer.substring(0, 500) });
  } catch (e) { console.error('Log error:', e); }

  return corsResponse(200, { answer, courses: [] });
}

exports.handler = handleQuery;
