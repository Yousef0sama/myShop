import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';

import useAppTranslation from '../../hooks/useAppTranslation';
import {
  ChatServiceError,
  containsSensitiveChatData,
  getChatHealth,
  sendChatMessage,
} from '../../services/chatService';

const sessionStorageKeyPrefix = 'myshop_chat_messages';
const maxMessageLength = 800;
const maxStoredMessages = 50;
const emptyMessages = [];

const createMessage = (role, content) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
});

const getSessionMessages = (storageKey) => {
  if (!storageKey) return [];

  try {
    const savedMessages = JSON.parse(sessionStorage.getItem(storageKey));
    if (!Array.isArray(savedMessages)) return [];

    return savedMessages
      .filter(
        (item) =>
          item &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.content === 'string'
      )
      .slice(-maxStoredMessages);
  } catch (error) {
    return [];
  }
};

export default function Chatbot() {
  const { t, currentLanguage, isRTL } = useAppTranslation('common');
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);
  const chatStorageKey = token && user?.id != null ? `${sessionStorageKeyPrefix}:${user.id}` : null;
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const requestIdRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => getSessionMessages(chatStorageKey));
  const [activeStorageKey, setActiveStorageKey] = useState(chatStorageKey);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState(null);
  const [isConfigured, setIsConfigured] = useState(null);

  const role = token && ['customer', 'seller', 'admin'].includes(user?.role) ? user.role : 'guest';
  const suggestedRole = role === 'guest' ? 'customer' : role;
  const suggestedPrompts = t(`chat.suggestions.${suggestedRole}`, { returnObjects: true });
  const currentMessages = activeStorageKey === chatStorageKey ? messages : emptyMessages;

  useEffect(() => {
    if (activeStorageKey === chatStorageKey) return;

    requestIdRef.current += 1;
    setMessages(getSessionMessages(chatStorageKey));
    setActiveStorageKey(chatStorageKey);
    setInput('');
    setIsLoading(false);
    setErrorCode(null);
  }, [activeStorageKey, chatStorageKey]);

  useEffect(() => {
    if (!chatStorageKey || activeStorageKey !== chatStorageKey) return;

    try {
      sessionStorage.setItem(chatStorageKey, JSON.stringify(messages.slice(-maxStoredMessages)));
    } catch (error) {
      // Session storage is optional; an in-memory conversation still works.
    }
  }, [activeStorageKey, chatStorageKey, messages]);

  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, isLoading, currentMessages]);

  const refreshHealth = async () => {
    const health = await getChatHealth();
    setIsConfigured(health?.configured ?? null);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setErrorCode(null);
    refreshHealth();
  };

  const getErrorMessage = (code) => {
    const errorKey = `chat.errors.${code || 'NETWORK_ERROR'}`;
    const translated = t(errorKey);
    return translated === errorKey ? t('chat.errors.NETWORK_ERROR') : translated;
  };

  const submitMessage = async (messageText = input) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) return;

    if (trimmedMessage.length > maxMessageLength) {
      setErrorCode('MESSAGE_TOO_LONG');
      return;
    }

    if (containsSensitiveChatData(trimmedMessage)) {
      setErrorCode('SENSITIVE_DATA');
      return;
    }

    setErrorCode(null);
    const userMessage = createMessage('user', trimmedMessage);
    const recentHistory = currentMessages.slice(-8).map(({ role: messageRole, content }) => ({
      role: messageRole,
      content,
    }));
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setMessages((previousMessages) => [...previousMessages, userMessage].slice(-maxStoredMessages));
    setInput('');
    setIsLoading(true);

    try {
      const { reply } = await sendChatMessage({
        message: trimmedMessage,
        history: recentHistory,
        context: { language: currentLanguage, role, route: location.pathname },
      });
      if (requestId !== requestIdRef.current) return;
      setMessages((previousMessages) => [...previousMessages, createMessage('assistant', reply)]);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const code = error instanceof ChatServiceError ? error.code : 'NETWORK_ERROR';
      setErrorCode(code);
      if (code === 'MISSING_API_KEY') setIsConfigured(false);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitMessage();
  };

  const clearChat = () => {
    requestIdRef.current += 1;
    setMessages([]);
    setIsLoading(false);
    setErrorCode(null);
    try {
      if (chatStorageKey) sessionStorage.removeItem(chatStorageKey);
    } catch (error) {
      // The in-memory transcript was already cleared.
    }
  };

  return (
    <div className="fixed bottom-5 end-5 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {isOpen && (
        <section
          aria-labelledby="chatbot-title"
          className="absolute bottom-16 end-0 flex h-[min(38rem,calc(100vh-6.5rem))] w-[calc(100vw-2.5rem)] max-w-[26rem] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          role="dialog"
        >
          <header className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faRobot} aria-hidden="true" />
              <h2 id="chatbot-title" className="font-semibold">
                {t('chat.title')}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="rounded p-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={t('chat.clearChat')}
                title={t('chat.clearChat')}
              >
                <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={t('chat.close')}
              >
                <FontAwesomeIcon icon={faTimes} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900/50">
            {currentMessages.length === 0 && (
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                {t('chat.welcome')}
              </p>
            )}

            {currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {isLoading && (
              <div
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
                aria-live="polite"
              >
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                {t('chat.thinking')}
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            {isConfigured === false && (
              <p className="mb-3 rounded-lg bg-amber-50 p-2 text-xs leading-5 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                {t('chat.missingKey')}
              </p>
            )}

            {errorCode && (
              <p
                className="mb-3 rounded-lg bg-red-50 p-2 text-xs leading-5 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                role="alert"
              >
                {getErrorMessage(errorCode)}
              </p>
            )}

            {currentMessages.length === 0 && Array.isArray(suggestedPrompts) && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('chat.suggestedPrompts')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => submitMessage(prompt)}
                      disabled={isLoading || isConfigured === false}
                      className="rounded-full border border-blue-200 px-3 py-1 text-xs text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <label htmlFor="myshop-chat-message" className="sr-only">
                {t('chat.messageLabel')}
              </label>
              <textarea
                ref={inputRef}
                id="myshop-chat-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submitMessage();
                  }
                }}
                maxLength={maxMessageLength}
                rows="2"
                placeholder={t('chat.placeholder')}
                disabled={isLoading || isConfigured === false}
                className="min-h-11 flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isConfigured === false}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label={t('chat.send')}
              >
                <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" />
              </button>
            </form>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('chat.privacyNotice')}
            </p>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label={isOpen ? t('chat.close') : t('chat.open')}
        aria-expanded={isOpen}
        aria-controls="chatbot-title"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faRobot} className="text-xl" aria-hidden="true" />
      </button>
    </div>
  );
}
