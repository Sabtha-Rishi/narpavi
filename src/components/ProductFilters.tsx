import React, { useState } from 'react';
import { FilterOptions } from '@/types';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Filter, IndianRupee } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProductFiltersProps {
  filterOptions: {
    gods: string[];
    occasions: string[];
    materials: string[];
    categories: string[];
    priceRange: { min: number; max: number };
  };
  currentFilters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  loading: boolean;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filterOptions,
  currentFilters,
  onChange,
  loading
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);
  const [priceValues, setPriceValues] = useState<number[]>([
    currentFilters.priceRange?.min || filterOptions.priceRange.min,
    currentFilters.priceRange?.max || filterOptions.priceRange.max
  ]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  const handlePriceChange = (values: number[]) => {
    setPriceValues(values);
    setLocalFilters(prev => ({
      ...prev,
      priceRange: { min: values[0], max: values[1] }
    }));
  };

  const handleMinPriceInput = (value: string) => {
    const numValue = Math.max(0, Math.min(Number(value) || 0, priceValues[1] - 100));
    handlePriceChange([numValue, priceValues[1]]);
  };

  const handleMaxPriceInput = (value: string) => {
    const numValue = Math.max(priceValues[0] + 100, Math.min(Number(value) || filterOptions.priceRange.max, filterOptions.priceRange.max));
    handlePriceChange([priceValues[0], numValue]);
  };
  
  const handleGodsChange = (god: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentGods = prev.gods || [];
      const newGods = checked
        ? [...currentGods, god]
        : currentGods.filter(g => g !== god);
      
      return { ...prev, gods: newGods };
    });
  };
  
  const handleOccasionsChange = (occasion: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentOccasions = prev.occasions || [];
      const newOccasions = checked
        ? [...currentOccasions, occasion]
        : currentOccasions.filter(o => o !== occasion);
      
      return { ...prev, occasions: newOccasions };
    });
  };
  
  const handleMaterialsChange = (material: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentMaterials = prev.materials || [];
      const newMaterials = checked
        ? [...currentMaterials, material]
        : currentMaterials.filter(m => m !== material);
      
      return { ...prev, materials: newMaterials };
    });
  };
  
  const handleCategoriesChange = (category: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentCategories = prev.categories || [];
      const newCategories = checked
        ? [...currentCategories, category]
        : currentCategories.filter(c => c !== category);
      
      return { ...prev, categories: newCategories };
    });
  };
  
  const applyFilters = () => {
    onChange(localFilters);
  };
  
  const resetFilters = () => {
    const resetFilters: FilterOptions = {
      search: currentFilters.search,
      sort: currentFilters.sort
    };
    setLocalFilters(resetFilters);
    setPriceValues([
      filterOptions.priceRange.min,
      filterOptions.priceRange.max
    ]);
    onChange(resetFilters);
  };

  // Filter Groups Component
  const FilterGroup = ({ 
    title, 
    items, 
    selectedItems = [], 
    onChange 
  }: { 
    title: string; 
    items: string[]; 
    selectedItems?: string[]; 
    onChange: (item: string, checked: boolean) => void; 
  }) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <ScrollArea className="h-[140px]">
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`${title}-${item}`}
                checked={selectedItems.includes(item)}
                onCheckedChange={(checked) => onChange(item, checked === true)}
              />
              <Label htmlFor={`${title}-${item}`} className="text-sm">{item}</Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  // Enhanced Price Filter Component
  const PriceFilter = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <IndianRupee className="h-4 w-4 text-earthy-brown" />
        <h3 className="text-sm font-semibold text-earthy-brown">Price Range</h3>
      </div>
      
      {/* Visual price range display */}
      <div className="bg-gradient-to-r from-earthy-beige/20 to-earthy-ochre/20 p-4 rounded-lg border border-earthy-beige/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-earthy-brown">
            {formatCurrency(priceValues[0])}
          </span>
          <span className="text-xs text-earthy-brown/60">to</span>
          <span className="text-sm font-medium text-earthy-brown">
            {formatCurrency(priceValues[1])}
          </span>
        </div>
        
          <Slider
          value={priceValues}
          onValueChange={handlePriceChange}
            min={filterOptions.priceRange.min}
            max={filterOptions.priceRange.max}
            step={100}
          className="w-full mt-4"
        />
        
        {/* Interactive input fields */}
        <div className="flex gap-2 mt-4">
          <div className="flex-1">
            <Label htmlFor="min-price" className="text-xs text-earthy-brown/70">Min Price</Label>
            <Input
              id="min-price"
              type="number"
              placeholder="Min"
              value={priceValues[0]}
              onChange={(e) => handleMinPriceInput(e.target.value)}
              className="h-8 text-xs border-earthy-beige/50 focus:border-earthy-brown"
              min={filterOptions.priceRange.min}
              max={priceValues[1] - 100}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="max-price" className="text-xs text-earthy-brown/70">Max Price</Label>
            <Input
              id="max-price"
              type="number"
              placeholder="Max"
              value={priceValues[1]}
              onChange={(e) => handleMaxPriceInput(e.target.value)}
              className="h-8 text-xs border-earthy-beige/50 focus:border-earthy-brown"
              min={priceValues[0] + 100}
              max={filterOptions.priceRange.max}
            />
          </div>
        </div>
        
        {/* Quick price presets */}
        <div className="flex flex-wrap gap-1 mt-3">
          {[
            { label: "Under ₹1k", min: filterOptions.priceRange.min, max: 1000 },
            { label: "₹1k-5k", min: 1000, max: 5000 },
            { label: "₹5k-10k", min: 5000, max: 10000 },
            { label: "₹10k+", min: 10000, max: filterOptions.priceRange.max }
          ].map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs border-earthy-beige/50 hover:bg-earthy-beige/30 hover:border-earthy-brown"
              onClick={() => handlePriceChange([preset.min, preset.max])}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  // Desktop Filters
  const DesktopFilters = () => (
    <div className="hidden lg:block space-y-6">
      <PriceFilter />
      
      <Separator />
      
      <FilterGroup
        title="Related Gods"
        items={filterOptions.gods}
        selectedItems={localFilters.gods}
        onChange={handleGodsChange}
      />
      
      <Separator />
      
      <FilterGroup
        title="Occasions"
        items={filterOptions.occasions}
        selectedItems={localFilters.occasions}
        onChange={handleOccasionsChange}
      />
      
      <Separator />
      
      <FilterGroup
        title="Materials"
        items={filterOptions.materials}
        selectedItems={localFilters.materials}
        onChange={handleMaterialsChange}
      />
      
      <Separator />
      
      <FilterGroup
        title="Categories"
        items={filterOptions.categories}
        selectedItems={localFilters.categories}
        onChange={handleCategoriesChange}
      />
      
      <div className="pt-4 space-y-2">
        <Button 
          onClick={applyFilters} 
          className="w-full bg-gradient-to-r from-earthy-brown to-earthy-maroon hover:from-earthy-maroon hover:to-earthy-brown transition-all duration-300"
        >
          Apply Filters
        </Button>
        
        <Button 
          onClick={resetFilters} 
          variant="outline" 
          className="w-full border-earthy-beige/50 hover:bg-earthy-beige/20"
        >
          Reset
        </Button>
      </div>
    </div>
  );

  // Mobile Filters
  const MobileFilters = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden border-earthy-beige/50 hover:bg-earthy-beige/20">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle className="text-earthy-brown">Filter Products</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(80vh-120px)] mt-4">
          <div className="space-y-6 pb-8">
            <PriceFilter />
          
          <Separator />
          
          <FilterGroup
            title="Related Gods"
            items={filterOptions.gods}
            selectedItems={localFilters.gods}
            onChange={handleGodsChange}
          />
          
          <Separator />
          
          <FilterGroup
            title="Occasions"
            items={filterOptions.occasions}
            selectedItems={localFilters.occasions}
            onChange={handleOccasionsChange}
          />
          
          <Separator />
          
          <FilterGroup
            title="Materials"
            items={filterOptions.materials}
            selectedItems={localFilters.materials}
            onChange={handleMaterialsChange}
          />
          
          <Separator />
          
          <FilterGroup
            title="Categories"
            items={filterOptions.categories}
            selectedItems={localFilters.categories}
            onChange={handleCategoriesChange}
          />
          </div>
        </ScrollArea>
          
        <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
          <Button 
            onClick={applyFilters} 
            className="flex-1 bg-gradient-to-r from-earthy-brown to-earthy-maroon hover:from-earthy-maroon hover:to-earthy-brown"
          >
              Apply Filters
            </Button>
            
            <Button 
              onClick={resetFilters} 
              variant="outline" 
            className="flex-1 border-earthy-beige/50"
            >
              Reset
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-4">
      <MobileFilters />
      <DesktopFilters />
      
      {/* Active Filter Pills with improved styling */}
      <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
        {localFilters.gods?.map(god => (
          <div key={god} className="bg-earthy-beige/40 text-earthy-brown px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-earthy-beige/50">
            {god}
            <button 
              onClick={() => handleGodsChange(god, false)}
              className="ml-1 hover:text-earthy-maroon transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        
        {localFilters.occasions?.map(occasion => (
          <div key={occasion} className="bg-earthy-beige/40 text-earthy-brown px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-earthy-beige/50">
            {occasion}
            <button 
              onClick={() => handleOccasionsChange(occasion, false)}
              className="ml-1 hover:text-earthy-maroon transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        
        {localFilters.materials?.map(material => (
          <div key={material} className="bg-earthy-beige/40 text-earthy-brown px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-earthy-beige/50">
            {material}
            <button 
              onClick={() => handleMaterialsChange(material, false)}
              className="ml-1 hover:text-earthy-maroon transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        
        {localFilters.priceRange && (
          <div className="bg-earthy-ochre/30 text-earthy-brown px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-earthy-ochre/50">
            <IndianRupee className="h-3 w-3" />
            {formatCurrency(localFilters.priceRange.min)} - {formatCurrency(localFilters.priceRange.max)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
