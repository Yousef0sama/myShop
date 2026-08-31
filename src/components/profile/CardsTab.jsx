import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTrashAlt,
  faCreditCard,
  faTimes,
  faCalendarAlt,
  faUser,
  faLock,
} from '@fortawesome/free-solid-svg-icons';

import useAppTranslation from '../../hooks/useAppTranslation';
import { fetchCards, addCard, deleteCard } from '../../store/slices/profileSlice';
import { formatCardNumber, formatExpiryDate, formatCVC } from '../../utils/validation';
import BankCardPreview from '../UI/BankCardPreview';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Alert from '../UI/Alert';

export default function CardsTab({ user }) {
  const { t } = useAppTranslation('profile');
  const dispatch = useDispatch();
  const userId = user?.id;

  // ? Role detection flag (Determines labels for Customer vs Seller view)
  const isSeller = user?.role === 'seller';

  // ? Cards now come from the real API via profileSlice, not local mock data
  const cards = useSelector((state) => state.profile.cards);

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ? New Card Form local state
  const [newCard, setNewCard] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  // * Fetch the user's saved cards from the API on mount
  useEffect(() => {
    if (!userId) return;
    setInitialLoading(true);
    dispatch(fetchCards(userId)).finally(() => setInitialLoading(false));
  }, [userId, dispatch]);

  // * Input change handler with Formats applied
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = formatCVC(value);
    }

    setNewCard((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // * Add new card submit action (persists to the API)
  const handleAddCardSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(
        addCard({
          userId,
          cardHolder: newCard.cardHolder || user?.name || '',
          // ? Only the last 4 digits are persisted; full card number/CVV are never stored
          last4: newCard.cardNumber.replace(/\s/g, '').slice(-4) || '0000', // إزالة المسافات قبل القص
          expiry: newCard.expiry || 'MM/YY',
          brand: 'visa',
        })
      ).unwrap();

      setNewCard({ cardHolder: '', cardNumber: '', expiry: '', cvv: '' });
      setIsAddModalOpen(false);
    } catch (err) {
      setAlertConfig({
        type: 'error',
        message: typeof err === 'string' ? err : t('errors.addCardFailed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ! Remove existing card handler via the API
  const handleDeleteCard = (cardId) => {
    dispatch(deleteCard(cardId))
      .unwrap()
      .catch((err) => {
        setAlertConfig({
          type: 'error',
          message: typeof err === 'string' ? err : t('errors.deleteCardFailed'),
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

      {/* * Header Section (Title & Action Button Adaptable by Role) */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {isSeller ? t('payoutCardsTitle') : t('cardsTitle')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isSeller ? t('payoutCardsSubtitle') : t('cardsSubtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>{t('addNewCard')}</span>
        </Button>
      </div>

      {/* * Cards Listing Grid Container */}
      {initialLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : cards.length === 0 ? (
        /* Empty cards fallback state */
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <FontAwesomeIcon
            icon={faCreditCard}
            className="text-4xl text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {isSeller ? t('noPayoutCards') : t('noCards')}
          </p>
        </div>
      ) : (
        /* Cards rendering grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="relative group">
              {/* * Bank Card Visual Component */}
              <BankCardPreview
                cardNumber={`•••• •••• •••• ${card.last4}`}
                cardHolder={card.cardHolder}
                expiryDate={card.expiry}
              />

              {/* ! Quick Delete Action Trigger */}
              <Button
                onClick={() => handleDeleteCard(card.id)}
                size="sm"
                variant="danger"
                className="absolute top-2 end-8"
                title={t('deleteCard')}
              >
                <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ! Add New Card Interactive Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('addNewCard')}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </button>
            </div>

            {/* Add Card Modal Form */}
            <form onSubmit={handleAddCardSubmit} className="p-6 space-y-4">
              <Input
                label={t('cardHolderName')}
                type="text"
                name="cardHolder"
                value={newCard.cardHolder}
                onChange={handleInputChange}
                icon={faUser}
                placeholder="Yousef Osama"
                required
              />

              <Input
                label={t('cardNumber')}
                type="text"
                name="cardNumber"
                value={newCard.cardNumber}
                onChange={handleInputChange}
                icon={faCreditCard}
                placeholder="4532 •••• •••• 4242"
                maxLength={19}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('expiryDate')}
                  type="text"
                  name="expiry"
                  value={newCard.expiry}
                  onChange={handleInputChange}
                  icon={faCalendarAlt}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />

                <Input
                  label={t('cvv')}
                  type="password"
                  name="cvv"
                  value={newCard.cvv}
                  onChange={handleInputChange}
                  icon={faLock}
                  placeholder="•••"
                  maxLength={4}
                  required
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  type="button"
                  disabled={isSubmitting}
                >
                  {t('cancel')}
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                  {t('saveCard')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
