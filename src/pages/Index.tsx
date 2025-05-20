
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import ProductFilters from '@/components/ProductFilters';
import ProductDetail from '@/components/ProductDetail';
import SettingsModal from '@/components/SettingsModal';
import { Button } from '@/components/ui/button';
import { FilterOptions, ViewMode } from '@/types';
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
  
  // Display settings with defaults
  const [displaySettings, setDisplaySettings] = useState({
    showStock: true,
    showPrice: true,
    showDimensions: false,
    showMaterial: true,
    showTags: true,
    showVendor: true
  });
  
  const pageSize = 12;
  
  // Memoized filters object that includes search query
  const activeFilters = useMemo(() => {
    return { ...filters, search: searchQuery };
  }, [filters, searchQuery]);
  
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
  
  const handleSettingsChange = useCallback((newSettings: typeof displaySettings) => {
    setDisplaySettings(newSettings);
    localStorage.setItem('displaySettings', JSON.stringify(newSettings));
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
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        openSettings={handleSettingsOpen} 
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
        displaySettings={displaySettings} 
      />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        settings={displaySettings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};

export default Index;
