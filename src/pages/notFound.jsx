import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import useAppTranslation from '../hooks/useAppTranslation';

export default function NotFound() {
  const { t } = useAppTranslation('common');

  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center my-auto">
      {/* * 404 Badge */}
      <div className="relative mb-4 sm:mb-6 flex flex-col items-center justify-center">
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-extrabold text-gray-200 dark:text-gray-800 tracking-wider select-none">
          404
        </h1>
      </div>

      {/* * Main Heading & Description */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
        {t('notFoundTitle')}
      </h2>

      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-xs sm:max-w-md mb-6 sm:mb-8 leading-relaxed">
        {t('notFoundMessage')}
      </p>

      {/* ? Navigation Button to return home */}
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:translate-y-0"
      >
        <FontAwesomeIcon icon={faHome} className="text-sm" />
        <span>{t('backHome')}</span>
      </Link>
    </div>
  );
}