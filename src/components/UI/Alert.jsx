import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faCheckCircle,
  faInfoCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

// * Multi-variant feedback alert component supporting inline, toast, and modal displays with Dark Mode & RTL support
const Alert = ({
  type = 'error', // ? Severity type enum: 'error' | 'success' | 'info'
  variant = 'inline', // ? Display format enum: 'inline' | 'toast'
  message,
  onClose,
}) => {
  // ! Return early if no active message payload exists
  if (!message) return null;

  // ? Color themes and FontAwesome icon configurations mapped by status type with Dark Mode variants
  const config = {
    error: {
      style:
        'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300',
      icon: faExclamationCircle,
    },
    success: {
      style:
        'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/60 text-green-800 dark:text-green-300',
      icon: faCheckCircle,
    },
    info: {
      style:
        'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300',
      icon: faInfoCircle,
    },
  };

  const currentConfig = config[type] || config.error;

  // * Core notification message block with icon and dismiss action
  const content = (
    <div
      className={`p-3 border rounded-lg text-sm flex items-center justify-between gap-3 shadow-sm transition-colors duration-200 ${currentConfig.style}`}
    >
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={currentConfig.icon} className="text-base shrink-0" />
        <span>{message}</span>
      </div>

      {/* ? Optional dismiss handler trigger */}
      {onClose && (
        <button
          onClick={onClose}
          className="hover:opacity-75 transition-opacity focus:outline-none p-1"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );

  // * 1. Toast Notification Display (Bottom-End Fixed Positioning with Logical Properties)
  if (variant === 'toast') {
    return (
      <div className="fixed bottom-4 end-4 z-50 max-w-sm w-full animate-bounce-once">{content}</div>
    );
  }

  // * 2. Default Inline Layout Integration
  return content;
};

export default Alert;
