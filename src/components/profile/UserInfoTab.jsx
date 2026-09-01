import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faEdit,
  faTimes,
  faShieldAlt,
  faTrash,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

import useAppTranslation from '../../hooks/useAppTranslation';
import { updateProfile, changePassword, deleteAccount } from '../../store/slices/profileSlice';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Alert from '../UI/Alert';

export default function UserInfoTab({ user }) {
  const { t } = useAppTranslation('profile');
  const { t: tAuth } = useAppTranslation('auth');
  const dispatch = useDispatch();

  // ? State to control active edit field ('name' | 'email' | 'phone' | 'password' | 'deleteAccount' | null)
  const [activeModal, setActiveModal] = useState(null);

  // ? Tracks the in-flight submit request for this modal only
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ? Alert feedback state
  const [alertConfig, setAlertConfig] = useState(null); // { type: 'error' | 'success', message: '' }

  // ? Local form state for profile field modifications
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // * Handle dynamic form input changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // * Keep local form fields in sync whenever the Redux-backed user record changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }));
  }, [user]);

  // * Open field edit overlay
  const handleOpenModal = (fieldType) => {
    setActiveModal(fieldType);
  };

  // * Reset password inputs and close form overlay
  const handleCloseModal = () => {
    setActiveModal(null);
    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  // * Submit dynamic field update
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertConfig(null);

    // Fetch translated errors object for client-side validation in Thunks
    const tErrors = t('errors', { returnObjects: true });

    try {
      if (activeModal === 'password') {
        // * Dispatch password change with current, new, confirm password & tErrors
        await dispatch(
          changePassword({
            userId: user?.id,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
            tErrors,
          })
        ).unwrap();
      } else if (activeModal === 'deleteAccount') {
        // * Dispatch soft delete account
        await dispatch(deleteAccount({ userId: user?.id })).unwrap();
      } else {
        // * Dispatch single-field update with fieldName & tErrors
        await dispatch(
          updateProfile({
            userId: user?.id,
            updatedData: { [activeModal]: formData[activeModal] },
            fieldName: activeModal,
            tErrors,
          })
        ).unwrap();
      }

      setAlertConfig({
        type: 'success',
        message:
          activeModal === 'deleteAccount'
            ? t('deleteSuccess') || 'Account deleted successfully!'
            : t('updateSuccess') || 'Profile updated successfully!',
      });
      handleCloseModal();
    } catch (err) {
      setAlertConfig({
        type: 'error',
        message: typeof err === 'string' ? (t(err) !== err ? t(err) : err) : t('errors.updateFailed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* ! Feedback Message Displayed via Custom Alert Component */}
      {alertConfig && (
        <Alert
          type={alertConfig.type}
          variant="toast"
          message={alertConfig.message}
          onClose={() => setAlertConfig(null)}
        />
      )}

      {/* * Main Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('infoTitle')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('infoSubtitle')}</p>
        </div>

        {/* * User Role Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 capitalize">
          <FontAwesomeIcon icon={faShieldAlt} className="text-xs" />
          {user?.role}
        </span>
      </div>

      {/* * Profile Summary Cards Grid */}
      <div className="flex flex-col gap-4">
        {/* ? Name Card */}
        <Card variant="outline" padding="small">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <FontAwesomeIcon icon={faUser} className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {tAuth('labels.name')}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {user?.name || '-'}
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenModal('name')}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </div>
        </Card>

        {/* ? Email Card */}
        <Card variant="outline" padding="small">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <FontAwesomeIcon icon={faEnvelope} className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {tAuth('labels.email')}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {user?.email || '-'}
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenModal('email')}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </div>
        </Card>

        {/* ? Phone Card */}
        <Card variant="outline" padding="small">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <FontAwesomeIcon icon={faPhone} className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {tAuth('labels.phone')}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {user?.phone || '-'}
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenModal('phone')}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </div>
        </Card>

        {/* ? Security / Password Card */}
        <Card variant="outline" padding="small">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <FontAwesomeIcon icon={faLock} className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {tAuth('labels.password')}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">••••••••</p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenModal('password')}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </div>
        </Card>

        {/* ! Danger Zone / Soft Delete Account Card */}
        <Card
          variant="outline"
          padding="small"
          className="border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10 mt-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                <FontAwesomeIcon icon={faTrash} className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {t('dangerZone.title')}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {t('dangerZone.subtitle')}
                </p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => handleOpenModal('deleteAccount')}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        </Card>
      </div>

      {/* * Interactive Edit Form / Confirmation Overlay */}
      {activeModal && (
        <div className="absolute top-[-1.25rem] inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {activeModal === 'deleteAccount'
                  ? t('dangerZone.title')
                  : t(`editFields.${activeModal}`)}
              </h3>
              <Button onClick={handleCloseModal} variant="danger" size="sm">
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </Button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitUpdate} className="p-6 space-y-4">
              {activeModal === 'name' && (
                <Input
                  label={tAuth('labels.name')}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={faUser}
                />
              )}

              {activeModal === 'email' && (
                <Input
                  label={tAuth('labels.email')}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={faEnvelope}
                />
              )}

              {activeModal === 'phone' && (
                <Input
                  label={tAuth('labels.phone')}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={faPhone}
                />
              )}

              {activeModal === 'password' && (
                <>
                  <Input
                    label={t('labels.currentPassword')}
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    icon={faLock}
                  />
                  <Input
                    label={t('labels.newPassword')}
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    icon={faLock}
                  />
                  <Input
                    label={t('labels.confirmPassword')}
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={faLock}
                  />
                </>
              )}

              {/* Confirmation View for Account Deletion */}
              {activeModal === 'deleteAccount' && (
                <div className="text-center space-y-3 py-2">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {t('dangerZone.confirmTitle')}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('dangerZone.confirmText')}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseModal}
                  type="button"
                  disabled={isSubmitting}
                >
                  {t('cancelBtn')}
                </Button>
                <Button
                  variant={activeModal === 'deleteAccount' ? 'danger' : 'primary'}
                  size="sm"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  {activeModal === 'deleteAccount'
                    ? t('dangerZone.confirmBtn')
                    : t('saveBtn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}