const { getSupabase } = require('./_lib/supabase');
const { requireAuth } = require('./_lib/auth');
const { corsResponse, handleCors } = require('./_lib/cors');

exports.handler = async (event) => {
  const corsResult = handleCors(event);
  if (corsResult) return corsResult;

  if (event.httpMethod !== 'GET') {
    return corsResponse(405, { error: 'Method not allowed' });
  }

  const authError = requireAuth(event);
  if (authError) return authError;

  const supabase = getSupabase();

  try {
    const { data: queries, error } = await supabase
      .from('queries')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    return corsResponse(200, { queries: queries || [] });
  } catch (err) {
    return corsResponse(500, { error: 'Failed to fetch queries', details: err.message });
  }
};
