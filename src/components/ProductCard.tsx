import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { calculateDiscountPercentage, getStockDisplay, formatWeight, copyProductToClipboard, generateDescriptionFromData } from '@/lib/productUtils';
import DimensionsTable from './DimensionsTable';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const [isHovered, setIsHovered] = useState(false);
  const [secondImageLoaded, setSecondImageLoaded] = useState(false);
  
  const discountPercentage = product.discounted_price
    ? calculateDiscountPercentage(product.price, product.discounted_price)
    : 0;

  const stockInfo = getStockDisplay(product);
  const { toast } = useToast();

  // Preload second image if available
  useEffect(() => {
    if (product.image_urls && product.image_urls.length > 1) {
      const img = new Image();
      img.onload = () => setSecondImageLoaded(true);
      img.src = product.image_urls[1];
    }
  }, [product.image_urls]);

  const handleCopyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyProductToClipboard(product);
    if (success) {
      toast({
        title: "Copied to clipboard!",
        description: "Product details copied. You can now paste and share on any platform.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Determine which image to show
  const hasSecondImage = product.image_urls && product.image_urls.length > 1 && secondImageLoaded;
  const currentImageUrl = (isHovered && hasSecondImage) 
    ? product.image_urls[1] 
    : product.image_urls?.[0];

  return (
    <div
      className={`product-card animate-fade-in cursor-pointer flex flex-col ${viewMode === 'list' ? 'md:flex-row' : ''} relative group`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Copy button - Show on hover */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg backdrop-blur-sm"
          onClick={handleCopyToClipboard}
          title="Copy product details"
        >
          <Copy className="h-4 w-4 text-earthy-brown" />
        </Button>
      </div>

      <div
        className={`product-image-wrapper relative ${
          viewMode === 'list'
            ? 'md:w-1/3 md:max-w-[200px]' // Fixed width for list view
            : 'w-full'
        }`}
      >
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-earthy-beige/20">
            <span className="text-earthy-brown/60">No image available</span>
          </div>
        )}

        {/* Image indicator dots */}
        {hasSecondImage && viewMode === 'grid' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${!isHovered ? 'bg-white' : 'bg-white/50'}`} />
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isHovered ? 'bg-white' : 'bg-white/50'}`} />
          </div>
        )}

        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-earthy-maroon text-white text-sm px-2 py-1 rounded-full z-[5]">
            -{discountPercentage}%
          </span>
        )}

        {product.is_bestseller && (
          <span className="absolute top-2 left-2 bg-earthy-gold text-earthy-brown text-xs font-medium px-2 py-1 rounded-full z-[5]">
            Best Seller
          </span>
        )}

        {!product.is_bestseller && product.is_new_arrival && (
          <span className="absolute top-2 left-2 bg-earthy-ochre text-white text-xs font-medium px-2 py-1 rounded-full z-[5]">
            New Arrival
          </span>
        )}
      </div>

      <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'md:w-2/3' : ''} flex-grow`}>
        <h3 className="font-semibold text-foreground text-lg line-clamp-2 group-hover:text-earthy-brown">
          {product.name}
        </h3>

        {viewMode === 'list' && (
          <p className="text-muted-foreground text-sm line-clamp-2 mt-2">
            {generateDescriptionFromData(product)}
          </p>
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
                  <span className="font-bold text-lg text-earthy-maroon">
                    {formatCurrency(product.discounted_price)}
                  </span>
                  <span className="ml-2 text-muted-foreground text-sm line-through">
                    {formatCurrency(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-lg text-earthy-maroon">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          )}

          {displaySettings.showStock && (
            <div className={`text-xs mt-1 ${stockInfo.color}`}>
              {stockInfo.text}
            </div>
          )}

          {displaySettings.showDimensions && (
            <div className="mt-2">
              <DimensionsTable product={product} compact={true} />
            </div>
          )}

          {/* Weight display with improved formatting */}
          {product.weight && viewMode === 'list' && (
            <div className="text-xs text-earthy-brown/70 mt-1">
              <span className="font-medium">Weight: </span>
              {formatWeight(product.weight)}
            </div>
          )}

          {/* SKU display for list view */}
          {product.sku && viewMode === 'list' && (
            <div className="text-xs text-earthy-brown/60 mt-1">
              <span className="font-medium">SKU: </span>
              {product.sku}
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
