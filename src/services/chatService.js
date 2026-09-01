const chatApiUrl = (process.env.REACT_APP_CHAT_API_URL || '').replace(/\/$/, '');

const sensitivePatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\+?\d[\s().-]*){8,}\d/,
  /(?:\d[ -]?){13,19}/,
  /\b(?:password|passcode|api[ _-]?key|access[ _-]?token|auth(?:entication)?[ _-]?token|card(?: number)?|cvv|cvc)\b\s*[:=]?\s*\S+/i,
  /(?:كلمة\s*المرور|رمز\s*المرور|مفتاح\s*api|رمز\s*الوصول|رقم\s*البطاقة|رقم\s*الهاتف)\s*[:=]?\s*\S+/i,
  /\b(?:my|full)\s+(?:home\s+)?address\s+(?:is|:)/i,
  /(?:عنواني|العنوان\s*الكامل)\s*(?:هو|:)/i,
  /\b(?:my\s+)?(?:full\s+)?order\s+(?:contents?|details?|items?)\s*(?:are|is|:)/i,
  /(?:محتويات|تفاصيل)\s+الطلب\s+(?:كاملة|هي|:)/i,
];

export class ChatServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export const containsSensitiveChatData = (value) =>
  typeof value === 'string' && sensitivePatterns.some((pattern) => pattern.test(value));

const parseResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ChatServiceError(
      data?.error?.code || 'NETWORK_ERROR',
      data?.error?.message || 'Unable to send your message. Please try again.'
    );
  }

  if (typeof data?.reply !== 'string' || !data.reply.trim()) {
    throw new ChatServiceError(
      'UPSTREAM_UNAVAILABLE',
      'The AI service returned an empty response.'
    );
  }

  return data;
};

export const getChatHealth = async () => {
  try {
    const response = await fetch(`${chatApiUrl}/api/health`);
    const data = await response.json();
    return response.ok && data?.status === 'ok' ? data : null;
  } catch (error) {
    return null;
  }
};

export const sendChatMessage = async ({ message, history, context }) => {
  try {
    const response = await fetch(`${chatApiUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, context }),
    });
    return await parseResponse(response);
  } catch (error) {
    if (error instanceof ChatServiceError) {
      throw error;
    }

    throw new ChatServiceError(
      'NETWORK_ERROR',
      'Unable to reach the chat service. Please try again.'
    );
  }
};
