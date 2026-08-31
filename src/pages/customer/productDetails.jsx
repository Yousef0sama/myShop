import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { fetchWishlist, toggleWishlistProduct } from '../../store/slices/wishlistSlice';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';

export default function ProductDetails() {
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
      setMessage({ type: 'error', text: 'Unable to load this product.' });
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
      setMessage({ type: 'error', text: 'Please sign in as a customer to use this action.' });
      return false;
    }
    return true;
  };
  const handleCart = async () => {
    if (!requireCustomer()) return;
    try {
      await dispatch(addToCart({ userId: user.id, product })).unwrap();
      setMessage({ type: 'success', text: 'Added to cart.' });
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
      setMessage({ type: 'success', text: 'Your review was added.' });
      refresh();
    } catch {
      setMessage({ type: 'error', text: 'Unable to save your review.' });
    }
  };
  if (loading) return <div className="p-12 text-center">Loading product…</div>;
  if (!product)
    return (
      <div className="p-12 text-center">
        Product not found.{' '}
        <Link className="text-blue-600" to="/products">
          Browse products
        </Link>
      </div>
    );
  const isFavourite = productIds.includes(product.id);
  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      {message && (
        <Alert
          type={message.type}
          variant="toast"
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}
      <Link className="text-blue-600 hover:underline" to="/products">
        ← Back to products
      </Link>
      <section className="grid md:grid-cols-2 gap-8 bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-8 border dark:border-gray-800">
        <img
          src={product.thumbnail}
          alt={product.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial"%3EImage unavailable%3C/text%3E%3C/svg%3E';
          }}
          className="w-full aspect-square object-contain bg-gray-50 rounded-xl"
        />
        <div className="space-y-4">
          <p className="uppercase text-sm text-blue-600 font-semibold">{product.category}</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">EGP {product.price}</p>
          <p className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          <p className="text-amber-500">
            ★ {average} ({reviews.length} reviews)
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCart} disabled={product.stock < 1}>
              Add to cart
            </Button>
            <Button variant="outline" onClick={handleWishlist}>
              {isFavourite ? 'Remove from wishlist' : 'Add to wishlist'}
            </Button>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold dark:text-white">Reviews</h2>
        {user?.role === 'customer' && (
          <form
            onSubmit={handleReview}
            className="grid gap-3 p-4 border rounded-xl dark:border-gray-700"
          >
            <label className="dark:text-white">
              Rating{' '}
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="ms-2 text-black p-1 rounded"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required
              maxLength="500"
              className="p-3 rounded border text-black"
              placeholder="Share your experience"
            />
            <Button type="submit" className="w-fit">
              Submit review
            </Button>
          </form>
        )}
        {reviews.length ? (
          reviews.map((review) => (
            <article key={review.id} className="p-4 border rounded-xl dark:border-gray-700">
              <p className="text-amber-500">{'★'.repeat(review.rating)}</p>
              <p className="dark:text-gray-200">{review.comment}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </section>
    </main>
  );
}
