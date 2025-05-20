
import React from 'react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { calculateDiscountPercentage, getStockDisplay } from '@/lib/productUtils';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  displaySettings: {
    showStock: boolean;
    showPrice: boolean;
    showDimensions: boolean;
    showMaterial: boolean;
    showTags: boolean;
    showVendor: boolean;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode, 
  onClick,
  displaySettings 
}) => {
  const discountPercentage = product.discounted_price 
    ? calculateDiscountPercentage(product.price, product.discounted_price)
    : 0;
    
  const stockInfo = getStockDisplay(product);

  return (
    <div 
      className={`product-card animate-fade-in cursor-pointer flex flex-col ${
        viewMode === 'list' ? 'md:flex-row' : ''
      }`}
      onClick={onClick}
    >
      <div 
        className={`product-image-wrapper ${
          viewMode === 'list' ? 'md:w-1/3 h-[200px] md:h-auto' : 'h-[200px] sm:h-[220px]'
        }`}
      >
        {product.image_urls && product.image_urls.length > 0 ? (
          <img 
            src={product.image_urls[0]} 
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-earthy-beige/20">
            <span className="text-earthy-brown/60">No image available</span>
          </div>
        )}
        
        {discountPercentage > 0 && (
          <span className="absolute top-2 right-2 bg-earthy-maroon text-white text-sm px-2 py-1 rounded-full">
            -{discountPercentage}%
          </span>
        )}
        
        {product.is_bestseller && (
          <span className="absolute top-2 left-2 bg-earthy-gold text-earthy-brown text-xs font-medium px-2 py-1 rounded-full">
            Best Seller
          </span>
        )}
        
        {!product.is_bestseller && product.is_new_arrival && (
          <span className="absolute top-2 left-2 bg-earthy-ochre text-white text-xs font-medium px-2 py-1 rounded-full">
            New Arrival
          </span>
        )}
      </div>
      
      <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'md:w-2/3' : ''} flex-grow`}>
        <h3 className="font-semibold text-foreground text-lg line-clamp-2 group-hover:text-earthy-brown">{product.name}</h3>
        
        {viewMode === 'list' && (
          <p className="text-muted-foreground text-sm line-clamp-2 mt-2">{product.description}</p>
        )}
        
        {displaySettings.showMaterial && (
          <div className="flex items-center mt-2 text-sm text-earthy-brown/70">
            {product.material && <span>{product.material}</span>}
            
            {displaySettings.showVendor && product.region_of_origin && (
              <>
                <span className="mx-1">•</span>
                <span>{product.region_of_origin}</span>
              </>
            )}
          </div>
        )}
        
        <div className="mt-auto pt-3">
          {displaySettings.showPrice && (
            <div className="flex items-baseline">
              {product.discounted_price ? (
                <>
                  <span className="font-bold text-lg text-earthy-maroon">{formatCurrency(product.discounted_price)}</span>
                  <span className="ml-2 text-muted-foreground text-sm line-through">
                    {formatCurrency(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-lg text-earthy-maroon">{formatCurrency(product.price)}</span>
              )}
            </div>
          )}
          
          {displaySettings.showStock && (
            <div className={`text-xs mt-1 ${stockInfo.color}`}>
              {stockInfo.text}
            </div>
          )}

          {displaySettings.showDimensions && product.dimensions && (
            <div className="text-xs text-earthy-brown/70 mt-1">
              {product.dimensions}
            </div>
          )}
        </div>
        
        {viewMode === 'list' && displaySettings.showTags && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.related_gods?.map((god) => (
              <span key={god} className="inline-block bg-earthy-beige/40 text-earthy-brown px-2 py-0.5 text-xs rounded-full">
                {god}
              </span>
            ))}
            
            {product.occasions?.map((occasion) => (
              <span key={occasion} className="inline-block bg-earthy-beige/40 text-earthy-brown px-2 py-0.5 text-xs rounded-full">
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
