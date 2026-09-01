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
import useAppTranslation from '../../hooks/useAppTranslation';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

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

const formatCurrency = (value, language) =>
  new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const StatusBadge = ({ status, t }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
      statusStyles[status] || statusStyles.pending
    }`}
  >
    {t(`statuses.${status}`)}
  </span>
);

const AccountStatusBadge = ({ user, t }) => {
  const status = user.isDeleted
    ? { label: t('accountStatuses.deleted'), className: statusStyles.cancelled }
    : user.isRestricted
      ? { label: t('accountStatuses.restricted'), className: statusStyles.pending }
      : { label: t('accountStatuses.active'), className: statusStyles.delivered };

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
  const { t, currentLanguage } = useAppTranslation('dashboard');
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
      setMessage({ type: 'success', text: t('messages.accountUpdated', { name: user.name }) });
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
      setMessage({ type: 'success', text: t('messages.categoryCreated') });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const removeCategory = async (category) => {
    if (!window.confirm(t('confirmDeleteCategory', { name: category.name }))) return;
    try {
      await adminService.deleteCategory(category.id);
      dispatch(fetchCategories());
      setMessage({ type: 'success', text: t('messages.categoryDeleted') });
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
      setMessage({ type: 'success', text: t('messages.categoryUpdated') });
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
      setMessage({ type: 'success', text: t('messages.productUpdated') });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm(t('confirmDeleteProduct'))) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      setMessage({ type: 'success', text: t('messages.productDeleted') });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const saveNewProduct = async (values) => {
    try {
      await dispatch(createProduct({ ...values, sellerId: 2, discountPercentage: 0 })).unwrap();
      setAdding(false);
      setMessage({ type: 'success', text: t('messages.productCreated') });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const changeOrderStatus = async (id, status) => {
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap();
      setMessage({ type: 'success', text: t('messages.orderStatusUpdated') });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const summaryCards = [
    {
      label: t('tabs.users'),
      value: users.length,
      detail: t('activeAccounts', { count: activeUsers }),
      icon: faUsers,
      iconStyle: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
    },
    {
      label: t('tabs.products'),
      value: products.length,
      detail: t('needStockReview', { count: lowStockProducts.length }),
      icon: faBoxOpen,
      iconStyle: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    },
    {
      label: t('tabs.orders'),
      value: orders.length,
      detail: t('needAttention', { count: pendingOrders.length }),
      icon: faCartShopping,
      iconStyle: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    },
    {
      label: t('sales'),
      value: formatCurrency(sales, currentLanguage),
      detail: t('excludingCancelledOrders'),
      icon: faSackDollar,
      iconStyle: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
  ];
  const tabs = [
    { name: 'overview', label: t('tabs.overview'), icon: faChartLine },
    { name: 'users', label: t('tabs.users'), icon: faUsers },
    { name: 'categories', label: t('tabs.categories'), icon: faLayerGroup },
    { name: 'products', label: t('tabs.products'), icon: faBoxOpen },
    { name: 'orders', label: t('tabs.orders'), icon: faCartShopping },
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
        aria-label={t('sectionsLabel')}
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
                  <h2 className="font-bold text-gray-950 dark:text-white">{t('recentOrders')}</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('recentOrdersDescription')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('orders')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {t('manageOrders')} <FontAwesomeIcon icon={faArrowRight} />
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
                          {t('orderNumber', { id: order.id })}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('itemCount', { count: order.items?.length || 0 })} ·{' '}
                          {formatCurrency(order.total, currentLanguage)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} t={t} />
                  </article>
                ))}
                {!orders.length && (
                  <p className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('noOrdersYet')}
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
                    <h2 className="font-bold text-gray-950 dark:text-white">{t('needsAttention')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stockAndFulfilment')}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => setTab('products')}
                    className="flex w-full items-center justify-between rounded-xl bg-amber-50 px-3 py-3 text-start transition-colors hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20"
                  >
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      {t('lowStockProducts')}
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
                      <FontAwesomeIcon icon={faClock} /> {t('ordersToProcess')}
                    </span>
                    <span className="rounded-lg bg-white px-2 py-0.5 text-sm font-bold text-blue-700 shadow-sm dark:bg-gray-800 dark:text-blue-300">
                      {pendingOrders.length}
                    </span>
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <h2 className="font-bold text-gray-950 dark:text-white">{t('quickActions')}</h2>
                <div className="mt-4 grid gap-2">
                  <Button
                    size="sm"
                    icon={faPlus}
                    onClick={() => setAdding(true)}
                    className="w-full"
                  >
                    {t('addProduct')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={faLayerGroup}
                    onClick={() => setTab('categories')}
                    className="w-full"
                  >
                    {t('manageCategories')}
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
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">{t('customerAccounts')}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('customerAccountsDescription')}
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <span className="sr-only">{t('searchUsers')}</span>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchUsersPlaceholder')}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 ps-10 pe-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/50"
              />
            </label>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] text-start text-sm">
              <thead className="border-y border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('user')}</th>
                  <th className="px-4 py-3 font-semibold">{t('role')}</th>
                  <th className="px-4 py-3 font-semibold">{t('status')}</th>
                  <th className="px-4 py-3 text-end font-semibold">{t('actions')}</th>
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
                    <td className="px-4 py-4">{t(`roles.${user.role}`)}</td>
                    <td className="px-4 py-4">
                      <AccountStatusBadge user={user} t={t} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUser(user, { isRestricted: !user.isRestricted })}
                        >
                          {user.isRestricted ? t('unrestrict') : t('restrict')}
                        </Button>
                        <Button
                          size="sm"
                          variant={user.isDeleted ? 'outline' : 'danger'}
                          onClick={() => updateUser(user, { isDeleted: !user.isDeleted })}
                        >
                          {user.isDeleted ? t('restore') : t('softDelete')}
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
                      {t('noMatchingUsers')}
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
                {t('productCategories')}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('productCategoriesDescription')}
              </p>
            </div>
            <form onSubmit={addCategory} className="flex w-full gap-2 sm:max-w-md">
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/50"
                placeholder={t('newCategoryName')}
              />
              <Button type="submit" icon={faPlus}>
                {t('add')}
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
                    aria-label={t('editCategory', { name: category.name })}
                    className="grid h-9 w-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    onClick={() => openCategoryEditor(category)}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    type="button"
                    aria-label={t('deleteCategory', { name: category.name })}
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
                {t('catalogueManagement')}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('catalogueManagementDescription')}
              </p>
            </div>
            <Button icon={faPlus} onClick={() => setAdding(true)}>
              {t('addProduct')}
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
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">{t('orderFulfilment')}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('orderFulfilmentDescription')}
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
                    <p className="font-semibold text-gray-950 dark:text-white">{t('orderNumber', { id: order.id })}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('itemCount', { count: order.items?.length || 0 })} ·{' '}
                      {formatCurrency(order.total, currentLanguage)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <StatusBadge status={order.status} t={t} />
                  <select
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/50"
                    value={order.status}
                    onChange={(event) => changeOrderStatus(order.id, event.target.value)}
                    aria-label={t('updateOrderStatus', { id: order.id })}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {t(`statuses.${status}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
            {!orders.length && (
              <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('noOrdersToManage')}
              </p>
            )}
          </div>
        </section>
      )}

      <ProductModal
        isOpen={adding}
        onClose={() => setAdding(false)}
        onSubmit={saveNewProduct}
        title={t('addProduct')}
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
                  {t('catalogueManagement')}
                </p>
                <h2
                  id="edit-category-title"
                  className="mt-1 text-xl font-bold text-gray-950 dark:text-white"
                >
                  {t('editCategoryTitle')}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('editCategoryDescription')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCategoryEditor}
                aria-label={t('closeEditCategoryDialog')}
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
                {t('categoryName')}
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
                  {t('cancel')}
                </Button>
                <Button type="submit" isLoading={savingCategory}>
                  {t('saveChanges')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
