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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      {/* ! Toast notification for API errors */}
      {error && <Alert type="error" variant="toast" message={error} />}

      {/* * Header: Search and Category Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 sm:items-end gap-4 mb-6">
        <div className="flex-1">
          <Input
            label={t('searchProducts')}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchProducts')}
            icon={faSearch}
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            label={t('allCategories')}
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryOptions}
          />
        </div>
        <div>
          <Select
            label="Availability"
            name="availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            options={[
              { value: '', label: 'All stock' },
              { value: 'in-stock', label: 'In stock' },
              { value: 'out-of-stock', label: 'Out of stock' },
            ]}
          />
        </div>
        <div>
          <Input
            label="Maximum price (EGP)"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
          />
        </div>
        <div>
          <Select
            label="Sort"
            name="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'default', label: 'Recommended' },
              { value: 'low-high', label: 'Price: low to high' },
              { value: 'high-low', label: 'Price: high to low' },
              { value: 'title', label: 'Name' },
            ]}
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {filteredProducts.length} products found
      </p>

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
