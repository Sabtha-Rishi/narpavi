
import React, { useState, useCallback, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import ProductFilters from '@/components/ProductFilters';
import ProductDetail from '@/components/ProductDetail';
import { Button } from '@/components/ui/button';
import { FilterOptions, ViewMode } from '@/types';
import { useProducts, useFilterOptions, useSingleProduct } from '@/hooks/useSupabase';
import { debounce } from '@/lib/utils';
import { ChevronDown, List, LayoutGrid } from 'lucide-react';
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
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const pageSize = 12;
  
  // Load products
  const { products, totalCount, loading: productsLoading } = useProducts(
    { ...filters, search: searchQuery }, 
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
  
  const handleSortChange = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      sort: value as FilterOptions['sort'] 
    }));
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setIsDetailOpen(true);
  };
  
  const handleProductDetailClose = () => {
    setIsDetailOpen(false);
  };
  
  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setFilters(prev => ({ ...prev, search: query }));
      setCurrentPage(1);
    }, 500),
    []
  );
  
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-semibold">All Products</h1>
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
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* View Mode Toggle */}
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-none ${viewMode === 'list' ? 'bg-muted' : ''}`}
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
      
      {/* Product Detail Modal */}
      <ProductDetail 
        product={selectedProduct} 
        isOpen={isDetailOpen} 
        onClose={handleProductDetailClose} 
      />
    </div>
  );
};

export default Index;
