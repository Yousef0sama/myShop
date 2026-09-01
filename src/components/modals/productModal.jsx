import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faHeading, 
  faTag, 
  faPercent, 
  faBoxesStacked, 
  faTrademark, 
  faFolder, 
  faImage 
} from '@fortawesome/free-solid-svg-icons';
import Input from '../UI/Input';
import Button from '../UI/Button';

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = 'Product',
}) {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    discountPercentage: '',
    category: '',
    brand: '',
    description: '',
    thumbnail: '',
    stock: 0,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        price: initialData.price || '',
        discountPercentage: initialData.discountPercentage ?? '',
        category: initialData.category || '',
        brand: initialData.brand || '',
        description: initialData.description || '',
        thumbnail: initialData.thumbnail || '',
        stock: initialData.stock ?? 0,
        isActive: initialData.isActive !== false,
      });
    } else {
      setFormData({
        title: '',
        price: '',
        discountPercentage: '',
        category: '',
        brand: '',
        description: '',
        thumbnail: '',
        stock: 0,
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['price', 'stock', 'discountPercentage'].includes(name)
        ? value === ''
          ? ''
          : Number(value)
        : type === 'checkbox'
          ? checked
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter product title"
            icon={faHeading}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Price */}
            <Input
              label="Price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              icon={faTag}
              min="0"
              step="0.01"
              required
            />
            
            {/* Discount Percentage */}
            <Input
              label="Discount %"
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              placeholder="0"
              icon={faPercent}
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Stock */}
            <Input
              label="Stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
              icon={faBoxesStacked}
              min="0"
              required
            />

            {/* Brand */}
            <Input
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="Enter brand"
              icon={faTrademark}
              required
            />
          </div>

          {/* Category */}
          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="Enter category"
            icon={faFolder}
            required
          />

          {/* Image URL */}
          <Input
            label="Image URL"
            type="url"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            icon={faImage}
          />

          {/* Active Checkbox */}
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            Visible in catalogue
          </label>

          {/* Description */}
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description..."
              rows="3"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-900/50 resize-none transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}