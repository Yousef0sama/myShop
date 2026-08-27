import React from 'react';

// * Dynamic slide toggle component supporting labels, custom icons, Dark Mode, and LTR/RTL layout compatibility
const SlideButton = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  onContent = null, // ? Dynamic payload rendered in active state
  offContent = null, // ? Dynamic payload rendered in inactive state
  className = '',
  ...props
}) => {
  // ? Flag determining layout sizing and inner text/icon rendering rules
  const hasInnerContent = onContent !== null || offContent !== null;

  return (
    <label
      className={`inline-flex items-center cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative flex items-center">
        {/* * Hidden native accessibility checkbox input element */}
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />

        {/* * Track container with dynamic sizing and state-based focus/background transitions */}
        <div
          className={`relative rounded-full transition-colors duration-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 bg-gray-300 dark:bg-gray-700 ${
            hasInnerContent ? 'w-14 h-7' : 'w-11 h-6'
          }`}
        >
          {/* ? Optional internal content overlay with conditional opacity visibility */}
          {hasInnerContent && (
            <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-bold select-none pointer-events-none">
              <span
                className={`transition-opacity duration-200 flex items-center gap-1 ${
                  checked ? 'text-white opacity-100' : 'opacity-0'
                }`}
              >
                {onContent}
              </span>
              <span
                className={`transition-opacity duration-200 flex items-center gap-1 ${
                  !checked ? 'text-gray-600 dark:text-gray-300 opacity-100' : 'opacity-0'
                }`}
              >
                {offContent}
              </span>
            </div>
          )}

          {/* * Sliding Thumb knob with RTL-safe CSS start positioning offsets */}
          <div
            className={`absolute bg-white dark:bg-gray-200 rounded-full transition-all duration-200 shadow-md flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-800 ${
              hasInnerContent
                ? `top-[3px] h-5 w-5 ${checked ? 'start-[calc(100%-23px)]' : 'start-[3px]'}`
                : `top-[2px] h-5 w-5 ${checked ? 'start-[calc(100%-22px)]' : 'start-[2px]'}`
            }`}
          ></div>
        </div>
      </div>

      {/* ? External descriptive text label container */}
      {label && <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
};

export default SlideButton;