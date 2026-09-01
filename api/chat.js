const { createSystemPrompt, toPlainText, validateChatPayload } = require('./_chatUtils');

const maxOutputTokens = 350;
const rateLimitWindowMs = 60 * 1000;
const maxRequestsPerWindow = 20;
const requestCounts = new Map();

const sendError = (res, status, code, message) =>
  res.status(status).json({ error: { code, message } });

const isRateLimited = (req) => {
  const key = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'anonymous';
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now - entry.startedAt >= rateLimitWindowMs) {
    requestCounts.set(key, { startedAt: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > maxRequestsPerWindow;
};

const handler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Only POST requests are supported.');
  }

  if (isRateLimited(req)) {
    return sendError(
      res,
      429,
      'RATE_LIMITED',
      'Too many chat requests. Please wait a moment and try again.'
    );
  }

  const validation = validateChatPayload(req.body);
  if (validation.sensitive) {
    return sendError(
      res,
      400,
      'SENSITIVE_DATA',
      'For your privacy, please remove personal or payment information before sending a message.'
    );
  }
  if (validation.error) {
    return sendError(res, 400, 'INVALID_REQUEST', validation.error);
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return sendError(
      res,
      503,
      'MISSING_API_KEY',
      'Chat is not configured. Add OPENROUTER_API_KEY to the Vercel project environment variables.'
    );
  }

  const { message, history, context } = validation.value;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'MyShop AI Assistant',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: createSystemPrompt(context) },
          ...history,
          { role: 'user', content: message },
        ],
        max_tokens: maxOutputTokens,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return sendError(
          res,
          429,
          'RATE_LIMITED',
          'The free model is busy or rate-limited. Please try again shortly.'
        );
      }

      if ([404, 503].includes(response.status)) {
        return sendError(
          res,
          503,
          'MODEL_UNAVAILABLE',
          'A free model is unavailable right now. Please try again shortly.'
        );
      }

      return sendError(
        res,
        502,
        'UPSTREAM_UNAVAILABLE',
        'The AI service could not process the request. Please try again.'
      );
    }

    const data = await response.json();
    const reply = toPlainText(data?.choices?.[0]?.message?.content || '');

    if (!reply) {
      return sendError(
        res,
        502,
        'UPSTREAM_UNAVAILABLE',
        'The AI service returned an empty response. Please try again.'
      );
    }

    return res.status(200).json({ reply });
  } catch (error) {
    return sendError(
      res,
      503,
      'NETWORK_ERROR',
      'Unable to reach the AI service. Check your connection and try again.'
    );
  }
};

module.exports = handler;
