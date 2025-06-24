import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import ProductFilters from '@/components/ProductFilters';
import ProductDetail from '@/components/ProductDetail';
import SettingsModal from '@/components/SettingsModal';
import BulkEditModal from '@/components/BulkEditModal';
import { Button } from '@/components/ui/button';
import { FilterOptions, ViewMode, Product } from '@/types';
import { useProducts, useSingleProduct } from '@/hooks/useSupabaseProducts';
import { useFilterOptions } from '@/hooks/useSupabaseProducts';
import { List, LayoutGrid } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Pagination } from '@/components/ui/pagination';

const Index: React.FC = () => {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  
  // Display settings with defaults - dimensions now visible by default
  const [displaySettings, setDisplaySettings] = useState({
    showStock: true,
    showPrice: true,
    showDimensions: true,
    showMaterial: true,
    showTags: true,
    showVendor: true
  });

  // Product visibility settings
  const [visibilitySettings, setVisibilitySettings] = useState({
    mode: 'all' as 'all' | 'visible' | 'hidden'
  });
  
  const pageSize = 12;
  
  // Memoized filters object that includes search query, advanced filters, and visibility
  const activeFilters = useMemo(() => {
    const baseFilters = { ...filters, search: searchQuery };
    
    // Add visibility filtering
    if (visibilitySettings.mode === 'visible') {
      baseFilters.visibility = 'visible';
    } else if (visibilitySettings.mode === 'hidden') {
      baseFilters.visibility = 'hidden';
    }
    
    return baseFilters;
  }, [filters, searchQuery, visibilitySettings.mode]);
  
  // Load products with memoized filters
  const { products, totalCount, loading: productsLoading } = useProducts(
    activeFilters,
    currentPage, 
    pageSize
  );
  
  // Load filter options
  const { filterOptions, loading: filtersLoading } = useFilterOptions();
  
  // Load selected product details
  const { product: selectedProduct } = useSingleProduct(selectedProductId);
  
  // Calculate total pages
  const totalPages = Math.ceil((totalCount || 0) / pageSize);
  
  // Handlers
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);
  
  const handleSortChange = useCallback((value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      sort: value as FilterOptions['sort'] 
    }));
    setCurrentPage(1);
  }, []);
  
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  const handleProductClick = useCallback((productId: number) => {
    setSelectedProductId(productId);
    setIsDetailOpen(true);
  }, []);
  
  const handleProductDetailClose = useCallback(() => {
    setIsDetailOpen(false);
  }, []);
  
  const handleSettingsOpen = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);
  
  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleBulkEditOpen = useCallback(() => {
    setIsBulkEditOpen(true);
  }, []);

  const handleBulkEditClose = useCallback(() => {
    setIsBulkEditOpen(false);
  }, []);

  const handleBulkEditUpdate = useCallback(() => {
    // Refresh the products list after bulk update
    // The useProducts hook will automatically refetch
    setIsBulkEditOpen(false);
  }, []);
  
  const handleSettingsChange = useCallback((newSettings: typeof displaySettings) => {
    setDisplaySettings(newSettings);
    localStorage.setItem('displaySettings', JSON.stringify(newSettings));
  }, []);

  const handleVisibilitySettingsChange = useCallback((newSettings: typeof visibilitySettings) => {
    setVisibilitySettings(newSettings);
    localStorage.setItem('visibilitySettings', JSON.stringify(newSettings));
  }, []);
  
  const handleAdvancedSearch = useCallback((advancedFilters: {
    widthSearch?: string;
    heightSearch?: string;
    depthSearch?: string;
    skuSearch?: string;
    weightSearch?: string;
    widthRange?: { min: number; max: number };
    heightRange?: { min: number; max: number };
    depthRange?: { min: number; max: number };
    weightRange?: { min: number; max: number };
  }) => {
    setFilters(prev => ({ 
      ...prev, 
      ...advancedFilters 
    }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleProductUpdate = useCallback((updatedProduct: Product) => {
    // Optionally refresh the products list or update the local state
    // For now, we'll just close the detail modal and let the user know
    setIsDetailOpen(false);
    setSelectedProductId(null);
  }, []);
  
  // Load saved settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('displaySettings');
    if (savedSettings) {
      try {
        setDisplaySettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved display settings:', error);
      }
    }

    const savedVisibilitySettings = localStorage.getItem('visibilitySettings');
    if (savedVisibilitySettings) {
      try {
        setVisibilitySettings(JSON.parse(savedVisibilitySettings));
      } catch (error) {
        console.error('Error parsing saved visibility settings:', error);
      }
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        openSettings={handleSettingsOpen}
        onAdvancedSearch={handleAdvancedSearch}
      />
      
      <main className="container mx-auto px-4 py-6 sm:py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters
              filterOptions={filterOptions}
              currentFilters={filters}
              onChange={handleFilterChange}
              loading={filtersLoading}
            />
          </aside>
          
          {/* Main Content */}
          <div className="flex-grow">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-semibold text-earthy-brown">All Products</h1>
                <p className="text-sm text-muted-foreground">
                  {productsLoading 
                    ? 'Loading products...' 
                    : `Showing ${products.length} of ${totalCount || 0} products`}
                </p>
              </div>
              
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Sort */}
                <Select 
                  value={filters.sort || 'newest'} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[140px] border-earthy-beige/70 focus:ring-earthy-brown/20">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="border-earthy-beige/70">
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* View Mode Toggle */}
                <div className="flex border border-earthy-beige/70 rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-none ${viewMode === 'grid' ? 'bg-earthy-beige/30 text-earthy-brown' : 'text-muted-foreground hover:text-earthy-brown'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-full bg-earthy-beige/70" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-none ${viewMode === 'list' ? 'bg-earthy-beige/30 text-earthy-brown' : 'text-muted-foreground hover:text-earthy-brown'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Products Grid/List */}
            <ProductGrid 
              products={products} 
              viewMode={viewMode} 
              loading={productsLoading}
              onProductClick={handleProductClick}
              displaySettings={displaySettings}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Modals */}
              <ProductDetail
          product={selectedProduct}
          isOpen={isDetailOpen}
          onClose={handleProductDetailClose}
          onProductUpdate={handleProductUpdate}
          displaySettings={displaySettings}
        />
      
                      <SettingsModal
          isOpen={isSettingsOpen}
          onClose={handleSettingsClose}
          settings={displaySettings}
          visibilitySettings={visibilitySettings}
          onSettingsChange={handleSettingsChange}
          onVisibilitySettingsChange={handleVisibilitySettingsChange}
          onBulkEditOpen={handleBulkEditOpen}
        />

        <BulkEditModal
          products={products}
          isOpen={isBulkEditOpen}
          onClose={handleBulkEditClose}
          onUpdate={handleBulkEditUpdate}
        />
      </div>
    );
  };
  
  export default Index;
