const maxHistoryMessages = 8;
const maxMessageLength = 800;
const maxHistoryMessageLength = 1600;
const allowedRoles = new Set(['guest', 'customer', 'seller', 'admin']);
const allowedLanguages = new Set(['ar', 'en']);
const allowedMessageRoles = new Set(['user', 'assistant']);

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

const containsSensitiveData = (value) => sensitivePatterns.some((pattern) => pattern.test(value));

const toPlainText = (value) =>
  value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^(\s*)[-*+]\s+/gm, '$1• ')
    .replace(/^(\s*)\d+[.)]\s+/gm, '$1')
    .replace(/(\*\*|__|~~|\*|_)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const validateChatPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'The chat request must be a JSON object.' };
  }

  const { message, history = [], context = {} } = payload;

  if (typeof message !== 'string' || !message.trim()) {
    return { error: 'Please enter a message.' };
  }

  if (message.trim().length > maxMessageLength) {
    return { error: `Messages must be ${maxMessageLength} characters or fewer.` };
  }

  if (!Array.isArray(history) || history.length > maxHistoryMessages) {
    return { error: `Chat history may include at most ${maxHistoryMessages} messages.` };
  }

  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    return { error: 'Chat context must be an object.' };
  }

  const validHistory = history.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      allowedMessageRoles.has(item.role) &&
      typeof item.content === 'string' &&
      item.content.trim() &&
      item.content.length <= maxHistoryMessageLength
  );

  if (!validHistory) {
    return { error: 'Chat history contains an invalid message.' };
  }

  const language = allowedLanguages.has(context.language) ? context.language : 'en';
  const role = allowedRoles.has(context.role) ? context.role : 'guest';
  const route =
    typeof context.route === 'string' && context.route.startsWith('/')
      ? context.route.slice(0, 200)
      : '/';
  const messagesToCheck = [message, ...history.map((item) => item.content)];

  if (messagesToCheck.some(containsSensitiveData)) {
    return { sensitive: true };
  }

  return {
    value: {
      message: message.trim(),
      history: history.map(({ role: messageRole, content }) => ({
        role: messageRole,
        content: content.trim(),
      })),
      context: { language, role, route },
    },
  };
};

const createSystemPrompt = ({ language, role, route }) =>
  `
You are MyShop AI Assistant, an in-app support assistant for a React e-commerce course project.
Help users understand how to use MyShop based only on the supplied role and current page.
Reply in the same language as the user interface: Arabic for Arabic UI, English for English UI.
MyShop has customer, seller, and admin roles.
Customers can browse products, filter, use wishlist/cart, use demo checkout, and view orders.
Sellers can manage only their own inventory, stock, and relevant orders.
Admins can manage users, categories, products, and order statuses.
Payment methods are demo-only; do not claim real payments, delivery tracking, refunds, email notifications, or external integrations.
Never request passwords, API keys, card details, tokens, or personal information.
Do not invent prices, stock, order statuses, policies, or features.
If the question is unrelated to MyShop, politely say that you can help only with MyShop.
Current UI language: ${language === 'ar' ? 'Arabic' : 'English'}.
Current role: ${role}.
Current page: ${route}.
Keep answers concise and practical.
Use plain text only. Do not use Markdown markers, headings, lists, links, backticks, or bold text.
`.trim();

module.exports = { createSystemPrompt, toPlainText, validateChatPayload };
