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
  const [initialLoading, setInitialLoading] = useState(true);

  // * Fetch products & categories from the API on mount
  useEffect(() => {
    Promise.all([dispatch(fetchProducts()), dispatch(fetchCategories())]).finally(() =>
      setInitialLoading(false)
    );
  }, [dispatch]);

  // * Client-side filtering by search term and selected category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !searchTerm
        || product.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

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
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
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
      </div>

      {/* * Loading State */}
      {initialLoading || status === 'loading' ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* * Empty State */
        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <FontAwesomeIcon icon={faBoxOpen} className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('noProductsFound')}</p>
        </div>
      ) : (
        /* * Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Product
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}