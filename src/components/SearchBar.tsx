import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onAdvancedSearch?: (filters: {
    widthSearch?: string;
    heightSearch?: string;
    depthSearch?: string;
    skuSearch?: string;
    weightSearch?: string;
  }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onAdvancedSearch }) => {
  const [localValue, setLocalValue] = useState(value);
  const [advancedFilters, setAdvancedFilters] = useState({
    widthSearch: '',
    heightSearch: '',
    depthSearch: '',
    skuSearch: '',
    weightSearch: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use debounce to prevent excessive updates
  const debouncedOnChange = useCallback(
    debounce((searchValue: string) => {
      onChange(searchValue);
    }, 300),
    [onChange]
  );

  const debouncedAdvancedSearch = useCallback(
    debounce((filters: typeof advancedFilters) => {
      onAdvancedSearch?.(filters);
    }, 300),
    [onAdvancedSearch]
  );

  // Update local state when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleAdvancedFilterChange = (key: keyof typeof advancedFilters, value: string) => {
    const newFilters = { ...advancedFilters, [key]: value };
    setAdvancedFilters(newFilters);
    debouncedAdvancedSearch(newFilters);
  };

  const clearSearch = () => {
    setLocalValue('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearAdvancedFilters = () => {
    const emptyFilters = {
      widthSearch: '',
      heightSearch: '',
      depthSearch: '',
      skuSearch: '',
      weightSearch: ''
    };
    setAdvancedFilters(emptyFilters);
    onAdvancedSearch?.(emptyFilters);
  };

  const hasAdvancedFilters = Object.values(advancedFilters).some(v => v.length > 0);

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full animate-fade-in">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earthy-brown/70 h-4 w-4" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search products, gods, materials..."
          value={localValue}
          onChange={handleChange}
          className="pl-9 pr-20 transition-all duration-300 border-earthy-beige/70 focus:border-earthy-brown focus:ring-1 focus:ring-earthy-brown/30 rounded-md"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {localValue && (
            <button 
              className="text-earthy-brown/70 hover:text-earthy-maroon transition-colors p-1 rounded"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 h-auto ${hasAdvancedFilters ? 'text-earthy-maroon' : 'text-earthy-brown/70'} hover:text-earthy-maroon transition-colors`}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-earthy-brown">Advanced Search</h4>
                  {hasAdvancedFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAdvancedFilters}
                      className="text-xs text-earthy-brown/70 hover:text-earthy-maroon"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="width-search" className="text-sm font-medium text-earthy-brown">
                        Width (")
                      </Label>
                      <Input
                        id="width-search"
                        placeholder="e.g., 12"
                        value={advancedFilters.widthSearch}
                        onChange={(e) => handleAdvancedFilterChange('widthSearch', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="height-search" className="text-sm font-medium text-earthy-brown">
                        Height (")
                      </Label>
                      <Input
                        id="height-search"
                        placeholder="e.g., 8"
                        value={advancedFilters.heightSearch}
                        onChange={(e) => handleAdvancedFilterChange('heightSearch', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="depth-search" className="text-sm font-medium text-earthy-brown">
                        Depth (")
                      </Label>
                      <Input
                        id="depth-search"
                        placeholder="e.g., 4"
                        value={advancedFilters.depthSearch}
                        onChange={(e) => handleAdvancedFilterChange('depthSearch', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="sku-search" className="text-sm font-medium text-earthy-brown">
                      SKU / Product Code
                    </Label>
                    <Input
                      id="sku-search"
                      placeholder="Enter SKU or product code"
                      value={advancedFilters.skuSearch}
                      onChange={(e) => handleAdvancedFilterChange('skuSearch', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight-search" className="text-sm font-medium text-earthy-brown">
                      Weight
                    </Label>
                    <Input
                      id="weight-search"
                      placeholder="e.g., 2kg, 500g, light"
                      value={advancedFilters.weightSearch}
                      onChange={(e) => handleAdvancedFilterChange('weightSearch', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Search for products by specific width, height, depth (in inches), SKU codes, or weight specifications.
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Active Advanced Filters Pills */}
      {hasAdvancedFilters && (
        <div className="flex flex-wrap gap-2 text-xs">
          {advancedFilters.widthSearch && (
            <div className="bg-earthy-beige/40 text-earthy-brown px-2 py-1 rounded-full flex items-center gap-1">
              <span>Width: {advancedFilters.widthSearch}"</span>
              <button 
                onClick={() => handleAdvancedFilterChange('widthSearch', '')}
                className="hover:text-earthy-maroon"
              >
                ×
              </button>
            </div>
          )}
          {advancedFilters.heightSearch && (
            <div className="bg-earthy-beige/40 text-earthy-brown px-2 py-1 rounded-full flex items-center gap-1">
              <span>Height: {advancedFilters.heightSearch}"</span>
              <button 
                onClick={() => handleAdvancedFilterChange('heightSearch', '')}
                className="hover:text-earthy-maroon"
              >
                ×
              </button>
            </div>
          )}
          {advancedFilters.depthSearch && (
            <div className="bg-earthy-beige/40 text-earthy-brown px-2 py-1 rounded-full flex items-center gap-1">
              <span>Depth: {advancedFilters.depthSearch}"</span>
              <button 
                onClick={() => handleAdvancedFilterChange('depthSearch', '')}
                className="hover:text-earthy-maroon"
              >
                ×
              </button>
            </div>
          )}
          {advancedFilters.skuSearch && (
            <div className="bg-earthy-beige/40 text-earthy-brown px-2 py-1 rounded-full flex items-center gap-1">
              <span>SKU: {advancedFilters.skuSearch}</span>
              <button 
                onClick={() => handleAdvancedFilterChange('skuSearch', '')}
                className="hover:text-earthy-maroon"
              >
                ×
              </button>
            </div>
          )}
          {advancedFilters.weightSearch && (
            <div className="bg-earthy-beige/40 text-earthy-brown px-2 py-1 rounded-full flex items-center gap-1">
              <span>Weight: {advancedFilters.weightSearch}</span>
              <button 
                onClick={() => handleAdvancedFilterChange('weightSearch', '')}
                className="hover:text-earthy-maroon"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
