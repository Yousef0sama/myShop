import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

// * Reusable custom Select supporting flags, FontAwesome icons (for component or options), Dark Mode & Max-Height Scroll
const Select = ({
  label,
  name,
  value,
  onChange,
  options = [], // ? Data structure: [{ value: '1', label: 'Opt', flag: 'url', icon: faUser }]
  placeholder = 'Select an option',
  error,
  icon = null, // ? Default leading icon for the select input itself
  required = false,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ? Find selected option to determine active leading icon or flag
  const selectedOption = options.find((opt) => opt.value === value);

  // ? Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue) => {
    onChange({ target: { name, value: optValue } });
    setIsOpen(false);
  };

  // Helper to render icon/flag inside select or dropdown items
  const renderItemVisual = (itemFlag, itemIcon) => {
    if (itemFlag) {
      return (
        <img
          src={itemFlag}
          alt=""
          className="w-5 h-3.5 object-cover rounded-sm shadow-sm shrink-0"
        />
      );
    }
    if (itemIcon) {
      return (
        <FontAwesomeIcon
          icon={itemIcon}
          className="text-gray-400 dark:text-gray-500 text-sm shrink-0"
        />
      );
    }
    return null;
  };

  const hasLeadingVisual = selectedOption?.flag || selectedOption?.icon || icon;

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={dropdownRef}>
      {/* * Label Rendering */}
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* * Select Trigger Input */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative flex items-center w-full py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${hasLeadingVisual ? 'ps-10' : 'ps-3'} pe-10 ${
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/50'
            : 'border-gray-300 dark:border-gray-600'
        } ${className}`}
      >
        {/* ? Leading Icon/Flag Priority: Option Flag -> Option Icon -> Main Component Icon */}
        {hasLeadingVisual && (
          <div className="absolute start-3 pointer-events-none flex items-center justify-center">
            {renderItemVisual(selectedOption?.flag, selectedOption?.icon || icon)}
          </div>
        )}

        {/* Selected Label or Placeholder */}
        <span className={`block truncate ${!selectedOption ? 'text-gray-400 dark:text-gray-500' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Trailing Chevron */}
        <div className="absolute end-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center justify-center">
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* * Options Dropdown List (Max Height + Scroll) */}
      {isOpen && (
        <ul className="absolute z-50 top-full mt-1 w-full max-h-56 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 text-sm">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                opt.value === value
                  ? 'bg-blue-50 dark:bg-gray-700 font-semibold text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {renderItemVisual(opt.flag, opt.icon)}
              <span className="truncate">{opt.label}</span>
            </li>
          ))}
        </ul>
      )}

      {/* ! Error Feedback Message */}
      {error && <span className="text-xs text-red-500 dark:text-red-400 mt-0.5">{error}</span>}
    </div>
  );
};

export default Select;