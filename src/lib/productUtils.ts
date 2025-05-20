
import { Product } from '@/types';
import { formatCurrency } from './utils';

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (original: number, discounted: number): number => {
  if (!original || !discounted || original <= 0) return 0;
  const percentage = Math.round(((original - discounted) / original) * 100);
  return percentage > 0 ? percentage : 0;
};

/**
 * Get product display price with formatting
 */
export const getDisplayPrice = (product: Product): string => {
  if (product.discounted_price) {
    return formatCurrency(product.discounted_price);
  }
  return formatCurrency(product.price);
};

/**
 * Get product tags as a formatted string
 */
export const getProductTagsString = (product: Product): string => {
  const tags: string[] = [];
  
  if (product.category) tags.push(product.category);
  if (product.material) tags.push(product.material);
  if (product.related_gods?.length) tags.push(...product.related_gods);
  
  return tags.join(', ');
};

/**
 * Check if a product is in stock
 */
export const isInStock = (product: Product): boolean => {
  return product.stock_quantity > 0;
};

/**
 * Get stock display text
 */
export const getStockDisplay = (product: Product): { text: string; color: string } => {
  if (product.stock_quantity <= 0) {
    return { text: 'Out of stock', color: 'text-red-500' };
  } 
  if (product.stock_quantity < 5) {
    return { text: `Only ${product.stock_quantity} left`, color: 'text-amber-500' };
  }
  return { text: 'In stock', color: 'text-green-500' };
};

/**
 * Group related products by category
 */
export const groupProductsByCategory = (products: Product[]): Record<string, Product[]> => {
  return products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
};

/**
 * Get all searchable content from a product
 */
export const getSearchableContent = (product: Product): string => {
  const searchableFields = [
    product.name,
    product.description,
    product.category,
    product.subcategory,
    product.material,
    product.region_of_origin,
    product.artisan,
    ...(product.related_gods || []),
    ...(product.occasions || []),
    ...(product.tags || [])
  ];
  
  return searchableFields.filter(Boolean).join(' ').toLowerCase();
};
