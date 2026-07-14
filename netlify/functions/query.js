const { getSupabase } = require('./_lib/supabase');
const { corsResponse, handleCors } = require('./_lib/cors');

const COURSE_KEYWORDS = {
  frontend: ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript', 'frontend', 'front-end', 'ui', 'ux', 'bootstrap', 'tailwind', 'sass', 'responsive', 'web design', 'dom', 'jquery', 'next.js', 'nextjs', 'svelte', 'web development'],
  backend: ['node', 'nodejs', 'node.js', 'express', 'django', 'flask', 'spring', 'backend', 'back-end', 'api', 'rest', 'graphql', 'fastapi', 'laravel', 'php', 'ruby', 'rails', 'server', 'microservices'],
  database: ['sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'database', 'db', 'redis', 'firebase', 'supabase', 'database design', 'nosql', 'sqlite', 'oracle'],
  data_science: ['python', 'machine learning', 'ml', 'data science', 'data', 'analytics', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'ai', 'artificial intelligence', 'deep learning', 'nlp', 'statistics', 'visualization', 'tableau', 'power bi', 'r programming', 'jupyter', 'matplotlib'],
  mobile: ['android', 'ios', 'flutter', 'react native', 'mobile', 'swift', 'kotlin', 'dart', 'app development', 'xamarin', 'ionic'],
  devops: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'ci/cd', 'jenkins', 'terraform', 'linux', 'git', 'github', 'devops', 'nginx', 'deployment', 'ansible'],
  security: ['cybersecurity', 'security', 'ethical hacking', 'penetration testing', 'network security', 'cryptography', 'firewall', 'vulnerability', 'owasp'],
};

const GREETINGS = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'sup', 'hola', 'namaste'];
const HELP_KEYWORDS = ['help', 'what can you do', 'how does this work', 'options', 'features'];
const THANKS = ['thank', 'thanks', 'thx', 'ty', 'appreciate'];

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.\/#]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

function matchCategory(keywords) {
  const scores = {};
  for (const [cat, terms] of Object.entries(COURSE_KEYWORDS)) {
    scores[cat] = 0;
    for (const kw of keywords) {
      for (const term of terms) {
        if (kw === term || term.includes(kw) || kw.includes(term)) {
          scores[cat] += 2;
        } else if (kw.length >= 3 && term.includes(kw)) {
          scores[cat] += 1;
        }
      }
    }
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] === 0) return null;
  return sorted[0][0];
}

const CATEGORY_LABELS = {
  frontend: 'Frontend Development',
  backend: 'Backend Development',
  database: 'Databases',
  data_science: 'Data Science & AI',
  mobile: 'Mobile Development',
  devops: 'DevOps & Cloud',
  security: 'Cybersecurity',
};

function generateGreeting() {
  const responses = [
    "Hello! Welcome to **CourseBot**! 🎓\n\nI can recommend courses based on your interests. Try asking me about:\n\n- **Frontend** - React, HTML/CSS, JavaScript\n- **Backend** - Node.js, Python, APIs\n- **Data Science** - Machine Learning, Python\n- **Database** - SQL, MongoDB\n- **Mobile** - Flutter, React Native\n- **DevOps** - Docker, AWS, Cloud\n\nWhat are you interested in learning?",
    "Hey there! 👋\n\nI'm your course recommendation assistant. Tell me what topic or technology you're interested in, and I'll suggest the best courses for you!\n\nFor example, try: *\"I want to learn React\"* or *\"Recommend a Python course\"*",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateHelpResponse() {
  return "**Here's what I can do:**\n\n🎓 **Recommend courses** - Tell me what you want to learn (e.g., \"React\", \"Python\", \"SQL\")\n\n📚 **Browse by category** - Ask about Frontend, Backend, Data Science, Mobile, DevOps, Databases, or Security\n\n💡 **Career guidance** - Ask me things like \"What should I learn for web development?\"\n\nJust type your question and I'll do my best to help!";
}

function generateThanksResponse() {
  const responses = [
    "You're welcome! Feel free to ask if you have more questions about courses. Happy learning! 📚",
    "Happy to help! Don't hesitate to ask about any other topics. Good luck with your learning journey! 🚀",
    "Glad I could help! Let me know if you need more recommendations. 🎓",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function formatCourseList(courses) {
  if (courses.length === 0) return null;
  let msg = `Here are the courses I found:\n\n`;
  courses.forEach((c, i) => {
    msg += `**${i + 1}. ${c.name}**\n`;
    msg += `   Category: *${c.category}*\n`;
    msg += `   ${c.description}\n\n`;
  });
  return msg;
}

function generateNoMatchResponse(keywords) {
  return `I couldn't find a specific match for "${keywords.join(' ')}", but here are some areas I can help with:\n\n- **Frontend Development** - React, Vue, HTML/CSS\n- **Backend Development** - Node.js, Python, APIs\n- **Data Science & AI** - Machine Learning, Python\n- **Databases** - SQL, MongoDB\n- **Mobile Development** - Flutter, React Native\n- **DevOps & Cloud** - Docker, AWS\n\nTry asking about any of these topics!`;
}

async function handleQuery(event) {
  const corsResult = handleCors(event);
  if (corsResult) return corsResult;

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return corsResponse(400, { error: 'Invalid JSON body' });
  }

  const { question, student } = body;
  if (!question || !question.trim()) {
    return corsResponse(400, { error: 'Question is required' });
  }

  const supabase = getSupabase();
  const q = question.trim().toLowerCase().trim();
  let answer = '';
  let matchedCourses = [];

  // Check for greetings
  if (GREETINGS.some(g => q.startsWith(g) || q === g)) {
    answer = generateGreeting();
  }
  // Check for help
  else if (HELP_KEYWORDS.some(k => q.includes(k))) {
    answer = generateHelpResponse();
  }
  // Check for thanks
  else if (THANKS.some(t => q.includes(t))) {
    answer = generateThanksResponse();
  }
  // Course recommendation logic
  else {
    const keywords = extractKeywords(q);
    const category = matchCategory(keywords);

    if (category) {
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .ilike('category', `%${category}%`)
        .limit(5);

      if (courses && courses.length > 0) {
        matchedCourses = courses;
        const catLabel = CATEGORY_LABELS[category] || category;
        answer = `Great choice! Here are my top recommendations for **${catLabel}**:\n\n`;
        answer += formatCourseList(courses);
        answer += `\nWould you like more details about any specific course?`;
      } else {
        const { data: allCourses } = await supabase
          .from('courses')
          .select('*')
          .limit(5);

        if (allCourses && allCourses.length > 0) {
          answer = `I don't have specific courses for that category yet, but here are some popular courses:\n\n`;
          answer += formatCourseList(allCourses);
        } else {
          answer = `I'd love to recommend courses for **${catLabel}**, but our course catalog is being updated. Check back soon!`;
        }
      }
    } else {
      // Try keyword search in course names/descriptions
      let searchQuery = keywords.join(' | ');
      const { data: searchCourses } = await supabase
        .from('courses')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5);

      if (searchCourses && searchCourses.length > 0) {
        matchedCourses = searchCourses;
        answer = `I found some courses that might interest you:\n\n`;
        answer += formatCourseList(searchCourses);
        answer += `\nWould you like to know more about any of these?`;
      } else {
        answer = generateNoMatchResponse(keywords);
      }
    }
  }

  // Log the query to Supabase
  try {
    await supabase.from('queries').insert({
      student: student || 'Anonymous',
      question: question,
      answer: answer.replace(/\n/g, ' ').substring(0, 500),
    });
  } catch (e) {
    console.error('Failed to log query:', e);
  }

  return corsResponse(200, {
    answer,
    courses: matchedCourses,
  });
}

module.exports = { handleQuery };
