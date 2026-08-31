import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  faUser,
  faEnvelope,
  faLock,
  faPhone,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';

import { registerUser, clearError } from '../../store/slices/authSlice';
import useAppTranslation from '../../hooks/useAppTranslation';

import Card from '../../components/UI/Card';
import Alert from '../../components/UI/Alert';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Button from '../../components/UI/Button';

export default function Register() {
  const { t } = useAppTranslation('auth');
  const { t: tNav } = useAppTranslation('common');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';

  // * Unified form state structure
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // ? Clear authentication errors on component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // * Update form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // * Handle full registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ? Trigger register thunk with form payload & translation errors dictionary
    const resultAction = await dispatch(
      registerUser({
        userData: formData,
        tErrors: t('errors', { returnObjects: true }),
      })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  // * Options array for Role select dropdown
  const roleOptions = [
    { value: 'customer', label: t('roles.customer') },
    { value: 'seller', label: t('roles.seller') },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* ! Toast alert for handling API/Validation errors */}
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
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {t('registerTitle')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('authed.text')}{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {tNav('login')}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* * User Full Name Input */}
            <Input
              label={t('labels.name')}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('placeholders.name')}
              icon={faUser}
              required
            />

            {/* * User Email Input */}
            <Input
              label={t('labels.email')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('placeholders.email')}
              icon={faEnvelope}
              required
            />

            {/* * User Role Select Dropdown */}
            <Select
              label={t('labels.role')}
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              icon={faUserShield}
            />

            {/* * User Phone Number Input */}
            <Input
              label={t('labels.phone')}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('placeholders.phone')}
              icon={faPhone}
              required
            />

            {/* * Password Input */}
            <Input
              label={t('labels.password')}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('placeholders.password')}
              icon={faLock}
              required
            />

            {/* * Confirm Password Input */}
            <Input
              label={t('labels.confirmPassword')}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('placeholders.confirmPassword')}
              icon={faLock}
              required
            />

            {/* * Submit Button Component */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="mt-6 w-full"
            >
              {t('submitRegister')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
