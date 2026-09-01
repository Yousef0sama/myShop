import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchOrders } from '../store/slices/ordersSlice';
import Alert from '../components/UI/Alert';
import Card from '../components/UI/Card';
import Select from '../components/UI/Select';
import Input from '../components/UI/Input';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const { t } = useTranslation('orders');
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector((state) => state.auth?.user);
  const { items: ordersList, status, error } = useSelector((state) => state.orders);

  // Search and status filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Format options for the custom Select component
  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('allStatuses') },
      ...statuses.map((st) => ({
        value: st,
        label: t(`statuses.${st}`),
      })),
    ],
    [t]
  );

  // Fetch orders matching current user role
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOrders(user.role === 'customer' ? { userId: user.id } : {}));
    }
  }, [dispatch, user?.id, user?.role]);

  // Filter orders by role (Seller views items matching their sellerId)
  const baseOrders = useMemo(() => {
    if (!ordersList) return [];
    return user?.role === 'seller'
      ? ordersList.filter((order) => order.items?.some((item) => item.sellerId === user.id))
      : ordersList;
  }, [ordersList, user?.id, user?.role]);

  // Search filter matching Order ID or Item Titles
  const filteredOrders = useMemo(() => {
    return baseOrders.filter((order) => {
      const orderIdStr = String(order.id).toLowerCase();
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        orderIdStr.includes(search) ||
        order.items?.some((item) => item.title?.toLowerCase().includes(search));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [baseOrders, searchTerm, statusFilter]);

  // Helper function to format paymentMethod string
  const formatPaymentMethod = (method) => {
    if (!method) return t('paymentMethods.default');
    if (method === 'cash_on_delivery') return t('paymentMethods.cash_on_delivery');
    if (method.startsWith('card')) return t('paymentMethods.card');
    return method.replaceAll('_', ' ');
  };

  return (
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {user?.role === 'seller' ? t('titles.seller') : t('titles.customer')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Orders List Container */}
      {status === 'loading' ? (
        <div className="py-12 text-center dark:text-white">{t('loading')}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
          {t('noOrders')}
        </div>
      ) : (
        <div className="flex flex-col gap-5 justify-center items-center w-full">
          {filteredOrders.map((order) => {
            // Read address string directly from order object (supports address or shippingAddress)
            const addressText =
              typeof order.address === 'string'
                ? order.address
                : typeof order.shippingAddress === 'string'
                ? order.shippingAddress
                : t('noAddress');

            return (
              <Card key={order.id} variant='bordered' className='max-w-xl min-w-76 w-full'>
                {/* Header Info */}
                <div className="flex flex-wrap justify-between items-start gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Order #{order.id}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="capitalize px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium text-xs">
                    {t(`statuses.${order.status}`) || order.status}
                  </span>
                </div>

                {/* Items List */}
                <ul className="my-4 divide-y divide-gray-100 dark:divide-gray-800">
                  {order.items?.map((item) => (
                    <li key={item.productId} className="py-2.5 flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>
                        <strong className="font-semibold text-gray-900 dark:text-white">{item.title}</strong> × {item.quantity}
                      </span>
                      <span className="font-medium">EGP {item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>

                {/* Shipping Details - Displayed directly as text */}
                {user?.role === "customer" && (
                  <div className="my-4 p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg text-xs space-y-1 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white block text-sm mb-1">
                      {t('shippingDetails')}
                    </span>
                    <p>
                      <strong className="text-gray-700 dark:text-gray-200">{t('address')}</strong> {addressText}
                    </p>
                  </div>
                )}

                {/* Cost & Payment Summary Breakdown */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>{t('subtotal')}</span>
                    <span>EGP {order.subtotal ?? order.total}</span>
                  </div>
                  {order.shipping !== undefined && (
                    <div className="flex justify-between">
                      <span>{t('shippingFee')}</span>
                      <span>EGP {order.shipping}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>{t('discount')}</span>
                      <span>- EGP {order.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>{t('paymentMethod')} <span className="font-normal capitalize">{formatPaymentMethod(order.paymentMethod)}</span></span>
                    <span>{t('total')} EGP {order.total}</span>
                  </div>
                </div>

                {/* Status Progress Bar for Customers */}
                {user?.role === 'customer' && (
                  <div className="flex mt-5 gap-1.5">
                    {statuses.slice(0, 5).map((step) => (
                      <span
                        key={step}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          statuses.indexOf(step) <= statuses.indexOf(order.status)
                            ? 'bg-blue-600'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        title={t(`statuses.${step}`)}
                      />
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}