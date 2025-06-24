import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, X, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PinVerificationModal from './PinVerificationModal';

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [loading, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const { toast } = useToast();

  // Reset form data when modal opens or product changes
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        ...product,
        tags: product.tags || [],
        image_urls: product.image_urls || [],
        related_gods: product.related_gods || [],
        occasions: product.occasions || []
      });
      // Also reset temporary input states
      setNewTag('');
      setNewImageUrl('');
      setPendingSave(false);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && formData.tags) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && formData.image_urls) {
      setFormData(prev => ({
        ...prev,
        image_urls: [...(prev.image_urls || []), newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImageUrl = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls?.filter(url => url !== urlToRemove) || []
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.material) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Show PIN verification modal
    setPendingSave(true);
    setIsPinModalOpen(true);
  };

  const handlePinVerified = async () => {
    if (!pendingSave) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          discounted_price: formData.discounted_price || null,
          category: formData.category,
          subcategory: formData.subcategory || null,
          material: formData.material,
          region_of_origin: formData.region_of_origin || null,
          artisan: formData.artisan || null,
          dimensions: formData.dimensions || null,
          weight: formData.weight || null,
          stock_quantity: formData.stock_quantity || 0,
          tags: formData.tags || [],
          image_urls: formData.image_urls || [],
          related_gods: formData.related_gods || [],
          occasions: formData.occasions || [],
          is_featured: formData.is_featured || false,
          is_bestseller: formData.is_bestseller || false,
          is_new_arrival: formData.is_new_arrival || false,
          is_visible: formData.is_visible !== undefined ? formData.is_visible : true,
          sku: formData.sku || null,
          width_in: formData.width_in || null,
          height_in: formData.height_in || null,
          depth_in: formData.depth_in || null
        })
        .eq('id', product.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      onSave(data as Product);
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setPendingSave(false);
    }
  };

  const handlePinModalClose = () => {
    setIsPinModalOpen(false);
    setPendingSave(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background border-earthy-beige/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-earthy-brown">
            Edit Product: {product.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-earthy-beige/20">
            <TabsTrigger value="basic" className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white">
              Media & Tags
            </TabsTrigger>
            <TabsTrigger value="dimensions" className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white">
              Dimensions
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="border-earthy-beige/70 focus:ring-earthy-brown/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discounted_price">Discounted Price (₹)</Label>
                <Input
                  id="discounted_price"
                  type="number"
                  step="0.01"
                  value={formData.discounted_price || ''}
                  onChange={(e) => handleInputChange('discounted_price', parseFloat(e.target.value) || null)}
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity || 0}
                  onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory || ''}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material *</Label>
                <Input
                  id="material"
                  value={formData.material || ''}
                  onChange={(e) => handleInputChange('material', e.target.value)}
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region_of_origin">Region of Origin</Label>
                <Input
                  id="region_of_origin"
                  value={formData.region_of_origin || ''}
                  onChange={(e) => handleInputChange('region_of_origin', e.target.value)}
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="artisan">Artisan</Label>
              <Input
                id="artisan"
                value={formData.artisan || ''}
                onChange={(e) => handleInputChange('artisan', e.target.value)}
                className="border-earthy-beige/70 focus:ring-earthy-brown/20"
              />
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Product Images</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                  />
                  <Button
                    type="button"
                    onClick={handleAddImageUrl}
                    size="sm"
                    className="bg-earthy-brown hover:bg-earthy-brown/90"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.image_urls?.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        onClick={() => handleRemoveImageUrl(url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    size="sm"
                    className="bg-earthy-brown hover:bg-earthy-brown/90"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-earthy-beige/30">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dimensions" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (Text)</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions || ''}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="e.g., 10″ x 6″ x 4″"
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="e.g., 1.2 kg"
                  className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Precise Dimensions (inches)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width_in">Width (in)</Label>
                  <Input
                    id="width_in"
                    type="number"
                    step="0.1"
                    value={formData.width_in || ''}
                    onChange={(e) => handleInputChange('width_in', parseFloat(e.target.value) || null)}
                    className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height_in">Height (in)</Label>
                  <Input
                    id="height_in"
                    type="number"
                    step="0.1"
                    value={formData.height_in || ''}
                    onChange={(e) => handleInputChange('height_in', parseFloat(e.target.value) || null)}
                    className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="depth_in">Depth (in)</Label>
                  <Input
                    id="depth_in"
                    type="number"
                    step="0.1"
                    value={formData.depth_in || ''}
                    onChange={(e) => handleInputChange('depth_in', parseFloat(e.target.value) || null)}
                    className="border-earthy-beige/70 focus:ring-earthy-brown/20"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_visible">Product Visible</Label>
                <Switch
                  id="is_visible"
                  checked={formData.is_visible !== false}
                  onCheckedChange={(checked) => handleInputChange('is_visible', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured">Featured Product</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured || false}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is_bestseller">Bestseller</Label>
                <Switch
                  id="is_bestseller"
                  checked={formData.is_bestseller || false}
                  onCheckedChange={(checked) => handleInputChange('is_bestseller', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is_new_arrival">New Arrival</Label>
                <Switch
                  id="is_new_arrival"
                  checked={formData.is_new_arrival || false}
                  onCheckedChange={(checked) => handleInputChange('is_new_arrival', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-earthy-beige hover:border-earthy-brown"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-earthy-brown hover:bg-earthy-brown/90 text-white"
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>

        {/* PIN Verification Modal */}
        <PinVerificationModal
          isOpen={isPinModalOpen}
          onClose={handlePinModalClose}
          onVerify={handlePinVerified}
          title="Confirm Product Update"
          description="Please enter your PIN to save the product changes."
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditModal; 