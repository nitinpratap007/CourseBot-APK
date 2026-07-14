const { createToken, checkPassword } = require('./_lib/auth');
const { corsResponse, handleCors } = require('./_lib/cors');

exports.handler = async (event) => {
  const corsResult = handleCors(event);
  if (corsResult) return corsResult;

  if (event.httpMethod !== 'POST') {
    return corsResponse(405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return corsResponse(400, { error: 'Invalid JSON body' });
  }

  const { password } = body;
  if (!password) {
    return corsResponse(400, { error: 'Password is required' });
  }

  if (!checkPassword(password)) {
    return corsResponse(401, { error: 'Invalid password' });
  }

  const token = createToken();
  return corsResponse(200, { token });
};
