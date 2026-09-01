import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faShoppingCart, faHeart, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlistProduct, fetchWishlist } from '../../store/slices/wishlistSlice';
import { fetchProductReviews } from '../../store/slices/reviewsSlice';
import { updateProduct, deleteProduct } from '../../store/slices/productsSlice';
import ProductModal from '../modals/productModal';
import useTranslation from '../../hooks/useAppTranslation';

export default function Product({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('products');

  const user = useSelector((state) => state.auth?.user);
  const productIds = useSelector((state) => state.wishlist?.productIds || []);
  const userRole = user?.role; // 'customer', 'seller', 'admin'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch wishlist and product reviews from API via Redux on mount
  useEffect(() => {
    if (user?.id && userRole === 'customer') {
      dispatch(fetchWishlist(user.id));
    }
    if (product?.id) {
      dispatch(fetchProductReviews(product.id));
    }
  }, [dispatch, user?.id, userRole, product?.id]);

  // Read reviews from Redux store dictionary
  const productReviews = useSelector(
    (state) => state.reviews?.byProductId?.[product?.id]
  );

  // Wishlist Status
  const isWishlisted = productIds.includes(product.id);

  // Original Price Calculation
  const originalPrice = useMemo(() => {
    if (!product.discountPercentage || product.discountPercentage <= 0) return null;
    return (product.price / (1 - product.discountPercentage / 100)).toFixed(2);
  }, [product.price, product.discountPercentage]);

  // Reviews Count & Average Rating Calculations
  const reviewsCount = useMemo(() => {
    if (Array.isArray(productReviews)) return productReviews.length;
    if (Array.isArray(product.reviews)) return product.reviews.length;
    return product.reviewsCount || 0;
  }, [productReviews, product.reviews, product.reviewsCount]);

  const avgRating = useMemo(() => {
    if (Array.isArray(productReviews) && productReviews.length > 0) {
      const sum = productReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      return (sum / productReviews.length).toFixed(1);
    }
    if (product.rating) return Number(product.rating).toFixed(1);
    return '0.0';
  }, [productReviews, product.rating]);

  // Event Handlers
  const handleCart = async (e) => {
    e.preventDefault();
    if (userRole !== 'customer') return navigate('/login');
    await dispatch(addToCart({ userId: user.id, product }))
      .unwrap()
      .catch(() => {});
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (userRole !== 'customer') return navigate('/login');
    await dispatch(toggleWishlistProduct({ userId: user.id, productId: product.id }))
      .unwrap()
      .catch(() => {});
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (updatedData) => {
    try {
      await dispatch(updateProduct({ id: product.id, updatedData })).unwrap();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteClick = async (e) => {
    e.preventDefault();
    if (window.confirm(t('confirmDelete') || 'Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(product.id)).unwrap();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  return (
    <>
      <div className="group relative w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
        
        {/* Badges: Discount & Category */}
        <div className="absolute top-3 start-3 z-10 flex flex-col gap-1 items-start">
          {product.discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              -{Math.round(product.discountPercentage)}%
            </span>
          )}
          <span className="bg-gray-900/70 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md">
            {product.category}
          </span>
        </div>

        {/* Customer Wishlist Button (Only for Customers) */}
        {userRole === 'customer' && (
          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
            title={isWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
            className={`absolute top-3 end-3 z-10 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all duration-200 active:scale-90 flex items-center justify-center ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white'
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className="text-sm" />
          </button>
        )}

        {/* Product Image */}
        <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-900 overflow-hidden flex items-center justify-center p-4">
          <img
            src={
              product.thumbnail ||
              (product.images && product.images[0]) ||
              'https://via.placeholder.com/150'
            }
            alt={product.title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial"%3E${encodeURIComponent(
                t('imageUnavailable')
              )}%3C/text%3E%3C/svg%3E`;
            }}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Product Content Details */}
        <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
          <div className="space-y-1.5">
            {/* Brand & Stock status */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 dark:text-gray-400 uppercase font-semibold tracking-wider">
                {product.brand}
              </span>
              <span
                className={`font-medium ${
                  product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {product.stock > 0 ? t('inStock') : t('outOfStock')}
              </span>
            </div>

            {/* Title Link */}
            <Link
              to={`/products/${product.id}`}
              className="font-semibold text-gray-800 dark:text-white text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {product.title}
            </Link>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Rating, Pricing & Actions */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
            {/* Rating */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-400">
                <FontAwesomeIcon icon={faStar} />
                <span className="font-bold text-gray-700 dark:text-gray-200">{avgRating}</span>
              </div>
              <span className="text-gray-400 dark:text-gray-400 text-[11px]">
                ({reviewsCount} {reviewsCount === 1 ? t('review') : t('reviews')})
              </span>
            </div>

            {/* Pricing & Actions based on Role */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                {originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {originalPrice} {t('currency')}
                  </span>
                )}
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {product.price} <span className="text-xs font-normal">{t('currency')}</span>
                </span>
              </div>

              {/* Actions for Customer */}
              {userRole === 'customer' && (
                <button
                  onClick={handleCart}
                  disabled={product.stock < 1}
                  title={product.stock < 1 ? t('outOfStockBtn') : t('addToCart')}
                  aria-label={t('addToCart')}
                  className="bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white p-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                </button>
              )}

              {/* Actions for Seller (Edit & Delete) */}
              {userRole === 'seller' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditClick}
                    title={t('edit')}
                    aria-label={t('edit')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center text-sm"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    title={t('delete')}
                    aria-label={t('delete')}
                    className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center text-sm"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              )}

              {/* Actions for Admin (Delete only) */}
              {userRole === 'admin' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteClick}
                    title={t('delete')}
                    aria-label={t('delete')}
                    className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center text-sm"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Edit Modal */}
      <ProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateSubmit}
        initialData={product}
        title={t('editProduct') || 'Edit Product'}
      />
    </>
  );
}