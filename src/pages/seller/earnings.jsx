import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../store/slices/ordersSlice';
import Card from '../../components/UI/Card';
import Alert from '../../components/UI/Alert';

// * Statuses that count towards the seller's revenue total
const PAID_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered'];

export default function Earnings() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // ? Keep only orders that contain at least one item sold by this seller
  const orders = useMemo(
    () =>
      items.filter((order) => order.items?.some((item) => item.sellerId === user?.id)),
    [items, user?.id]
  );

  // * Aggregate the seller's revenue metrics from their filtered orders
  const stats = useMemo(() => {
    let totalSales = 0;
    let totalUnits = 0;
    let pendingPayout = 0;

    orders.forEach((order) => {
      if (PAID_STATUSES.includes(order.status)) {
        // ? Attribute only this seller's line-items to their earnings
        const sellerItems = order.items?.filter((item) => item.sellerId === user?.id) || [];
        const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        // ! Shipping is not shared with the seller; split by the order's full total share is skipped
        totalSales += sellerSubtotal;
        totalUnits += sellerItems.reduce((sum, item) => sum + item.quantity, 0);
        if (order.status === 'delivered') pendingPayout += sellerSubtotal;
      }
    });

    return { totalSales, totalUnits, pendingPayout, orderCount: orders.length };
  }, [orders, user?.id]);

  const cards = [
    {
      label: 'Total Sales',
      value: `EGP ${stats.totalSales.toLocaleString()}`,
      hint: 'Completed & in-progress orders',
    },
    {
      label: 'Orders',
      value: `${stats.orderCount}`,
      hint: 'Orders containing your products',
    },
    {
      label: 'Units Sold',
      value: `${stats.totalUnits}`,
      hint: 'Total items purchased',
    },
    {
      label: 'Ready to Pay',
      value: `EGP ${stats.pendingPayout.toLocaleString()}`,
      hint: 'From delivered orders',
    },
  ];

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Earnings</h1>
        <p className="text-gray-500">Track your sales and upcoming payouts.</p>
      </div>

      {error && <Alert message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.label} variant="elevated" padding="normal">
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.hint}</p>
          </Card>
        ))}
      </div>

      <Card title="Recent Orders" subtitle="Only orders that contain your products">
        {status === 'loading' ? (
          <p className="text-gray-500">Loading orders…</p>
        ) : !orders.length ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <th className="py-2 pe-4">Order</th>
                  <th className="py-2 pe-4">Date</th>
                  <th className="py-2 pe-4">Items</th>
                  <th className="py-2 pe-4">Your share</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map((order) => {
                  const sellerItems =
                    order.items?.filter((item) => item.sellerId === user?.id) || [];
                  const share = sellerItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );
                  return (
                    <tr key={order.id} className="dark:text-white">
                      <td className="py-3 pe-4 font-medium">#{order.id}</td>
                      <td className="py-3 pe-4 text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pe-4">
                        {sellerItems
                          .map((item) => `${item.title} × ${item.quantity}`)
                          .join(', ')}
                      </td>
                      <td className="py-3 pe-4 font-semibold">EGP {share.toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block capitalize px-3 py-1 rounded-full text-xs ${
                            PAID_STATUSES.includes(order.status)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
}
