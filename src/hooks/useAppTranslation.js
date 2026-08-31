import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLanguage, setLanguage } from '../store/slices/uiSlice';

/**
 * Custom Hook for accessing translations and managing application locale/direction via Redux
 * @param {string|string[]} ns - Target namespace or array of namespaces (e.g., 'common', 'auth', 'profile')
 */
export const useAppTranslation = (ns = 'common') => {
  const { t } = useTranslation(ns);
  const dispatch = useDispatch();
  const currentLanguage = useSelector((state) => state.ui.language);

  // * Toggle between Arabic and English across Redux state and i18n
  const handleToggleLanguage = () => {
    dispatch(toggleLanguage());
  };

  // * Set specific language explicitly ('ar' | 'en')
  const handleSetLanguage = (lang) => {
    dispatch(setLanguage(lang));
  };

  return {
    t,
    currentLanguage,
    isRTL: currentLanguage === 'ar',
    toggleLanguage: handleToggleLanguage,
    setLanguage: handleSetLanguage,
  };
};

export default useAppTranslation;
