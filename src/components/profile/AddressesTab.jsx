import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMapMarkerAlt,
  faEdit,
  faTrashAlt,
  faTimes,
  faBuilding,
  faRoad,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { getFormattedCountries } from '../../utils/countries';
import useAppTranslation from '../../hooks/useAppTranslation';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../../store/slices/profileSlice';
import Button from '../UI/Button';
import Select from '../UI/Select';
import Input from '../UI/Input';
import Alert from '../UI/Alert';

export default function AddressesTab({ userId }) {
  const { t, currentLanguage } = useAppTranslation('profile');
  const dispatch = useDispatch();

  // Redux state: stored user addresses
  const addresses = useSelector((state) => state.profile.addresses || []);

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Client-side form validation errors
  const [errors, setErrors] = useState({});

  // Form input state
  const [formData, setFormData] = useState({
    country: '',
    countryCode: '',
    state: '',
    city: '',
    street: '',
    isDefault: false,
  });

  // Fetch addresses on initial mount or when userId changes
  useEffect(() => {
    if (!userId) return;
    setInitialLoading(true);
    dispatch(fetchAddresses(userId)).finally(() => setInitialLoading(false));
  }, [userId, dispatch]);

  // Dynamic input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'country') {
      const countriesList = getFormattedCountries(currentLanguage);
      const selectedOption = countriesList.find((opt) => opt.value === value);

      setFormData((prev) => ({
        ...prev,
        countryCode: value,
        country: selectedOption ? selectedOption.label : value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Open modal for creating a new address
  const handleOpenAddModal = () => {
    const countries = getFormattedCountries(currentLanguage);
    const defaultCountry = countries[0] || { value: '', label: '' };

    setEditingAddressId(null);
    setErrors({});
    setFormData({
      country: defaultCountry.label,
      countryCode: defaultCountry.value,
      state: '',
      city: '',
      street: '',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing address
  const handleOpenEditModal = (address) => {
    setEditingAddressId(address.id);
    setErrors({});
    setFormData({
      country: address.country || '',
      countryCode: address.countryCode || '',
      state: address.state || '',
      city: address.city || '',
      street: address.street || '',
      isDefault: address.isDefault || false,
    });
    setIsModalOpen(true);
  };

  // Reset states and close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddressId(null);
    setErrors({});
  };

  // Submit form handler (Handles both CREATE and UPDATE requests)
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setAlertConfig(null);

    const tErrors = t('errors', { returnObjects: true });

    try {
      // 1. Unset default flag on existing default addresses if this new/updated address is marked as default
      if (formData.isDefault) {
        const previousDefaults = addresses.filter(
          (addr) => addr.isDefault && addr.id !== editingAddressId
        );

        await Promise.all(
          previousDefaults.map((addr) =>
            dispatch(
              updateAddress({
                addressId: addr.id,
                updatedData: { ...addr, isDefault: false },
                tErrors,
              })
            ).unwrap()
          )
        );
      }

      // 2. Perform Create or Update operation
      if (editingAddressId) {
        await dispatch(
          updateAddress({
            addressId: editingAddressId,
            updatedData: formData,
            tErrors,
          })
        ).unwrap();
      } else {
        await dispatch(
          addAddress({
            addressData: { ...formData, userId },
            tErrors,
          })
        ).unwrap();
      }

      setAlertConfig({
        type: 'success',
        message: editingAddressId
          ?'Address updated successfully!'
          :'Address added successfully!',
      });

      handleCloseModal();
    } catch (err) {
      setAlertConfig({
        type: 'error',
        message:
          typeof err === 'string'
            ? t(err) !== err
              ? t(err)
              : err
            :'An error occurred while saving the address',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete address handler
  const handleDeleteAddress = async (addressId) => {
    try {
      await dispatch(deleteAddress(addressId)).unwrap();
      setAlertConfig({
        type: 'success',
        message:'Address deleted successfully!',
      });
    } catch (err) {
      setAlertConfig({
        type: 'error',
        message:
          typeof err === 'string'
            ? t(err) !== err
              ? t(err)
              : err
            : 'An error occurred while deleting the address',
      });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast Alert Feedback */}
      {alertConfig && (
        <Alert
          type={alertConfig.type}
          variant="toast"
          message={alertConfig.message}
          onClose={() => setAlertConfig(null)}
        />
      )}

      {/* Tab Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('addressesTitle')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('addressesSubtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>{t('addNewAddress')}</span>
        </Button>
      </div>

      {/* Address List View */}
      {initialLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="text-4xl text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t('noAddresses')}
          </p>
        </div>
      ) : (
        /* Address Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full mb-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                    {t('defaultBadge')}
                  </span>
                )}

                {/* Title with Country Flag */}
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  {addr.countryCode && (
                    <span className="text-xl leading-none">
                      <img
                        src={`https://flagcdn.com/w20/${addr.countryCode.toLowerCase()}.png`}
                        alt={addr.country}
                        className="inline-block"
                      />
                    </span>
                  )}
                  <span>{addr.country}</span> - <span>{addr.state}</span>
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {addr.city}، {addr.street}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 text-sm font-medium pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenEditModal(addr)}
                >
                  <FontAwesomeIcon icon={faEdit} className="text-xs" />
                  <span>{t('editBtn')}</span>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteAddress(addr.id)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                  <span>{t('deleteBtn')}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal Overlay */}
      {isModalOpen && (
        <div className="fixed top-[-1.25rem] inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingAddressId ? t('editAddress') : t('addNewAddress')}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </button>
            </div>

            {/* Modal Input Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label={t('country')}
                  name="country"
                  value={formData.countryCode}
                  onChange={handleChange}
                  options={getFormattedCountries(currentLanguage)}
                  error={errors.country}
                />
                <Input
                  label={t('state')}
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  icon={faBuilding}
                  error={errors.state}
                />
              </div>

              <Input
                label={t('city')}
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                icon={faMapMarkerAlt}
                error={errors.city}
              />

              <Input
                label={t('street')}
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                icon={faRoad}
                error={errors.street}
              />

              {/* Set Default Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {t('setAsDefault')}
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseModal}
                  type="button"
                  disabled={isSubmitting}
                >
                  {t('cancelBtn') || t('cancel') || 'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  {editingAddressId
                    ? t('saveBtn') || 'Save Changes'
                    : t('addNewAddress') || 'Add Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}