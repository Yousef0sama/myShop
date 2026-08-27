import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// * Reusable UI button component supporting custom variants, icons, sizing, and loading states with Dark Mode support
const Button = ({
  children,
  type = 'button',
  variant = 'primary', // ? Variant enum: 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md', // ? Sizing options: 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon = null, // ? FontAwesome icon object reference
  onClick,
  className = '',
  ...props
}) => {
  // * Base utility classes for layout alignment, focus indicators, gap spacing, and disabled states
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // ? Theme variant style mapping using Tailwind CSS Dark Mode utilities
  const variants = {
    primary: 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border border-blue-300 dark:border-blue-500 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 focus:ring-blue-500',
    danger: 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500',
  };

  // ? Component dimension presets
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        // * Render animated FontAwesome spinner during pending asynchronous operations
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4" />
          Loading...
        </span>
      ) : (
        // * Render optional icon alongside button children content
        <>
          {icon && <FontAwesomeIcon icon={icon} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;