import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'; // استيراد هوك الترجمة
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faStar as faSolidStar, 
  faCartShopping, 
  faHeart as faSolidHeart, 
  faCheckCircle, 
  faTriangleExclamation,
  faPenToSquare,
  faTrashCan,
  faXmark,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faRegularHeart, faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import { addToCart } from '../../store/slices/cartSlice';
import { fetchWishlist, toggleWishlistProduct } from '../../store/slices/wishlistSlice';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';

export default function ProductDetails() {
  const { t } = useTranslation("productDetails");
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const productIds = useSelector((state) => state.wishlist.productIds);
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [nextProduct, nextReviews] = await Promise.all([
        productService.getById(productId),
        reviewService.getByProduct(productId),
      ]);
      setProduct(nextProduct);
      setReviews(nextReviews);
    } catch {
      setMessage({ type: 'error', text: t('messages.loadError') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.role === 'customer') dispatch(fetchWishlist(user.id));
  }, [dispatch, user?.id, user?.role]);

  const average = useMemo(
    () =>
      reviews.length
        ? (
            reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
          ).toFixed(1)
        : '—',
    [reviews]
  );

  const requireCustomer = () => {
    if (user?.role !== 'customer') {
      setMessage({ type: 'error', text: t('messages.customerOnly') });
      return false;
    }
    return true;
  };

  const handleCart = async () => {
    if (!requireCustomer()) return;
    try {
      await dispatch(addToCart({ userId: user.id, product })).unwrap();
      setMessage({ type: 'success', text: t('messages.addedToCart') });
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const handleWishlist = async () => {
    if (!requireCustomer()) return;
    try {
      await dispatch(toggleWishlistProduct({ userId: user.id, productId: product.id })).unwrap();
    } catch (error) {
      setMessage({ type: 'error', text: error });
    }
  };

  const handleReview = async (event) => {
    event.preventDefault();
    if (!requireCustomer() || !comment.trim()) return;
    try {
      await reviewService.create({
        productId: Number(productId),
        userId: user.id,
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      });
      setComment('');
      setRating(5);
      setMessage({ type: 'success', text: t('messages.reviewAdded') });
      refresh();
    } catch {
      setMessage({ type: 'error', text: t('messages.reviewAddError') });
    }
  };

  const confirmDeleteReview = (reviewId) => {
    setReviewToDeleteId(reviewId);
    setDeleteModalOpen(true);
  };

  const executeDeleteReview = async () => {
    if (!reviewToDeleteId) return;
    try {
      await reviewService.delete(reviewToDeleteId);
      setMessage({ type: 'success', text: t('messages.reviewDeleted') });
      refresh();
    } catch {
      setMessage({ type: 'error', text: t('messages.reviewDeleteError') });
    } finally {
      setDeleteModalOpen(false);
      setReviewToDeleteId(null);
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editComment.trim()) return;
    try {
      await reviewService.update(reviewId, {
        rating: Number(editRating),
        comment: editComment.trim(),
      });
      setEditingReviewId(null);
      setMessage({ type: 'success', text: t('messages.reviewUpdated') });
      refresh();
    } catch {
      setMessage({ type: 'error', text: t('messages.reviewUpdateError') });
    }
  };

  const StarRatingInput = ({ currentRating, setCurrRating }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex items-center gap-1 text-amber-500 cursor-pointer text-lg">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setCurrRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none transition-transform hover:scale-110 p-0.5"
          >
            <FontAwesomeIcon
              icon={star <= (hoverRating || currentRating) ? faSolidStar : faRegularStar}
            />
          </button>
        ))}
        <span className="ms-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
          ({currentRating}/5)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-gray-500 dark:text-gray-400 text-lg font-medium">
          {t('loading')}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <FontAwesomeIcon icon={faTriangleExclamation} className="text-4xl text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('notFound.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('notFound.desc')}</p>
        <Link to="/products">
          <Button variant="primary">{t('notFound.btn')}</Button>
        </Link>
      </div>
    );
  }

  const isFavourite = productIds.includes(product.id);

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 relative">
      {message && (
        <Alert
          type={message.type}
          variant="toast"
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('modal.title')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('modal.desc')}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setDeleteModalOpen(false)}
              >
                {t('modal.cancel')}
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white !border-transparent" 
                onClick={executeDeleteReview}
              >
                {t('modal.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> {t('backToProducts')}
        </Link>
      </div>

      <section className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-xl">
        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 flex items-center justify-center border border-gray-100 dark:border-gray-700/50">
          <img
            src={product.thumbnail}
            alt={product.title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial"%3EImage unavailable%3C/text%3E%3C/svg%3E';
            }}
            className="w-full aspect-square object-contain rounded-xl max-h-[400px]"
          />
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/40">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500 text-sm">
                <FontAwesomeIcon icon={faSolidStar} />
                <span className="ms-1 font-bold text-gray-900 dark:text-white">{average}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {reviews.length} {reviews.length === 1 ? t('reviewSingular') : t('reviewPlural')}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>

            <div className="pt-2 flex items-baseline justify-between border-t border-gray-100 dark:border-gray-700">
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                EGP {product.price}
              </div>
              <div className={`flex items-center gap-1.5 text-sm font-medium ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                <FontAwesomeIcon icon={product.stock > 0 ? faCheckCircle : faTriangleExclamation} />
                <span>{product.stock > 0 ? `${product.stock} ${t('inStock')}` : t('outOfStock')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button 
              onClick={handleCart} 
              disabled={product.stock < 1} 
              icon={faCartShopping}
              className="flex-1"
            >
              {t('addToCart')}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleWishlist} 
              icon={isFavourite ? faSolidHeart : faRegularHeart}
              className={isFavourite ? '!border-red-500 !text-red-500 dark:!border-red-500 dark:!text-red-400' : ''}
            >
              {isFavourite ? t('favorited') : t('wishlist')}
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-xl space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>{t('reviewsTitle')}</span>
          <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
            {reviews.length}
          </span>
        </h2>

        {user?.role === 'customer' && (
          <form
            onSubmit={handleReview}
            className="grid gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('form.title')}</h3>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('form.ratingLabel')}
              </label>
              <StarRatingInput currentRating={rating} setCurrRating={setRating} />
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required
              maxLength="500"
              rows="3"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              placeholder={t('form.placeholder')}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                {t('form.submit')}
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4 pt-2">
          {reviews.length ? (
            reviews.map((review) => {
              const isOwner = user?.id === review.userId;
              const isEditing = editingReviewId === review.id;

              return (
                <article key={review.id} className="p-4 sm:p-5 border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-500 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={i < (isEditing ? editRating : review.rating) ? faSolidStar : faRegularStar}
                          className="text-xs"
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-2 ms-2">
                          <button 
                            type="button"
                            onClick={() => startEditing(review)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors"
                            title={t('actions.edit')}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => confirmDeleteReview(review.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs transition-colors"
                            title={t('actions.delete')}
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('form.editRating')}</label>
                        <StarRatingInput currentRating={editRating} setCurrRating={setEditRating} />
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows="2"
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:outline-none resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingReviewId(null)}>
                          <FontAwesomeIcon icon={faXmark} className="me-1" /> {t('form.cancel')}
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleUpdateReview(review.id)}>
                          {t('form.save')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-200 text-sm">{review.comment}</p>
                  )}
                </article>
              );
            })
          ) : (
            <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noReviews')}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}