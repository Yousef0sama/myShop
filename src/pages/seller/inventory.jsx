import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../../store/slices/productsSlice';
import Product from '../../components/product/product';
import ProductModal from '../../components/modals/productModal';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';

export default function Inventory() {
  const dispatch = useDispatch();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.products.items);
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);
  const inventory = products.filter((product) => product.sellerId === user.id);
  const saveNew = async (values) => {
    try {
      await dispatch(
        createProduct({ ...values, sellerId: user.id, discountPercentage: 0 })
      ).unwrap();
      setMessage({ type: 'success', text: 'Product created.' });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };
  const saveEdit = async (id, values) => {
    const product = inventory.find((item) => item.id === id);
    if (!product) return;
    try {
      await dispatch(updateProduct({ id, updatedData: { ...values, sellerId: user.id } })).unwrap();
      setMessage({ type: 'success', text: 'Product updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };
  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">My Inventory</h1>
          <p className="text-gray-500">Manage your catalogue and available stock.</p>
        </div>
        <Button onClick={() => setAdding(true)}>Add product</Button>
      </div>
      {message && <Alert type={message.type} message={message.text} />}
      {inventory.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {inventory.map((product) => (
            <Product
              key={product.id}
              product={product}
              canManage
              onEdit={saveEdit}
              onDelete={remove}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">You have no products yet.</p>
      )}
      <ProductModal
        isOpen={adding}
        onClose={() => setAdding(false)}
        onSubmit={saveNew}
        title="Add product"
      />
    </main>
  );
}
