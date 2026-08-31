import React from 'react';

// * Configurable card container component supporting visual variants, padding density, headers, and footers with Dark Mode support
const Card = ({
  title,
  subtitle,
  children,
  footer,
  variant = 'default', // ? Styling mode enum: 'default' | 'bordered' | 'flat' | 'elevated'
  padding = 'normal', // ? Density preset enum: 'none' | 'small' | 'normal' | 'large'
  className = '',
  onClick, // ? Optional click handler activating hover transition styles
  ...props
}) => {
  // ? Visual variant style configuration map with Dark Mode classes
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    bordered: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-none',
    flat: 'bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-none',
    elevated: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg',
  };

  // ? Responsive padding density options map
  const paddingStyles = {
    none: 'p-0',
    small: 'p-3 sm:p-4',
    normal: 'p-5 sm:p-6',
    large: 'p-6 sm:p-8',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-200 ${variantStyles[variant] || variantStyles.default} ${
        onClick
          ? 'cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500'
          : ''
      } ${className}`}
      {...props}
    >
      {/* ? Optional custom structured title/subtitle header container */}
      {title && (
        <header
          className={`border-b border-gray-100 dark:border-gray-700 ${paddingStyles[padding]}`}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </header>
      )}

      {/* * Primary body content container with configured padding density */}
      <div className={paddingStyles[padding]}>{children}</div>

      {/* ? Optional card footer action container with subtle backdrop tint */}
      {footer && (
        <footer
          className={`bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl ${paddingStyles[padding]}`}
        >
          {footer}
        </footer>
      )}
    </div>
  );
};

export default Card;
