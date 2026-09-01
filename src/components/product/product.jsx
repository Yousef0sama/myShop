import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faShoppingCart,
  faTrash,
  faPencil,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';
import ProductModal from '../modals/productModal';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlistProduct } from '../../store/slices/wishlistSlice';

export default function Product({ product, onDelete, onEdit, canManage = false }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const productIds = useSelector((state) => state.wishlist.productIds);

  const originalPrice = (product.price / (1 - (product.discountPercentage || 0) / 100)).toFixed(2);

  const handleEditSubmit = (updatedData) => {
    if (onEdit) onEdit(product.id, updatedData);
  };
  const handleCart = async () => {
    if (user?.role !== 'customer') return navigate('/login');
    await dispatch(addToCart({ userId: user.id, product }))
      .unwrap()
      .catch(() => {});
  };
  const handleWishlist = async () => {
    if (user?.role !== 'customer') return navigate('/login');
    await dispatch(toggleWishlistProduct({ userId: user.id, productId: product.id }))
      .unwrap()
      .catch(() => {});
  };

  return (
    <>
      <div className="group relative w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {product.discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              -{Math.round(product.discountPercentage)}%
            </span>
          )}
          <span className="bg-gray-900/70 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md">
            {product.category}
          </span>
        </div>

        {/* ? Edit/Delete controls are only shown to users allowed to manage the catalog (admin/seller) */}
        {canManage && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-white/80 hover:bg-blue-600 text-gray-600 hover:text-white p-2.5 rounded-full shadow-md backdrop-blur-md transition-all duration-200 active:scale-90 flex items-center justify-center"
              title="Edit product"
            >
              <FontAwesomeIcon icon={faPencil} className="text-xs" />
            </button>
            <button
              onClick={() => onDelete && onDelete(product.id)}
              className="bg-white/80 hover:bg-red-600 text-gray-600 hover:text-white p-2.5 rounded-full shadow-md backdrop-blur-md transition-all duration-200 active:scale-90 flex items-center justify-center"
              title="Delete product"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
            </button>
          </div>
        )}
        {!canManage && user?.role === 'customer' && (
          <button
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
            className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow ${productIds.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-700'}`}
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>
        )}

        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center p-4">
          <img
            src={
              product.thumbnail ||
              (product.images && product.images[0]) ||
              'https://via.placeholder.com/150'
            }
            alt={product.title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial"%3EImage unavailable%3C/text%3E%3C/svg%3E';
            }}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        </div>

        <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 uppercase font-semibold tracking-wider">
                {product.brand}
              </span>
              <span
                className={`font-medium ${product.availabilityStatus === 'In Stock' ? 'text-emerald-600' : 'text-amber-600'}`}
              >
                {product.availabilityStatus || 'In Stock'}
              </span>
            </div>

            <Link
              to={`/products/${product.id}`}
              className="font-semibold text-gray-800 text-base line-clamp-1 group-hover:text-blue-600 transition-colors"
            >
              {product.title}
            </Link>

            <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-amber-400">
                <FontAwesomeIcon icon={faStar} />
                <span className="font-bold text-gray-700 ml-1">{product.rating || 0}</span>
              </div>
              <span className="text-gray-400 text-[11px]">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                {product.discountPercentage > 0 && (
                  <span className="text-xs text-gray-400 line-through">${originalPrice}</span>
                )}
                <span className="text-xl font-bold text-gray-900">${product.price}</span>
              </div>

              <button
                onClick={handleCart}
                disabled={product.stock < 1 || canManage}
                className="bg-black hover:bg-gray-800 text-white p-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <FontAwesomeIcon icon={faShoppingCart} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={product}
        title="Edit Product"
      />
    </>
  );
}
