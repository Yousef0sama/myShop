import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// * Reusable form input component with icon positioning tied strictly to the input's text direction
const Input = ({
  label,
  type = 'text',
  name,
  value = '',
  onChange,
  placeholder,
  error,
  icon = null, // ? FontAwesome icon object reference
  required = false,
  dir = null, // ? Dynamic direction override: 'ltr' | 'rtl' | null
  className = '',
  ...props
}) => {
  // ? Local state managing password field visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';

  // * Dynamic input type determination based on visibility state
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  // ! Helper function to detect text direction based on first typed character
  const detectDirection = (text) => {
    if (!text || typeof text !== 'string') return 'auto';

    const trimmed = text.trim();
    if (!trimmed) return 'auto';

    const firstChar = trimmed.charAt(0);
    // ? Regex checking for Arabic unicode ranges
    const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      firstChar
    );

    return isArabic ? 'rtl' : 'ltr';
  };

  // * Determine input direction
  const isTechnicalField = ['email', 'password', 'url', 'tel'].includes(type);
  const computedDirection = dir || (isTechnicalField ? 'ltr' : detectDirection(value));

  // * Text alignment and padding logic strictly mapped via logical properties
  const textAlignClass =
    computedDirection === 'rtl'
      ? 'text-right'
      : computedDirection === 'ltr'
        ? 'text-left'
        : 'text-start';
  const leadingPadding = icon ? 'ps-10' : 'ps-3';
  const trailingPadding = isPasswordType ? 'pe-10' : 'pe-3';

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* * Field Label rendering */}
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* ! Parent wrapper tied strictly to the calculated input direction */}
      <div className="relative flex items-center" dir={computedDirection}>
        {/* ? Leading icon aligned to start of input direction */}
        {icon && (
          <div className="absolute start-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center justify-center">
            <FontAwesomeIcon icon={icon} />
          </div>
        )}

        {/* * Standard HTML Input Element */}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          dir={computedDirection}
          className={`w-full py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${textAlignClass} ${leadingPadding} ${trailingPadding} ${
            error
              ? 'border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-900/50'
          } ${className}`}
          {...props}
        />

        {/* ? Password toggle button aligned to end of input direction */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute end-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none flex items-center justify-center"
            tabIndex={-1}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        )}
      </div>

      {/* ! Validation error feedback message */}
      {error && <span className="text-xs text-red-500 dark:text-red-400 mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
