
import React from 'react';
import { Product, ViewMode } from '@/types';
import ProductCard from './ProductCard';
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: Product[];
  viewMode: ViewMode;
  loading: boolean;
  onProductClick: (productId: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  viewMode, 
  loading, 
  onProductClick 
}) => {
  // Create loading skeletons
  const renderSkeletons = () => {
    const skeletons = Array(12).fill(0);
    
    return skeletons.map((_, index) => (
      <div key={index} className="product-card">
        <div className={`product-image-wrapper ${viewMode === 'list' ? 'md:w-1/3' : ''}`}>
          <Skeleton className="w-full h-full" />
        </div>
        <div className={`p-4 ${viewMode === 'list' ? 'md:w-2/3' : ''}`}>
          <Skeleton className="h-5 w-3/4 mb-2" />
          {viewMode === 'list' && (
            <>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </>
          )}
          <Skeleton className="h-4 w-1/4 mt-2" />
        </div>
      </div>
    ));
  };

  return (
    <div 
      className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}
    >
      {loading 
        ? renderSkeletons()
        : products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              viewMode={viewMode} 
              onClick={() => onProductClick(product.id)}
            />
          ))
      }
    </div>
  );
};

export default ProductGrid;
