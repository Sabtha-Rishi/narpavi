
import React from 'react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode, onClick }) => {
  return (
    <div 
      className={`product-card cursor-pointer animate-fade-in ${
        viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
      }`}
      onClick={onClick}
    >
      <div 
        className={`product-image-wrapper ${
          viewMode === 'list' ? 'md:w-1/3' : ''
        }`}
      >
        {product.image_urls && product.image_urls.length > 0 ? (
          <img 
            src={product.image_urls[0]} 
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
        
        {product.is_bestseller && (
          <span className="product-badge bg-accent">Best Seller</span>
        )}
        
        {!product.is_bestseller && product.is_new_arrival && (
          <span className="product-badge bg-primary">New Arrival</span>
        )}
      </div>
      
      <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'md:w-2/3' : ''}`}>
        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
        
        {viewMode === 'list' && (
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{product.description}</p>
        )}
        
        <div className="flex items-center mt-1 text-sm text-muted-foreground">
          <span>{product.material}</span>
          {product.region_of_origin && (
            <>
              <span className="mx-1">•</span>
              <span>{product.region_of_origin}</span>
            </>
          )}
        </div>
        
        <div className="mt-2 flex items-center">
          {product.discounted_price ? (
            <>
              <span className="font-bold">{formatCurrency(product.discounted_price)}</span>
              <span className="ml-2 text-muted-foreground text-sm line-through">
                {formatCurrency(product.price)}
              </span>
            </>
          ) : (
            <span className="font-bold">{formatCurrency(product.price)}</span>
          )}
        </div>
        
        {viewMode === 'list' && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.related_gods?.map((god) => (
              <span key={god} className="inline-block bg-secondary px-2 py-0.5 text-xs rounded-full">
                {god}
              </span>
            ))}
            
            {product.occasions?.map((occasion) => (
              <span key={occasion} className="inline-block bg-secondary px-2 py-0.5 text-xs rounded-full">
                {occasion}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
