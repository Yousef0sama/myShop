import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
export default function Dashboard() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [newCategory, setNewCategory] = useState('');
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
  const updateUser = async (user, changes) => {
    try {
      const saved = await adminService.updateUser(user.id, changes);
      setUsers((current) => current.map((item) => (item.id === saved.id ? saved : item)));
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
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };
  const removeCategory = async (category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    try {
      await adminService.deleteCategory(category.id);
      dispatch(fetchCategories());
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };
  const editCategory = async (category) => {
    const name = window.prompt('Category name', category.name)?.trim();
    if (!name || name === category.name) return;
    try {
      await adminService.updateCategory(category.id, {
        name,
        slug: name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      });
      dispatch(fetchCategories());
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };
  const saveProduct = (id, values) => dispatch(updateProduct({ id, updatedData: values }));
  const removeProduct = (id) =>
    window.confirm('Delete this product?') && dispatch(deleteProduct(id));
  const tabs = ['overview', 'users', 'categories', 'products', 'orders'];
  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold dark:text-white">Admin Dashboard</h1>
      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}
      <nav className="flex flex-wrap gap-2 my-6">
        {tabs.map((name) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`px-3 py-2 rounded capitalize ${tab === name ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-white'}`}
          >
            {name}
          </button>
        ))}
      </nav>
      {tab === 'overview' && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Users', users.length],
            ['Products', products.length],
            ['Orders', orders.length],
            ['Sales', `EGP ${sales}`],
            ['Low stock', products.filter((product) => product.stock <= 5).length],
          ].map(([label, value]) => (
            <div
              key={label}
              className="p-5 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <p className="text-gray-500">{label}</p>
              <p className="text-2xl font-bold dark:text-white">{value}</p>
            </div>
          ))}
        </section>
      )}
      {tab === 'users' && (
        <section className="space-y-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users"
            className="p-2 rounded border w-full max-w-md"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left dark:text-white">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="p-2">User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((item) =>
                    `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase())
                  )
                  .map((item) => (
                    <tr key={item.id} className="border-b dark:border-gray-700">
                      <td className="p-2">
                        {item.name}
                        <small className="block text-gray-500">{item.email}</small>
                      </td>
                      <td>{item.role}</td>
                      <td>
                        {item.isDeleted ? 'Deleted' : item.isRestricted ? 'Restricted' : 'Active'}
                      </td>
                      <td className="py-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUser(item, { isRestricted: !item.isRestricted })}
                        >
                          {item.isRestricted ? 'Unrestrict' : 'Restrict'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => updateUser(item, { isDeleted: !item.isDeleted })}
                        >
                          {item.isDeleted ? 'Restore' : 'Soft delete'}
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {tab === 'categories' && (
        <section className="space-y-4">
          <form onSubmit={addCategory} className="flex gap-2">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              className="p-2 rounded border"
              placeholder="New category name"
            />
            <Button type="submit">Add category</Button>
          </form>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 border rounded-xl dark:border-gray-700 dark:text-white flex justify-between"
              >
                <span>
                  {category.name}
                  <small className="block text-gray-500">{category.slug}</small>
                </span>
                <span className="flex gap-2">
                  <button className="text-blue-600" onClick={() => editCategory(category)}>
                    Edit
                  </button>
                  <button className="text-red-600" onClick={() => removeCategory(category)}>
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
      {tab === 'products' && (
        <section>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setAdding(true)}>Add product</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <ProductModal
            isOpen={adding}
            onClose={() => setAdding(false)}
            onSubmit={(values) =>
              dispatch(createProduct({ ...values, sellerId: 2, discountPercentage: 0 }))
            }
            title="Add product"
          />
        </section>
      )}
      {tab === 'orders' && (
        <section className="space-y-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="p-4 rounded-xl border dark:border-gray-700 dark:text-white flex flex-wrap items-center justify-between gap-3"
            >
              <span>
                #{order.id} — {order.items?.length || 0} item(s) — EGP {order.total}
              </span>
              <select
                className="p-1 text-black rounded"
                value={order.status}
                onChange={(event) =>
                  dispatch(updateOrderStatus({ id: order.id, status: event.target.value }))
                }
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
