import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Package, EyeOff, AlertCircle, Search, X, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PinVerificationModal from './PinVerificationModal';

interface BulkEditModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface BulkUpdateData {
  price?: number;
  discounted_price?: number;
  stock_quantity?: number;
  is_visible?: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({ 
  products, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [updateData, setUpdateData] = useState<BulkUpdateData>({});
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Set<keyof BulkUpdateData>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  
  const { toast } = useToast();

  // Fetch all products when modal opens and reset selection
  useEffect(() => {
    if (isOpen) {
      if (allProducts.length === 0) {
        fetchAllProducts();
      }
      // Reset selection and filters when modal opens
      setSelectedProducts(new Set());
      setSearchTerm('');
      setCategoryFilter('all');
      setVisibilityFilter('all');
      setShowSelectedOnly(false);
      setFieldsToUpdate(new Set());
      setUpdateData({});
    }
  }, [isOpen]);

  const fetchAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Advanced search and filtering
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Text search across multiple fields
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        const searchableText = [
          product.name,
          product.sku,
          product.category,
          product.material,
          product.artisan,
          product.region_of_origin,
          ...(product.tags || []),
          product.price?.toString(),
          product.stock_quantity?.toString()
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(searchLower);
      });
    }



    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Visibility filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (visibilityFilter === 'visible') return product.is_visible !== false;
        if (visibilityFilter === 'hidden') return product.is_visible === false;
        return true;
      });
    }

    // Show only selected products if toggle is on
    if (showSelectedOnly) {
      filtered = filtered.filter(product => selectedProducts.has(product.id));
    }

    return filtered;
  }, [allProducts, searchTerm, categoryFilter, visibilityFilter, showSelectedOnly, selectedProducts]);

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    return [...new Set(allProducts.map(p => p.category))].sort();
  }, [allProducts]);

  const handleProductSelection = (productId: number, checked: boolean) => {
    const newSelection = new Set(selectedProducts);
    if (checked) {
      newSelection.add(productId);
    } else {
      newSelection.delete(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      // Add all filtered products to selection
      const newSelection = new Set(selectedProducts);
      filteredProducts.forEach(p => newSelection.add(p.id));
      setSelectedProducts(newSelection);
    } else {
      // Remove all filtered products from selection
      const newSelection = new Set(selectedProducts);
      filteredProducts.forEach(p => newSelection.delete(p.id));
      setSelectedProducts(newSelection);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setVisibilityFilter('all');
    setShowSelectedOnly(false);
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  const handleFieldToggle = (field: keyof BulkUpdateData, enabled: boolean) => {
    const newFields = new Set(fieldsToUpdate);
    if (enabled) {
      newFields.add(field);
    } else {
      newFields.delete(field);
    }
    setFieldsToUpdate(newFields);
  };

  const handleValueChange = (field: keyof BulkUpdateData, value: any) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one product to update.",
        variant: "destructive",
      });
      return;
    }

    if (fieldsToUpdate.size === 0) {
      toast({
        title: "No Fields Selected",
        description: "Please select at least one field to update.",
        variant: "destructive",
      });
      return;
    }

    // Show PIN verification modal
    setPendingUpdate(true);
    setIsPinModalOpen(true);
  };

  const handlePinVerified = async () => {
    if (!pendingUpdate) return;

    setLoading(true);
    try {
      // Build update object with only selected fields
      const updateObject: any = {};
      fieldsToUpdate.forEach(field => {
        if (updateData[field] !== undefined) {
          updateObject[field] = updateData[field];
        }
      });

      // Update all selected products
      const { error } = await supabase
        .from('products')
        .update(updateObject)
        .in('id', Array.from(selectedProducts));

      if (error) throw error;

      toast({
        title: "Success",
        description: `Updated ${selectedProducts.size} products successfully!`,
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: "Error",
        description: "Failed to update products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPendingUpdate(false);
    }
  };

  const handlePinModalClose = () => {
    setIsPinModalOpen(false);
    setPendingUpdate(false);
  };

  const selectedCount = selectedProducts.size;
  const totalCount = allProducts.length;
  const filteredCount = filteredProducts.length;
  const selectedFromFiltered = filteredProducts.filter(p => selectedProducts.has(p.id)).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background border-earthy-beige/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-earthy-brown flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bulk Edit Products
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select products and update their properties in bulk. {selectedCount} selected • {filteredCount} shown • {totalCount} total
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Search Bar - Compact */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products by name, SKU, category, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-earthy-beige/70 focus:ring-earthy-brown/20"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 border-earthy-beige/70">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-32 border-earthy-beige/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={showSelectedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                className={showSelectedOnly 
                  ? "bg-earthy-brown hover:bg-earthy-brown/90 text-white" 
                  : "border-earthy-beige hover:border-earthy-brown"
                }
                disabled={selectedCount === 0}
              >
                {showSelectedOnly ? 'Show All' : `Selected (${selectedCount})`}
              </Button>

              {(searchTerm || categoryFilter !== 'all' || visibilityFilter !== 'all' || showSelectedOnly) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-earthy-beige hover:border-earthy-brown"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Selection - Left Column */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {!showSelectedOnly ? (
                    <>
                      <Checkbox
                        id="select-all-visible"
                        checked={selectedFromFiltered === filteredCount && filteredCount > 0}
                        onCheckedChange={handleSelectAllVisible}
                      />
                      <Label htmlFor="select-all-visible" className="text-sm font-medium">
                        Select All Visible ({filteredCount})
                      </Label>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-earthy-brown">Selected Products</h4>
                      <Badge variant="secondary" className="bg-earthy-beige/30">
                        {selectedCount} items
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {showSelectedOnly && selectedCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="border-red-200 hover:border-red-300 text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </Button>
                  )}
                  {!showSelectedOnly && (
                    <Badge variant="secondary" className="bg-earthy-beige/30">
                      {selectedCount} selected
                    </Badge>
                  )}
                </div>
              </div>

              {loadingProducts ? (
                <div className="h-96 flex items-center justify-center border border-earthy-beige/50 rounded-md">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earthy-brown mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading products...</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-96 border border-earthy-beige/50 rounded-md">
                  <div className="p-3">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        {showSelectedOnly ? (
                          <>
                            <p className="text-lg font-medium mb-1">No products selected</p>
                            <p className="text-sm">Select products from the "Show All" view to see them here</p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-medium mb-1">No products found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredProducts.map((product) => (
                          <div key={product.id} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            selectedProducts.has(product.id) 
                              ? 'bg-earthy-beige/20 border border-earthy-beige/50' 
                              : 'hover:bg-earthy-beige/10'
                          }`}>
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={selectedProducts.has(product.id)}
                              onCheckedChange={(checked) => handleProductSelection(product.id, checked as boolean)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm truncate">{product.name}</p>
                                {!product.is_visible && <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                                {product.is_featured && <Badge variant="secondary" className="text-xs flex-shrink-0">Featured</Badge>}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-semibold">₹{product.price}</span>
                                <span>•</span>
                                <span>Stock: {product.stock_quantity}</span>
                                <span>•</span>
                                <span className="truncate">{product.category}</span>
                                {product.sku && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-xs bg-gray-100 px-1 rounded">{product.sku}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Bulk Edit Form - Right Column */}
            <div className="space-y-3">
              <div className="mb-3">
                <h3 className="text-lg font-medium text-earthy-brown">Bulk Edit</h3>
                {selectedCount > 0 && (
                  <p className="text-sm text-muted-foreground">{selectedCount} products selected</p>
                )}
              </div>
              
              {selectedCount === 0 ? (
                <div className="h-80 flex items-center justify-center p-6 border-2 border-dashed border-earthy-beige/50 rounded-lg">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">Select products to start bulk editing</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <Tabs defaultValue="pricing" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-earthy-beige/20">
                <TabsTrigger value="pricing" className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white">
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="inventory" className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white">
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="attributes" className="data-[state=active]:bg-earthy-brown data-[state=active]:text-white">
                  Attributes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="update-price"
                        checked={fieldsToUpdate.has('price')}
                        onCheckedChange={(checked) => handleFieldToggle('price', checked as boolean)}
                      />
                      <Label htmlFor="update-price">Update Price</Label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="New price"
                      value={updateData.price || ''}
                      onChange={(e) => handleValueChange('price', parseFloat(e.target.value) || 0)}
                      className="w-24 border-earthy-beige/70"
                      disabled={!fieldsToUpdate.has('price')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="update-discounted-price"
                        checked={fieldsToUpdate.has('discounted_price')}
                        onCheckedChange={(checked) => handleFieldToggle('discounted_price', checked as boolean)}
                      />
                      <Label htmlFor="update-discounted-price">Update Discounted Price</Label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Discounted price"
                      value={updateData.discounted_price || ''}
                      onChange={(e) => handleValueChange('discounted_price', parseFloat(e.target.value) || null)}
                      className="w-24 border-earthy-beige/70"
                      disabled={!fieldsToUpdate.has('discounted_price')}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="update-stock"
                        checked={fieldsToUpdate.has('stock_quantity')}
                        onCheckedChange={(checked) => handleFieldToggle('stock_quantity', checked as boolean)}
                      />
                      <Label htmlFor="update-stock">Update Stock Quantity</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={updateData.stock_quantity || ''}
                      onChange={(e) => handleValueChange('stock_quantity', parseInt(e.target.value) || 0)}
                      className="w-20 border-earthy-beige/70"
                      disabled={!fieldsToUpdate.has('stock_quantity')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="update-visibility"
                        checked={fieldsToUpdate.has('is_visible')}
                        onCheckedChange={(checked) => handleFieldToggle('is_visible', checked as boolean)}
                      />
                      <Label htmlFor="update-visibility">Update Visibility</Label>
                    </div>
                    <Switch
                      checked={updateData.is_visible || false}
                      onCheckedChange={(checked) => handleValueChange('is_visible', checked)}
                      disabled={!fieldsToUpdate.has('is_visible')}
                      className="data-[state=checked]:bg-earthy-brown"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attributes" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="update-featured"
                        checked={fieldsToUpdate.has('is_featured')}
                        onCheckedChange={(checked) => handleFieldToggle('is_featured', checked as boolean)}
                      />
                      <Label htmlFor="update-featured">Featured</Label>
                    </div>
                    <Switch
                      checked={updateData.is_featured || false}
                      onCheckedChange={(checked) => handleValueChange('is_featured', checked)}
                      disabled={!fieldsToUpdate.has('is_featured')}
                      className="data-[state=checked]:bg-earthy-brown"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="update-bestseller"
                        checked={fieldsToUpdate.has('is_bestseller')}
                        onCheckedChange={(checked) => handleFieldToggle('is_bestseller', checked as boolean)}
                      />
                      <Label htmlFor="update-bestseller">Bestseller</Label>
                    </div>
                    <Switch
                      checked={updateData.is_bestseller || false}
                      onCheckedChange={(checked) => handleValueChange('is_bestseller', checked)}
                      disabled={!fieldsToUpdate.has('is_bestseller')}
                      className="data-[state=checked]:bg-earthy-brown"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="update-new-arrival"
                        checked={fieldsToUpdate.has('is_new_arrival')}
                        onCheckedChange={(checked) => handleFieldToggle('is_new_arrival', checked as boolean)}
                      />
                      <Label htmlFor="update-new-arrival">New Arrival</Label>
                    </div>
                    <Switch
                      checked={updateData.is_new_arrival || false}
                      onCheckedChange={(checked) => handleValueChange('is_new_arrival', checked)}
                      disabled={!fieldsToUpdate.has('is_new_arrival')}
                      className="data-[state=checked]:bg-earthy-brown"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {fieldsToUpdate.size > 0 && (
              <div className="mt-4 p-3 bg-earthy-beige/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-earthy-brown">
                  <AlertCircle className="h-4 w-4" />
                  <span>Will update {fieldsToUpdate.size} field(s) for {selectedCount} product(s)</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Array.from(fieldsToUpdate).map(field => (
                    <Badge key={field} variant="secondary" className="bg-earthy-beige/30">
                      {field.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
                   )}
                 </div>
               )}
             </div>
           </div>
         </div>

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
            disabled={loading || selectedCount === 0 || fieldsToUpdate.size === 0}
            className="bg-earthy-brown hover:bg-earthy-brown/90 text-white"
          >
            {loading ? (
              <>Updating...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update {selectedCount} Products
              </>
            )}
          </Button>
        </DialogFooter>

        {/* PIN Verification Modal */}
        <PinVerificationModal
          isOpen={isPinModalOpen}
          onClose={handlePinModalClose}
          onVerify={handlePinVerified}
          title="Confirm Bulk Update"
          description={`Please enter your PIN to update ${selectedCount} products.`}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditModal; 