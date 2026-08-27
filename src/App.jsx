import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './store/index';

// * Layout Components
import Layout from './components/layout/layout';

// * Route Guard Components
import PublicOnlyRoute from './components/routes/PublicOnlyRoute';
import ProtectedRoute from './components/routes/ProtectedRoute';

// * Lazy Loaded Page Views (Optimization)
const Products = lazy(() => import('./pages/customer/products'));
const Cart = lazy(() => import('./pages/customer/cart'));
const Wishlist = lazy(() => import('./pages/customer/wishlist'));
const Inventory = lazy(() => import('./pages/seller/inventory'));
const Earnings = lazy(() => import('./pages/seller/earnings'));
const Orders = lazy(() => import('./pages/orders'));
const Dashboard = lazy(() => import('./pages/admin/dashboard'));
const Login = lazy(() => import('./pages/auth/login'));
const Register = lazy(() => import('./pages/auth/register'));
const Profile = lazy(() => import('./pages/profile'));
const NotFound = lazy(() => import('./pages/notFound'));

// * Full Application Router Configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      // * Public Routes (Accessible by anyone)
      { index: true, element: <Products /> },
      { path: 'products', element: <Products /> },

      // * Any Logged-in User (Customer, Seller, Admin)
      {
        element: <ProtectedRoute />,
        children: [{ path: 'profile', element: <Profile /> }],
      },

      // * Customer-Only Routes
      {
        element: <ProtectedRoute allowedRoles={['customer']} />,
        children: [
          { path: 'cart', element: <Cart /> },
          { path: 'wishlist', element: <Wishlist /> },
        ],
      },

      // * Seller-Only Routes
      {
        element: <ProtectedRoute allowedRoles={['seller']} />,
        children: [
          { path: 'inventory', element: <Inventory /> },
          { path: 'earnings', element: <Earnings /> },
        ],
      },

      // * Shared Routes (Customer & Seller)
      {
        element: <ProtectedRoute allowedRoles={['customer', 'seller']} />,
        children: [{ path: 'orders', element: <Orders /> }],
      },

      // * Admin-Only Routes
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [{ path: 'dashboard', element: <Dashboard /> }],
      },

      // ! Guest Only Routes (Redirects to Home if already logged in)
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
        ],
      },

      // * Catch-all 404 Route within Main Layout
      { path: '*', element: <NotFound /> },
    ],
  },
]);

// ? Loading Spinner Fallback UI Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <Provider store={store}>
      {/* ? Suspense Fallback Wrapper for Lazy Loaded Component Chunks */}
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  );
}