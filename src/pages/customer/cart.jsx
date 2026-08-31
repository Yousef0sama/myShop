import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart, setCartQuantity } from '../../store/slices/cartSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import Alert from '../../components/UI/Alert';

export default function Cart() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items, error } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.products.items);
  useEffect(() => {
    dispatch(fetchCart(user.id));
    dispatch(fetchProducts());
  }, [dispatch, user.id]);
  const lines = items
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((line) => line.product);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = subtotal ? 60 : 0;
  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold dark:text-white mb-6">Shopping Cart</h1>
      {error && <Alert message={error} />}
      {!lines.length ? (
        <p className="text-gray-500">
          Your cart is empty.{' '}
          <Link className="text-blue-600" to="/products">
            Browse products
          </Link>
        </p>
      ) : (
        <div className="grid lg:grid-cols-[1fr_20rem] gap-6">
          <section className="space-y-3">
            {lines.map(({ product, quantity, price }) => (
              <article
                key={product.id}
                className="flex gap-4 p-4 border rounded-xl dark:border-gray-700"
              >
                <img src={product.thumbnail} alt="" className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <Link to={`/products/${product.id}`} className="font-semibold dark:text-white">
                    {product.title}
                  </Link>
                  <p className="text-gray-500">EGP {price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        dispatch(
                          setCartQuantity({
                            userId: user.id,
                            productId: product.id,
                            quantity: quantity - 1,
                            stock: product.stock,
                          })
                        )
                      }
                      disabled={quantity <= 1}
                      className="px-2 border rounded dark:text-white"
                    >
                      −
                    </button>
                    <span className="dark:text-white">{quantity}</span>
                    <button
                      onClick={() =>
                        dispatch(
                          setCartQuantity({
                            userId: user.id,
                            productId: product.id,
                            quantity: quantity + 1,
                            stock: product.stock,
                          })
                        )
                      }
                      disabled={quantity >= product.stock}
                      className="px-2 border rounded dark:text-white"
                    >
                      +
                    </button>
                    <button
                      onClick={() =>
                        dispatch(removeFromCart({ userId: user.id, productId: product.id }))
                      }
                      className="ms-3 text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <strong className="dark:text-white">EGP {price * quantity}</strong>
              </article>
            ))}
          </section>
          <aside className="p-5 h-fit rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white space-y-3">
            <h2 className="text-xl font-bold">Summary</h2>
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>EGP {subtotal}</span>
            </p>
            <p className="flex justify-between">
              <span>Shipping</span>
              <span>EGP {shipping}</span>
            </p>
            <hr />
            <p className="flex justify-between font-bold">
              <span>Total</span>
              <span>EGP {subtotal + shipping}</span>
            </p>
            <Link
              to="/checkout"
              className="block text-center bg-blue-600 text-white p-3 rounded-lg"
            >
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
