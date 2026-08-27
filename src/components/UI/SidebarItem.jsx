import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// * Reusable individual navigation item for Sidebar layout
const SidebarItem = ({
  id,
  label,
  icon,
  badge = null,
  isActive = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className={`text-base transition-colors ${
              isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'
            }`}
          />
        )}
        <span className="truncate">{label}</span>
      </div>

      {/* ? Optional badge tag (e.g., counters or status indicators) */}
      {badge !== null && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default SidebarItem;