
import React from 'react';
import { Product, ViewMode } from '@/types';
import ProductCard from './ProductCard';
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: Product[];
  viewMode: ViewMode;
  loading: boolean;
  onProductClick: (productId: number) => void;
  displaySettings: {
    showStock: boolean;
    showPrice: boolean;
    showDimensions: boolean;
    showMaterial: boolean;
    showTags: boolean;
    showVendor: boolean;
  };
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  viewMode, 
  loading, 
  onProductClick,
  displaySettings
}) => {
  // Create loading skeletons
  const renderSkeletons = () => {
    const skeletons = Array(12).fill(0);
    
    return skeletons.map((_, index) => (
      <div 
        key={index} 
        className={`product-card ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}
      >
        <div className={`product-image-wrapper ${viewMode === 'list' ? 'md:w-1/3' : ''} h-[200px]`}>
          <Skeleton className="w-full h-full bg-earthy-beige/30" />
        </div>
        <div className={`p-4 ${viewMode === 'list' ? 'md:w-2/3' : ''}`}>
          <Skeleton className="h-6 w-3/4 mb-2 bg-earthy-beige/30" />
          {viewMode === 'list' && (
            <>
              <Skeleton className="h-4 w-full mb-2 bg-earthy-beige/30" />
              <Skeleton className="h-4 w-5/6 mb-4 bg-earthy-beige/30" />
            </>
          )}
          <Skeleton className="h-4 w-1/2 mt-1 bg-earthy-beige/30" />
          <Skeleton className="h-5 w-1/4 mt-2 bg-earthy-beige/30" />
        </div>
      </div>
    ));
  };

  // If no products and not loading, show empty state
  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <h3 className="text-xl font-medium mb-2 text-earthy-brown">No products found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria to find what you're looking for.
        </p>
      </div>
    );
  }

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
              displaySettings={displaySettings}
            />
          ))
      }
    </div>
  );
};

export default ProductGrid;
