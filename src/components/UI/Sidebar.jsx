import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

// * Fully Responsive Full-Height Sidebar
const Sidebar = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <aside className={`w-full md:w-64 shrink-0 flex flex-col ${className}`}>
      {/* * Mobile Header Trigger Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#0b1329] border border-gray-200 dark:border-gray-800 rounded-xl mb-3 shadow-sm">
        <div>
          {title && <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>}
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-lg" />
        </button>
      </div>

      {/* * Full-Height Navigation Container */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:flex flex-col flex-1 h-full bg-white dark:bg-[#0b1329] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-4`}
      >
        {/* * Desktop Header Block */}
        {(title || subtitle) && (
          <div className="hidden md:block pb-3 px-2 border-b border-gray-100 dark:border-gray-800">
            {title && (
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* * Main Navigation Items container */}
        <nav className="space-y-1.5 flex flex-col flex-1" onClick={() => setIsOpen(false)}>
          {children}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;