
import React, { useState } from 'react';
import { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  displaySettings: {
    showStock: boolean;
    showPrice: boolean;
    showDimensions: boolean;
    showMaterial: boolean;
    showTags: boolean;
    showVendor: boolean;
  };
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, isOpen, onClose, displaySettings }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  if (!product) return null;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  const handlePrevImage = () => {
    setActiveImageIndex((prev) => 
      prev === 0 ? (product.image_urls.length - 1) : prev - 1
    );
  };
  
  const handleNextImage = () => {
    setActiveImageIndex((prev) => 
      prev === (product.image_urls.length - 1) ? 0 : prev + 1
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] overflow-y-auto bg-background border-earthy-beige/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-earthy-brown">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Product Images */}
          <div className="space-y-2">
            <div className="relative aspect-square bg-earthy-beige/20 rounded-md overflow-hidden">
              {product.image_urls && product.image_urls.length > 0 ? (
                <>
                  <img 
                    src={product.image_urls[activeImageIndex]} 
                    alt={`${product.name} - Image ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {product.image_urls.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-earthy-brown hover:text-earthy-maroon rounded-full p-1.5 transition-all duration-300"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-earthy-brown hover:text-earthy-maroon rounded-full p-1.5 transition-all duration-300"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-earthy-brown/60">No image available</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all duration-300 ${
                      index === activeImageIndex ? 'border-earthy-brown' : 'border-earthy-beige/50 hover:border-earthy-beige'
                    }`}
                  >
                    <img 
                      src={url} 
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-4">
            {displaySettings.showPrice && (
              <div className="flex items-baseline gap-2">
                {product.discounted_price ? (
                  <>
                    <span className="text-2xl font-bold text-earthy-maroon">{formatCurrency(product.discounted_price)}</span>
                    <span className="text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-earthy-maroon">{formatCurrency(product.price)}</span>
                )}
              </div>
            )}
            
            {displaySettings.showStock && (
              <div className="text-sm">
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600">
                    In stock ({product.stock_quantity} available)
                  </span>
                ) : (
                  <span className="text-red-500">Out of stock</span>
                )}
              </div>
            )}
            
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid grid-cols-3 w-full bg-earthy-beige/20">
                <TabsTrigger 
                  value="description"
                  className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger 
                  value="details"
                  className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="culture"
                  className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white"
                >
                  Cultural
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4 animate-slide-in">
                <p className="text-sm leading-relaxed">{product.description}</p>
              </TabsContent>
              
              <TabsContent value="details" className="mt-4 animate-slide-in">
                <div className="space-y-2 text-sm">
                  {displaySettings.showMaterial && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-1">
                      <span className="font-medium text-earthy-brown">Material</span>
                      <span>{product.material}</span>
                    </div>
                  )}
                  
                  {displaySettings.showDimensions && product.dimensions && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-1">
                      <span className="font-medium text-earthy-brown">Dimensions</span>
                      <span>{product.dimensions}</span>
                    </div>
                  )}
                  
                  {product.weight && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-1">
                      <span className="font-medium text-earthy-brown">Weight</span>
                      <span>{product.weight}</span>
                    </div>
                  )}
                  
                  {displaySettings.showVendor && product.region_of_origin && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-1">
                      <span className="font-medium text-earthy-brown">Origin</span>
                      <span>{product.region_of_origin}</span>
                    </div>
                  )}
                  
                  {displaySettings.showVendor && product.artisan && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-1">
                      <span className="font-medium text-earthy-brown">Artisan</span>
                      <span>{product.artisan}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-b border-earthy-beige/50 pb-1">
                    <span className="font-medium text-earthy-brown">Category</span>
                    <span>{product.category}</span>
                  </div>
                  
                  {product.subcategory && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-1">
                      <span className="font-medium text-earthy-brown">Subcategory</span>
                      <span>{product.subcategory}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="culture" className="mt-4 animate-slide-in">
                <div className="space-y-3 text-sm">
                  {product.related_gods && product.related_gods.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-1 text-earthy-brown">Related Gods/Deities:</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.related_gods.map((god) => (
                          <span key={god} className="bg-earthy-beige/40 text-earthy-brown px-2 py-0.5 rounded-full text-xs">
                            {god}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {product.occasions && product.occasions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-1 text-earthy-brown">Occasions/Festivals:</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.occasions.map((occasion) => (
                          <span key={occasion} className="bg-earthy-beige/40 text-earthy-brown px-2 py-0.5 rounded-full text-xs">
                            {occasion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {displaySettings.showTags && product.tags && product.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-1 text-earthy-brown">Tags:</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag) => (
                          <span key={tag} className="bg-earthy-beige/40 text-earthy-brown px-2 py-0.5 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="pt-4">
              <Button className="w-full bg-earthy-brown hover:bg-earthy-brown/90 text-white">
                Contact for Purchase
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This is a catalog website. Please contact us to purchase this item.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;
