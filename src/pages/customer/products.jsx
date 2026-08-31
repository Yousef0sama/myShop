import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faSearch } from '@fortawesome/free-solid-svg-icons';

import useAppTranslation from '../../hooks/useAppTranslation';
import { fetchProducts, fetchCategories } from '../../store/slices/productsSlice';

import Product from '../../components/product/product';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Alert from '../../components/UI/Alert';

export default function Products() {
  const { t } = useAppTranslation('common');
  const dispatch = useDispatch();

  // ? Global product catalog state from Redux
  const { items: products, categories, status, error } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [initialLoading, setInitialLoading] = useState(true);

  // * Fetch products & categories from the API on mount
  useEffect(() => {
    Promise.all([dispatch(fetchProducts()), dispatch(fetchCategories())]).finally(() =>
      setInitialLoading(false)
    );
  }, [dispatch]);

  // * Client-side filtering by search term and selected category
  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSearch =
        !searchTerm || product.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesAvailability =
        !availability || (availability === 'in-stock' ? product.stock > 0 : product.stock < 1);
      const matchesPrice = !maxPrice || Number(product.price) <= Number(maxPrice);
      return (
        product.isActive !== false &&
        matchesSearch &&
        matchesCategory &&
        matchesAvailability &&
        matchesPrice
      );
    });
    return result.sort((a, b) =>
      sortBy === 'low-high'
        ? a.price - b.price
        : sortBy === 'high-low'
          ? b.price - a.price
          : sortBy === 'title'
            ? a.title.localeCompare(b.title)
            : 0
    );
  }, [products, searchTerm, selectedCategory, availability, maxPrice, sortBy]);

  const categoryOptions = [
    { value: '', label: t('allCategories') },
    ...categories.map((cat) => ({
      value: typeof cat === 'string' ? cat : cat.slug || cat.name,
      label: typeof cat === 'string' ? cat : cat.name,
    })),
  ];
  const hasActiveFilters = Boolean(
    searchTerm || selectedCategory || availability || maxPrice || sortBy !== 'default'
  );
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setAvailability('');
    setMaxPrice('');
    setSortBy('default');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      {/* ! Toast notification for API errors */}
      {error && <Alert type="error" variant="toast" message={error} />}

      {/* * Catalogue search and filter controls */}
      <section
        aria-label={t('productFilters')}
        className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/80 shadow-sm dark:border-gray-700 dark:bg-gray-900/70"
      >
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
              <h1 className="font-bold text-gray-900 dark:text-white">{t('productFilters')}</h1>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10 sm:self-auto"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:items-end sm:p-5 lg:grid-cols-5">
          <div className="min-w-0 [&_label]:mb-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-gray-600 dark:[&_label]:text-gray-300">
            <Input
              label={t('searchProducts')}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchProducts')}
              icon={faSearch}
              className="border-gray-200 py-2.5 shadow-none hover:border-gray-300 dark:border-gray-700"
            />
          </div>

          <div className="min-w-0 [&_label]:mb-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-gray-600 dark:[&_label]:text-gray-300">
            <Select
              label={t('allCategories')}
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categoryOptions}
              className="border-gray-200 py-2.5 shadow-none hover:border-gray-300 dark:border-gray-700"
            />
          </div>
          <div className="min-w-0 [&_label]:mb-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-gray-600 dark:[&_label]:text-gray-300">
            <Select
              label={t('availability')}
              name="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              options={[
                { value: '', label: t('allStock') },
                { value: 'in-stock', label: t('inStock') },
                { value: 'out-of-stock', label: t('outOfStock') },
              ]}
              className="border-gray-200 py-2.5 shadow-none hover:border-gray-300 dark:border-gray-700"
            />
          </div>
          <div className="min-w-0 [&_label]:mb-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-gray-600 dark:[&_label]:text-gray-300">
            <Input
              label={t('maximumPrice')}
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              className="border-gray-200 py-2.5 shadow-none hover:border-gray-300 dark:border-gray-700"
            />
          </div>
          <div className="min-w-0 [&_label]:mb-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-gray-600 dark:[&_label]:text-gray-300">
            <Select
              label={t('sort')}
              name="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'default', label: t('recommended') },
                { value: 'low-high', label: t('priceLowHigh') },
                { value: 'high-low', label: t('priceHighLow') },
                { value: 'title', label: t('name') },
              ]}
              className="border-gray-200 py-2.5 shadow-none hover:border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white/70 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 sm:px-5">
          {t('productsFound', { count: filteredProducts.length })}
        </div>
      </section>

      {/* * Loading State */}
      {initialLoading || status === 'loading' ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* * Empty State */
        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <FontAwesomeIcon
            icon={faBoxOpen}
            className="text-4xl text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('noProductsFound')}</p>
        </div>
      ) : (
        /* * Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Product key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
