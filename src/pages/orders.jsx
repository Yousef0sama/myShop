import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchOrders, updateOrderStatus } from '../store/slices/ordersSlice';
import Alert from '../components/UI/Alert';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
export default function Orders() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const { items, status, error } = useSelector((state) => state.orders);
  useEffect(() => {
    dispatch(fetchOrders(user.role === 'customer' ? { userId: user.id } : {}));
  }, [dispatch, user.id, user.role]);
  const orders =
    user.role === 'seller'
      ? items.filter((order) => order.items?.some((item) => item.sellerId === user.id))
      : items;
  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold dark:text-white mb-6">
        {user.role === 'seller' ? 'Orders to process' : 'My Orders'}
      </h1>
      {location.state?.confirmation && (
        <Alert
          type="success"
          message={`Order #${location.state.confirmation} was placed successfully.`}
        />
      )}
      {error && <Alert message={error} />}
      {status === 'loading' ? (
        <p className="dark:text-white">Loading orders…</p>
      ) : !orders.length ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="p-5 border rounded-xl dark:border-gray-700 dark:text-white"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-bold">Order #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="capitalize px-3 py-1 h-fit rounded-full bg-blue-100 text-blue-800">
                  {order.status}
                </span>
              </div>
              <ul className="my-4 divide-y dark:divide-gray-700">
                {order.items?.map((item) => (
                  <li key={item.productId} className="py-2 flex justify-between">
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span>EGP {item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-5 text-sm">
                <span>Payment: {order.paymentMethod?.replaceAll('_', ' ')}</span>
                <strong>Total: EGP {order.total}</strong>
              </div>
              {user.role === 'seller' && (
                <label className="block mt-4 text-sm">
                  Update status{' '}
                  <select
                    className="ms-2 p-1 rounded text-black"
                    value={order.status}
                    onChange={(event) =>
                      dispatch(updateOrderStatus({ id: order.id, status: event.target.value }))
                    }
                  >
                    {statuses.map((nextStatus) => (
                      <option key={nextStatus}>{nextStatus}</option>
                    ))}
                  </select>
                </label>
              )}{' '}
              {user.role === 'customer' && (
                <div className="flex mt-5 gap-1">
                  {statuses.slice(0, 5).map((step) => (
                    <span
                      key={step}
                      className={`h-2 flex-1 rounded ${statuses.indexOf(step) <= statuses.indexOf(order.status) ? 'bg-blue-600' : 'bg-gray-200'}`}
                      title={step}
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
