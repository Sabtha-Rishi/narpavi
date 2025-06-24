import React, { useState } from 'react';
import { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Copy, Edit } from 'lucide-react';
import { formatWeight, copyProductToClipboard, generateDescriptionFromData } from '@/lib/productUtils';
import DimensionsTable from './DimensionsTable';
import { useToast } from '@/components/ui/use-toast';
import ProductEditModal from './ProductEditModal';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdate?: (updatedProduct: Product) => void;
  displaySettings: {
    showStock: boolean;
    showPrice: boolean;
    showDimensions: boolean;
    showMaterial: boolean;
    showTags: boolean;
    showVendor: boolean;
  };
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, isOpen, onClose, onProductUpdate, displaySettings }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  if (!product) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const displayDescription = generateDescriptionFromData(product);
  
  // Check if description was generated (not from original product description)
  const isGeneratedDescription = !product.description || 
    typeof product.description !== 'string' || 
    !product.description.trim() || 
    product.description.trim().length < 5 ||
    product.description.toLowerCase().includes('nan') ||
    product.description === 'null' ||
    product.description === 'undefined';

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

  const handleCopyToClipboard = async () => {
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

  const handleEditProduct = () => {
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleProductSave = (updatedProduct: Product) => {
    if (onProductUpdate) {
      onProductUpdate(updatedProduct);
    }
    setIsEditModalOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background border-earthy-beige/50">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold text-earthy-brown">{product.name}</DialogTitle>
          
          {/* Action buttons in header */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditProduct}
              className="flex items-center gap-2 hover:bg-earthy-beige/20"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2 hover:bg-earthy-beige/20"
            >
              <Copy className="h-4 w-4" />
              Copy Details
            </Button>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Product Images */}
          <div className="space-y-2">
            <div className="product-detail-image-wrapper">
              {product.image_urls && product.image_urls.length > 0 ? (
                <>
                  <img
                    src={product.image_urls[activeImageIndex]}
                    alt={`${product.name} - Image ${activeImageIndex + 1}`}
                    className="product-detail-image"
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

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-3 w-full bg-earthy-beige/20">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="description"
                  className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="culture"
                  className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white"
                >
                  Cultural
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4 animate-slide-in">
                <p className="text-sm leading-relaxed">{displayDescription}</p>
                {isGeneratedDescription && (
                  <div className="mt-3 p-3 bg-earthy-beige/10 rounded-lg border-l-4 border-earthy-ochre">
                    <p className="text-xs text-earthy-brown/70 italic">
                      ✨ This description has been generated from available product details to provide you with comprehensive information about this beautiful artisan piece.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-4 animate-slide-in">
                <div className="space-y-4 text-sm">
                  {displaySettings.showMaterial && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-2">
                      <span className="font-medium text-earthy-brown">Material</span>
                      <span>{product.material}</span>
                    </div>
                  )}

                  {displaySettings.showDimensions && (
                    <div className="border-b border-earthy-beige/50 pb-4">
                      <div className="mb-3">
                      <span className="font-medium text-earthy-brown">Dimensions</span>
                      </div>
                      <div className="w-full">
                        <DimensionsTable product={product} />
                      </div>
                    </div>
                  )}

                  {product.weight && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-2">
                      <span className="font-medium text-earthy-brown">Weight</span>
                      <span>{formatWeight(product.weight)}</span>
                    </div>
                  )}

                  {product.sku && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-2">
                      <span className="font-medium text-earthy-brown">SKU</span>
                      <span className="font-mono text-xs bg-earthy-beige/20 px-2 py-1 rounded">{product.sku}</span>
                    </div>
                  )}

                  {displaySettings.showVendor && product.region_of_origin && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-2">
                      <span className="font-medium text-earthy-brown">Origin</span>
                      <span>{product.region_of_origin}</span>
                    </div>
                  )}

                  {displaySettings.showVendor && product.artisan && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-2">
                      <span className="font-medium text-earthy-brown">Artisan</span>
                      <span>{product.artisan}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-earthy-beige/50 pb-2">
                    <span className="font-medium text-earthy-brown">Category</span>
                    <span>{product.category}</span>
                  </div>

                  {product.subcategory && (
                    <div className="flex justify-between border-b border-earthy-beige/50 pb-2">
                      <span className="font-medium text-earthy-brown">Subcategory</span>
                      <span>{product.subcategory}</span>
                    </div>
                  )}

                  {displaySettings.showStock && (
                    <div className="flex justify-between">
                      <span className="font-medium text-earthy-brown">Stock</span>
                      <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
                      </span>
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

                  {!product.related_gods?.length && !product.occasions?.length && (!displaySettings.showTags || !product.tags?.length) && (
                    <p className="text-sm text-earthy-brown/60 italic">Cultural information not available for this product.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Edit Modal */}
        <ProductEditModal
          product={product}
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSave={handleProductSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;
