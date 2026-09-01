import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchCart, clearCart } from '../../store/slices/cartSlice';
import { fetchProducts, updateProduct } from '../../store/slices/productsSlice';
import { createOrder } from '../../store/slices/ordersSlice';
import { profileService } from '../../services/profileService';
import Alert from '../../components/UI/Alert';
import Button from '../../components/UI/Button';

export default function Checkout() {
  const { t } = useTranslation('checkout');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.items);
  const products = useSelector((state) => state.products.items);
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCart(user.id));
    dispatch(fetchProducts());
    Promise.all([profileService.getAddresses(user.id), profileService.getCards(user.id)]).then(
      ([nextAddresses, nextCards]) => {
        setAddresses(nextAddresses);
        setCards(nextCards);
        
        const defaultAddr = nextAddresses.find((address) => address.isDefault) || nextAddresses[0];
        if (defaultAddr) {
          setSelectedAddress(`${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state}`);
        }
      }
    );
  }, [dispatch, user.id]);

  const lines = useMemo(
    () =>
      cart
        .map((item) => ({
          ...item,
          product: products.find((product) => product.id === item.productId),
        }))
        .filter((line) => line.product),
    [cart, products]
  );

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = subtotal ? 60 : 0;

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!lines.length || !selectedAddress)
      return setMessage({ type: 'error', text: t('errors.chooseAddress') });
    if (lines.some((line) => line.quantity > line.product.stock))
      return setMessage({ type: 'error', text: t('errors.noStock') });
    
    setSubmitting(true);
    try {
      const order = await dispatch(
        createOrder({
          userId: user.id,
          items: lines.map((line) => ({
            productId: line.product.id,
            title: line.product.title,
            quantity: line.quantity,
            price: line.price,
            sellerId: line.product.sellerId,
          })),
          address: selectedAddress, // حفظ العنوان كنص كامل هنا
          paymentMethod,
          subtotal,
          discount: 0,
          shipping,
          total: subtotal + shipping,
          status: 'pending',
          createdAt: new Date().toISOString(),
        })
      ).unwrap();

      await Promise.all(
        lines.map((line) =>
          dispatch(
            updateProduct({
              id: line.product.id,
              updatedData: { stock: line.product.stock - line.quantity },
            })
          ).unwrap()
        )
      );

      await dispatch(clearCart(user.id)).unwrap();
      navigate('/orders', { state: { confirmation: order.id } });
    } catch (error) {
      setMessage({ type: 'error', text: error || t('errors.default') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold dark:text-white mb-6">{t('title')}</h1>
      {message && <Alert type={message.type} message={message.text} />}
      <form onSubmit={placeOrder} className="space-y-6">
        <section className="p-5 border rounded-xl dark:border-gray-700">
          <h2 className="font-bold text-xl dark:text-white mb-3">{t('delivery.title')}</h2>
          {addresses.length ? (
            addresses.map((address) => {
              const addressText = `${address.street}, ${address.city}, ${address.state}`;
              return (
                <label key={address.id} className="flex gap-2 p-2 dark:text-gray-200 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryAddress"
                    value={addressText}
                    checked={selectedAddress === addressText}
                    onChange={(event) => setSelectedAddress(event.target.value)}
                  />
                  {addressText}
                </label>
              );
            })
          ) : (
            <p className="text-gray-500">
              {t('delivery.noAddress')}{' '}
              <Link className="text-blue-600" to="/profile">
                {t('delivery.profileLink')}
              </Link>{' '}
              {t('delivery.suffix')}
            </p>
          )}
        </section>

        <section className="p-5 border rounded-xl dark:border-gray-700">
          <h2 className="font-bold text-xl dark:text-white mb-3">{t('payment.title')}</h2>
          <label className="block dark:text-gray-200 cursor-pointer">
            <input
              type="radio"
              value="cash_on_delivery"
              checked={paymentMethod === 'cash_on_delivery'}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />{' '}
            {t('payment.cashOnDelivery')}
          </label>
          <label className="block dark:text-gray-200 cursor-pointer">
            <input
              type="radio"
              value="wallet"
              checked={paymentMethod === 'wallet'}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />{' '}
            {t('payment.wallet')}
          </label>
          {cards.map((card) => (
            <label key={card.id} className="block dark:text-gray-200 cursor-pointer">
              <input
                type="radio"
                value={`card_${card.id}`}
                checked={paymentMethod === `card_${card.id}`}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />{' '}
              {t('payment.savedCard')} {card.last4}
            </label>
          ))}
        </section>

        <section className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl dark:text-white">
          <p className="flex justify-between">
            <span>{t('summary.subtotal')}</span>
            <span>EGP {subtotal}</span>
          </p>
          <p className="flex justify-between">
            <span>{t('summary.shipping')}</span>
            <span>EGP {shipping}</span>
          </p>
          <p className="flex justify-between font-bold mt-3">
            <span>{t('summary.total')}</span>
            <span>EGP {subtotal + shipping}</span>
          </p>
        </section>

        <Button type="submit" disabled={!lines.length || !addresses.length} isLoading={submitting}>
          {t('btn')}
        </Button>
      </form>
    </main>
  );
}