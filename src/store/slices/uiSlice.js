import { createSlice } from '@reduxjs/toolkit';
import i18n from '../../i18n/config';

// * Safe initial getters to prevent SSR/Test environment crashes
const getInitialLang = () => {
  if (typeof window === 'undefined') return 'ar';
  return localStorage.getItem('app_lang') || 'ar';
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('app_theme') || 'light';
};

const initialLang = getInitialLang();
const initialTheme = getInitialTheme();

// ? Synchronize document attributes safely
if (typeof document !== 'undefined') {
  document.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = initialLang;
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// * Helper function to handle DOM and i18n side effects
const applyLanguageChanges = (nextLang) => {
  localStorage.setItem('app_lang', nextLang);
  if (typeof document !== 'undefined') {
    document.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  }
  i18n.changeLanguage(nextLang);
};

const applyThemeChanges = (isDark) => {
  const theme = isDark ? 'dark' : 'light';
  localStorage.setItem('app_theme', theme);
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    language: initialLang,
    darkMode: initialTheme === 'dark',
  },
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      applyLanguageChanges(action.payload);
    },
    toggleLanguage: (state) => {
      const nextLang = state.language === 'ar' ? 'en' : 'ar';
      state.language = nextLang;
      applyLanguageChanges(nextLang);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      applyThemeChanges(action.payload);
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      applyThemeChanges(state.darkMode);
    },
  },
});

export const { setLanguage, toggleLanguage, setDarkMode, toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer;
