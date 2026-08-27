import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingBag,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faBars,
  faTimes,
  faShoppingCart,
  faHeart,
  faCog,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons';

import { logout } from '../../store/slices/authSlice';
import { toggleDarkMode, toggleLanguage } from '../../store/slices/uiSlice';
import useAppTranslation from '../../hooks/useAppTranslation';
import SlideButton from '../UI/SlideButton';

export default function Navbar() {
  const { t, currentLanguage } = useAppTranslation('common');

  // ? Local UI state for visibility toggles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ? DOM reference used to detect clicks outside the settings dropdown container
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ? Extract UI settings, auth state, and cart items from Redux store
  const darkMode = useSelector((state) => state.ui.darkMode);
  const { token, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart?.items || []);

  // * Calculate total aggregate item quantity stored in cart
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  // * Role-based checks (admin, seller, customer)
  const userRole = user?.role;
  const isAdmin = userRole === 'admin';
  const isSeller = userRole === 'seller';
  const isCustomer = userRole === 'customer';

  // ! Dispatches auth logout action, closes active dropdowns, and redirects user to login view
  const handleLogout = () => {
    dispatch(logout());
    setIsSettingsOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  // * Event listener effect to close settings dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* * Brand logo icon and main desktop navigation links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
              <FontAwesomeIcon icon={faShoppingBag} className="text-2xl" />
              <span>{t('brand')}</span>
            </Link>

            {/* Desktop Navigation Links based on Roles */}
            <div className="hidden md:flex items-center gap-6">
              {isAdmin && (
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  {t('dashboard')}
                </Link>
              )}
              
              {isCustomer && (
                <>
                  <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                    {t('products')}
                  </Link>
                  <Link to="/wishlist" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                    {t('wishList')}
                  </Link>
                </>
              )}

              {isSeller && (
                <>
                  <Link to="/inventory" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                    {t('inventory')}
                  </Link>
                  <Link to="/earnings" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                    {t('earnings')}
                  </Link>
                </>
              )}

              {(isCustomer || isSeller) && (
                <Link to="/orders" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  {t('orders')}
                </Link>
              )}
            </div>
          </div>

          {/* * Desktop action controls */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* ? Wishlist & Cart icons (Rendered only for Customers) */}
            {isCustomer && (
              <>
                <Link to="/wishlist" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 transition-colors" title={t('wishList')}>
                  <FontAwesomeIcon icon={faHeart} className="text-xl" />
                </Link>
                <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 transition-colors">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* * Settings trigger and dropdown menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                title={t('settings')}
              >
                <FontAwesomeIcon icon={faCog} className={`text-xl transition-transform duration-300 ${isSettingsOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* ? Animated settings dropdown floating menu */}
              {isSettingsOpen && (
                <div className="absolute end-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-3 px-4 z-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* Preferences section for Dark Mode and Language toggles */}
                  <div className="space-y-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('settings')}</p>
                    
                    {/* Dark mode switch */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{t('darkMode')}</span>
                      <SlideButton
                        checked={darkMode}
                        onChange={() => dispatch(toggleDarkMode())}
                        onContent={<FontAwesomeIcon icon={faSun} className="text-amber-400" />}
                        offContent={<FontAwesomeIcon icon={faMoon} className="text-slate-500" />}
                      />
                    </div>

                    {/* Language switch */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{t('language')}</span>
                      <SlideButton
                        checked={currentLanguage === 'ar'}
                        onChange={() => dispatch(toggleLanguage())}
                        onContent={t('arLang')}
                        offContent={t('enLang')}
                      />
                    </div>
                  </div>

                  {/* Auth links inside desktop dropdown */}
                  <div className="space-y-2 pt-1">
                    {token ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setIsSettingsOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faUser} />
                          <span>{user?.name || t('myAccount')}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faSignOutAlt} />
                          <span>{t('logout')}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsSettingsOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faSignInAlt} />
                          <span>{t('login')}</span>
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsSettingsOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faUserPlus} />
                          <span>{t('register')}</span>
                        </Link>
                      </>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* ? Mobile control bar */}
          <div className="md:hidden flex items-center gap-2">
            {isCustomer && (
              <>
                <Link to="/wishlist" className="text-gray-600 dark:text-gray-300 p-2">
                  <FontAwesomeIcon icon={faHeart} className="text-lg" />
                </Link>
                <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 p-2">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-lg" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 focus:outline-none p-2"
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-xl" />
            </button>
          </div>

        </div>
      </div>

      {/* * Collapsible drawer menu for mobile view */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-3 pb-5 space-y-4">
          
          {/* Mobile Navigation Links based on Roles */}
          {isAdmin && (
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium"
            >
              {t('dashboard')}
            </Link>
          )}

          {isCustomer && (
            <>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium"
              >
                {t('products')}
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium"
              >
                {t('wishList')}
              </Link>
            </>
          )}

          {isSeller && (
            <>
              <Link
                to="/inventory"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium"
              >
                {t('inventory')}
              </Link>
              <Link
                to="/earnings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium"
              >
                {t('earnings')}
              </Link>
            </>
          )}

          {(isCustomer || isSeller) && (
            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium"
            >
              {t('orders')}
            </Link>
          )}
          
          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Mobile preferences switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{t('darkMode')}</span>
              <SlideButton
                checked={darkMode}
                onChange={() => dispatch(toggleDarkMode())}
                onContent={<FontAwesomeIcon icon={faSun} className="text-amber-400" />}
                offContent={<FontAwesomeIcon icon={faMoon} className="text-slate-500" />}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{t('language')}</span>
              <SlideButton
                checked={currentLanguage === 'ar'}
                onChange={() => dispatch(toggleLanguage())}
                onContent={t('arLang')}
                offContent={t('enLang')}
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Mobile auth action buttons */}
          {token ? (
            <div className="space-y-2">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium"
              >
                {t('myAccount')} ({user?.name})
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-start text-red-600 font-medium flex items-center gap-2 pt-1"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 py-2 rounded-lg font-medium"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-white bg-blue-600 py-2 rounded-lg font-medium"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}