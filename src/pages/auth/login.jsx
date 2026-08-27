import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { faEnvelope, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

import { loginUser, clearError } from '../../store/slices/authSlice';
import useAppTranslation from '../../hooks/useAppTranslation';

import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';

export default function Login() {
  const { t } = useAppTranslation('auth');
  const { t: tNav } = useAppTranslation('common');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ? Local form state for user credentials
  const [formData, setFormData] = useState({ email: '', password: '' });

  // ? Extract Global Auth state from Redux store
  const { status, error } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';

  // * Clear previous authentication errors on component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // * Update local form state on input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // * Handle form submission and dispatch login thunk
  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultAction = await dispatch(loginUser(formData));

    // ? Redirect to home page upon successful authentication
    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* ! Toast notification for authentication errors */}
      {error && (
        <Alert
          type="error"
          variant="toast"
          message={error}
          onClose={() => dispatch(clearError())}
        />
      )}

      <div className="max-w-md w-full">
        <Card variant="elevated" padding="large">
          {/* * Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {t('loginTitle')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('notAuthed.text')}{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {tNav('register')}
              </Link>
            </p>
          </div>

          {/* * Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* ? Email Input */}
              <Input
                label={t('labels.email')}
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('placeholders.email')}
                icon={faEnvelope}
              />

              {/* ? Password Input */}
              <Input
                label={t('labels.password')}
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={t('placeholders.password')}
                icon={faLock}
              />
            </div>

            {/* * Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              icon={faSignInAlt}
              className="mt-6 w-full"
            >
              {t('submitLogin')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}