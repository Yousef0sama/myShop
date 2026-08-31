import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBoxOpen,
  faCartShopping,
  faChartLine,
  faClock,
  faLayerGroup,
  faMagnifyingGlass,
  faPenToSquare,
  faPlus,
  faSackDollar,
  faTriangleExclamation,
  faTruck,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { adminService } from '../../services/adminService';
import {
  fetchCategories,
  fetchProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} from '../../store/slices/productsSlice';
import { fetchOrders, updateOrderStatus } from '../../store/slices/ordersSlice';
import Product from '../../components/product/product';
import ProductModal from '../../components/modals/productModal';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const tabs = [
  { name: 'overview', label: 'Overview', icon: faChartLine },
  { name: 'users', label: 'Users', icon: faUsers },
  { name: 'categories', label: 'Categories', icon: faLayerGroup },
  { name: 'products', label: 'Products', icon: faBoxOpen },
  { name: 'orders', label: 'Orders', icon: faCartShopping },
];

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
  confirmed: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300',
  processing:
    'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300',
  shipped:
    'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300',
  delivered:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
      statusStyles[status] || statusStyles.pending
    }`}
  >
    {status}
  </span>
);

const AccountStatusBadge = ({ user }) => {
  const status = user.isDeleted
    ? { label: 'Deleted', className: statusStyles.cancelled }
    : user.isRestricted
      ? { label: 'Restricted', className: statusStyles.pending }
      : { label: 'Active', className: statusStyles.delivered };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}
    >
      {status.label}
    </span>
  );
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.products.categories);
  const orders = useSelector((state) => state.orders.items);

  const reloadUsers = async () => {
    try {
      setUsers(await adminService.getUsers());
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchOrders({}));
    reloadUsers();
  }, [dispatch]);

  const sales = useMemo(
    () =>
      orders
        .filter((order) => order.status !== 'cancelled')
        .reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );
  const lowStockProducts = useMemo(
    () => products.filter((product) => Number(product.stock) <= 5),
    [products]
  );
  const pendingOrders = useMemo(
    () => orders.filter((order) => ['pending', 'confirmed', 'processing'].includes(order.status)),
    [orders]
  );
  const activeUsers = useMemo(
    () => users.filter((user) => !user.isDeleted && !user.isRestricted).length,
    [users]
  );
  const visibleUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())
      ),
    [users, query]
  );

  const updateUser = async (user, changes) => {
    try {
      const saved = await adminService.updateUser(user.id, changes);
      setUsers((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      setMessage({ type: 'success', text: `${user.name}'s account was updated.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const addCategory = async (event) => {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    try {
      await adminService.createCategory({
        name,
        slug: name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      });
      setNewCategory('');
      dispatch(fetchCategories());
      setMessage({ type: 'success', text: 'Category created.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    try {
      await adminService.deleteCategory(category.id);
      dispatch(fetchCategories());
      setMessage({ type: 'success', text: 'Category deleted.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const openCategoryEditor = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  const closeCategoryEditor = () => {
    setEditingCategory(null);
    setCategoryName('');
  };

  const saveCategoryEdit = async (event) => {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name || !editingCategory) return;

    if (name === editingCategory.name) {
      closeCategoryEditor();
      return;
    }

    try {
      setSavingCategory(true);
      await adminService.updateCategory(editingCategory.id, {
        name,
        slug: name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      });
      dispatch(fetchCategories());
      setMessage({ type: 'success', text: 'Category updated.' });
      closeCategoryEditor();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSavingCategory(false);
    }
  };

  const saveProduct = async (id, values) => {
    try {
      await dispatch(updateProduct({ id, updatedData: values })).unwrap();
      setMessage({ type: 'success', text: 'Product updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      setMessage({ type: 'success', text: 'Product deleted.' });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const saveNewProduct = async (values) => {
    try {
      await dispatch(createProduct({ ...values, sellerId: 2, discountPercentage: 0 })).unwrap();
      setAdding(false);
      setMessage({ type: 'success', text: 'Product created.' });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const changeOrderStatus = async (id, status) => {
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap();
      setMessage({ type: 'success', text: 'Order status updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const summaryCards = [
    {
      label: 'Users',
      value: users.length,
      detail: `${activeUsers} active accounts`,
      icon: faUsers,
      iconStyle: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
    },
    {
      label: 'Products',
      value: products.length,
      detail: `${lowStockProducts.length} need stock review`,
      icon: faBoxOpen,
      iconStyle: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    },
    {
      label: 'Orders',
      value: orders.length,
      detail: `${pendingOrders.length} need attention`,
      icon: faCartShopping,
      iconStyle: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    },
    {
      label: 'Sales',
      value: formatCurrency(sales),
      detail: 'Excluding cancelled orders',
      icon: faSackDollar,
      iconStyle: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
  ];

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {message && (
        <div className="mt-5">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      <nav
        className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
        aria-label="Dashboard sections"
        role="tablist"
      >
        {tabs.map(({ name, label, icon }) => (
          <button
            key={name}
            id={`${name}-tab`}
            type="button"
            role="tab"
            aria-controls={`${name}-panel`}
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 ${
              tab === name
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <FontAwesomeIcon icon={icon} />
            {label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <section
          id="overview-panel"
          role="tabpanel"
          aria-labelledby="overview-tab"
          className="mt-6 space-y-6"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map(({ label, value, detail, icon, iconStyle }) => (
              <article
                key={label}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
                      {value}
                    </p>
                  </div>
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${iconStyle}`}>
                    <FontAwesomeIcon icon={icon} />
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {detail}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 xl:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <div>
                  <h2 className="font-bold text-gray-950 dark:text-white">Recent orders</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Monitor the latest customer activity.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('orders')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Manage orders <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.slice(0, 5).map((order) => (
                  <article
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                        <FontAwesomeIcon icon={faCartShopping} />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'} ·{' '}
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </article>
                ))}
                {!orders.length && (
                  <p className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No orders yet.
                  </p>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                  </span>
                  <div>
                    <h2 className="font-bold text-gray-950 dark:text-white">Needs attention</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stock and fulfilment</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => setTab('products')}
                    className="flex w-full items-center justify-between rounded-xl bg-amber-50 px-3 py-3 text-start transition-colors hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20"
                  >
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Low-stock products
                    </span>
                    <span className="rounded-lg bg-white px-2 py-0.5 text-sm font-bold text-amber-700 shadow-sm dark:bg-gray-800 dark:text-amber-300">
                      {lowStockProducts.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('orders')}
                    className="flex w-full items-center justify-between rounded-xl bg-blue-50 px-3 py-3 text-start transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
                      <FontAwesomeIcon icon={faClock} /> Orders to process
                    </span>
                    <span className="rounded-lg bg-white px-2 py-0.5 text-sm font-bold text-blue-700 shadow-sm dark:bg-gray-800 dark:text-blue-300">
                      {pendingOrders.length}
                    </span>
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <h2 className="font-bold text-gray-950 dark:text-white">Quick actions</h2>
                <div className="mt-4 grid gap-2">
                  <Button
                    size="sm"
                    icon={faPlus}
                    onClick={() => setAdding(true)}
                    className="w-full"
                  >
                    Add product
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={faLayerGroup}
                    onClick={() => setTab('categories')}
                    className="w-full"
                  >
                    Manage categories
                  </Button>
                </div>
              </section>
            </aside>
          </div>
        </section>
      )}

      {tab === 'users' && (
        <section
          id="users-panel"
          role="tabpanel"
          aria-labelledby="users-tab"
          className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">Customer accounts</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Search, restrict, or restore marketplace access.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <span className="sr-only">Search users</span>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 ps-10 pe-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/50"
              />
            </label>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] text-start text-sm">
              <thead className="border-y border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-end font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="text-gray-700 transition-colors hover:bg-gray-50/80 dark:text-gray-200 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-950 dark:text-white">{user.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-4 py-4 capitalize">{user.role}</td>
                    <td className="px-4 py-4">
                      <AccountStatusBadge user={user} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUser(user, { isRestricted: !user.isRestricted })}
                        >
                          {user.isRestricted ? 'Unrestrict' : 'Restrict'}
                        </Button>
                        <Button
                          size="sm"
                          variant={user.isDeleted ? 'outline' : 'danger'}
                          onClick={() => updateUser(user, { isDeleted: !user.isDeleted })}
                        >
                          {user.isDeleted ? 'Restore' : 'Soft delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!visibleUsers.length && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'categories' && (
        <section
          id="categories-panel"
          role="tabpanel"
          aria-labelledby="categories-tab"
          className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">
                Product categories
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Keep the catalogue organised and easy to browse.
              </p>
            </div>
            <form onSubmit={addCategory} className="flex w-full gap-2 sm:max-w-md">
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/50"
                placeholder="New category name"
              />
              <Button type="submit" icon={faPlus}>
                Add
              </Button>
            </form>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-950 dark:text-white">
                    {category.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                    /{category.slug}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${category.name}`}
                    className="grid h-9 w-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    onClick={() => openCategoryEditor(category)}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${category.name}`}
                    className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    onClick={() => removeCategory(category)}
                  >
                    ×
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'products' && (
        <section
          id="products-panel"
          role="tabpanel"
          aria-labelledby="products-tab"
          className="mt-6"
        >
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">
                Catalogue management
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Review listings, prices, and stock availability.
              </p>
            </div>
            <Button icon={faPlus} onClick={() => setAdding(true)}>
              Add product
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Product
                key={product.id}
                product={product}
                canManage
                onEdit={saveProduct}
                onDelete={removeProduct}
              />
            ))}
          </div>
        </section>
      )}

      {tab === 'orders' && (
        <section
          id="orders-panel"
          role="tabpanel"
          aria-labelledby="orders-tab"
          className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6"
        >
          <div>
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">Order fulfilment</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update statuses as orders move from payment to delivery.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            {orders.map((order) => (
              <article
                key={order.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 transition-colors hover:border-blue-200 dark:border-gray-700 dark:hover:border-blue-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <FontAwesomeIcon icon={order.status === 'shipped' ? faTruck : faCartShopping} />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-950 dark:text-white">Order #{order.id}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'} ·{' '}
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <StatusBadge status={order.status} />
                  <select
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/50"
                    value={order.status}
                    onChange={(event) => changeOrderStatus(order.id, event.target.value)}
                    aria-label={`Update order ${order.id} status`}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
            {!orders.length && (
              <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                No orders to manage yet.
              </p>
            )}
          </div>
        </section>
      )}

      <ProductModal
        isOpen={adding}
        onClose={() => setAdding(false)}
        onSubmit={saveNewProduct}
        title="Add product"
      />

      {editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-category-title"
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Catalogue management
                </p>
                <h2
                  id="edit-category-title"
                  className="mt-1 text-xl font-bold text-gray-950 dark:text-white"
                >
                  Edit category
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update the name shown in the product catalogue.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCategoryEditor}
                aria-label="Close edit category dialog"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <form onSubmit={saveCategoryEdit} className="mt-6">
              <label
                htmlFor="edit-category-name"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Category name
              </label>
              <input
                id="edit-category-name"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/50"
                required
                autoFocus
              />
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeCategoryEditor}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={savingCategory}>
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
