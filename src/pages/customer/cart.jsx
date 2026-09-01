import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'; // استيراد هوك الترجمة
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrashCan, 
  faArrowLeft, 
  faCartShopping, 
  faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import { fetchCart, removeFromCart, setCartQuantity } from '../../store/slices/cartSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';

export default function Cart() {
  const { t } = useTranslation('cart');
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items, error } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.products.items);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
      dispatch(fetchProducts());
    }
  }, [dispatch, user?.id]);

  const lines = items
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((line) => line.product);

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = subtotal ? 60 : 0;

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5">
        <div>
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> {t('continueShopping')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FontAwesomeIcon icon={faCartShopping} className="text-blue-600 text-xl" />
            {t('title')}
          </h1>
        </div>
        {lines.length > 0 && (
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {lines.length} {lines.length === 1 ? t('itemSingular') : t('itemPlural')}
          </span>
        )}
      </div>

      {error && <Alert type="error" message={error} />}

      {!lines.length ? (
        <div className="max-w-md mx-auto my-12 p-8 text-center bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 space-y-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            <FontAwesomeIcon icon={faCartShopping} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('empty.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('empty.desc')}
          </p>
          <div className="pt-2">
            <Link to="/products">
              <Button variant="primary">{t('empty.btn')}</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_22rem] gap-8 items-start">
          {/* Cart Items List */}
          <section className="space-y-4">
            {lines.map(({ product, quantity, price }) => (
              <article
                key={product.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img 
                    src={product.thumbnail} 
                    alt={product.title} 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain bg-gray-50 dark:bg-gray-900 rounded-xl p-2 border border-gray-100 dark:border-gray-700/50 flex-shrink-0" 
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <Link 
                      to={`/products/${product.id}`} 
                      className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 block text-base"
                    >
                      {product.title}
                    </Link>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      EGP {price} <span className="text-xs font-normal text-gray-400">{t('perUnit')}</span>
                    </p>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                        <button
                          type="button"
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
                          className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 text-sm font-bold text-gray-900 dark:text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
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
                          className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          dispatch(removeFromCart({ userId: user.id, productId: product.id }))
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <FontAwesomeIcon icon={faTrashCan} /> {t('remove')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400 sm:hidden">{t('totalPrice')}</span>
                  <strong className="text-lg font-extrabold text-gray-900 dark:text-white">
                    EGP {price * quantity}
                  </strong>
                </div>
              </article>
            ))}
          </section>

          {/* Cart Summary Aside */}
          <aside className="p-6 h-fit rounded-3xl bg-white dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-xl space-y-4 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700">
              {t('summary.title')}
            </h2>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>{t('summary.subtotal')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">EGP {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('summary.shipping')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {shipping === 0 ? t('summary.free') : `EGP ${shipping}`}
                </span>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <div className="flex justify-between items-baseline font-bold text-base text-gray-900 dark:text-white">
              <span>{t('summary.total')}</span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                EGP {subtotal + shipping}
              </span>
            </div>

            <div className="pt-2">
              <Link to="/checkout" className="block">
                <Button variant="primary" className="w-full justify-center">
                  {t('summary.checkout')} <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}