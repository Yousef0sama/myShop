import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import Product from '../../components/product/product';

export default function Wishlist() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const productIds = useSelector((state) => state.wishlist.productIds);
  const products = useSelector((state) => state.products.items);
  useEffect(() => {
    dispatch(fetchWishlist(user.id));
    dispatch(fetchProducts());
  }, [dispatch, user.id]);
  const savedProducts = products.filter((product) => productIds.includes(product.id));
  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold dark:text-white mb-6">My Wishlist</h1>
      {savedProducts.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedProducts.map((product) => (
            <Product key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Your wishlist is empty.</p>
      )}
    </main>
  );
}
