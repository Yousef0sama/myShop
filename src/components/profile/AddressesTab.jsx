import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMapMarkerAlt,
  faEdit,
  faTrashAlt,
  faTimes,
  faGlobe,
  faBuilding,
  faRoad,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

import useAppTranslation from '../../hooks/useAppTranslation';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../../store/slices/profileSlice';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Alert from '../UI/Alert';

export default function AddressesTab({ userId }) {
  const { t } = useAppTranslation('profile');
  const dispatch = useDispatch();

  // ? Addresses now come from the real API via profileSlice, not local mock data
  const addresses = useSelector((state) => state.profile.addresses);

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null for create mode, string/number for edit mode

  // ? Form local state for creating/editing address entries
  const [formData, setFormData] = useState({
    country: '',
    state: '',
    city: '',
    street: '',
    isDefault: false,
  });

  // * Fetch the user's addresses from the API on mount
  useEffect(() => {
    if (!userId) return;
    setInitialLoading(true);
    dispatch(fetchAddresses(userId)).finally(() => setInitialLoading(false));
  }, [userId, dispatch]);

  // * Form inputs dynamic change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // * Open Modal for Add new Address
  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setFormData({
      country: '',
      state: '',
      city: '',
      street: '',
      isDefault: addresses.length === 0, // Auto-check if it's the first address
    });
    setIsModalOpen(true);
  };

  // * Open Modal for Edit existing Address
  const handleOpenEditModal = (address) => {
    setEditingAddressId(address.id);
    setFormData({
      country: address.country,
      state: address.state,
      city: address.city,
      street: address.street,
      isDefault: address.isDefault || false,
    });
    setIsModalOpen(true);
  };

  // * Close Modal and reset input states
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddressId(null);
  };

  // * Submit form (Handles both CREATE and UPDATE requests through the real API)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAddressId) {
        // ! EDIT MODE: Update existing record via the API
        await dispatch(
          updateAddress({ addressId: editingAddressId, updatedData: formData })
        ).unwrap();
      } else {
        // * CREATE MODE: Persist new record via the API
        await dispatch(addAddress({ ...formData, userId })).unwrap();
      }

      // ? If this address was set as default, unset default on any other addresses via the API
      if (formData.isDefault) {
        const othersMarkedDefault = addresses.filter(
          (addr) => addr.isDefault && addr.id !== editingAddressId
        );
        await Promise.all(
          othersMarkedDefault.map((addr) =>
            dispatch(updateAddress({ addressId: addr.id, updatedData: { isDefault: false } }))
          )
        );
      }

      handleCloseModal();
    } catch (err) {
      setAlertConfig({
        type: 'error',
        message: typeof err === 'string' ? err : t('errors.addAddressFailed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ! Delete address handler via the API
  const handleDeleteAddress = (addressId) => {
    dispatch(deleteAddress(addressId)).unwrap().catch((err) => {
      setAlertConfig({
        type: 'error',
        message: typeof err === 'string' ? err : t('errors.deleteAddressFailed'),
      });
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* ! Toast notification for API errors */}
      {alertConfig && (
        <Alert
          type={alertConfig.type}
          variant="toast"
          message={alertConfig.message}
          onClose={() => setAlertConfig(null)}
        />
      )}

      {/* * Header Section */}
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

      {/* * Addresses Listing Container */}
      {initialLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State Fallback */
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
        /* Addresses Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faGlobe} className="text-blue-600 dark:text-blue-400 text-sm" />
                  {addr.country} - {addr.state}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {addr.city}، {addr.street}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-4 text-sm font-medium pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleOpenEditModal(addr)}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-xs" />
                  <span>{t('editBtn')}</span>
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors"
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                  <span>{t('deleteBtn')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ! Dynamic Add/Edit Address Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingAddressId ? t('editAddress') : t('addNewAddress')}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </button>
            </div>

            {/* Address Modal Input Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('country')}
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  icon={faGlobe}
                  required
                />
                <Input
                  label={t('state')}
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  icon={faBuilding}
                  required
                />
              </div>

              <Input
                label={t('city')}
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                icon={faMapMarkerAlt}
                required
              />

              <Input
                label={t('street')}
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                icon={faRoad}
                required
              />

              {/* Set Default Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {t('setAsDefault')}
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseModal}
                  type="button"
                  disabled={isSubmitting}
                >
                  {t('cancel')}
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                  {t('saveBtn')}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
