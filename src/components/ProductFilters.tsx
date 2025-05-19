
import React, { useState } from 'react';
import { FilterOptions } from '@/types';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Filter } from 'lucide-react';
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

  // Desktop Filters
  const DesktopFilters = () => (
    <div className="hidden lg:block space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Price Range</h3>
        <div className="px-2">
          <Slider
            defaultValue={priceValues}
            min={filterOptions.priceRange.min}
            max={filterOptions.priceRange.max}
            step={100}
            value={priceValues}
            onValueChange={handlePriceChange}
            className="mt-6"
          />
          <div className="flex justify-between mt-2 text-sm">
            <span>{formatCurrency(priceValues[0])}</span>
            <span>{formatCurrency(priceValues[1])}</span>
          </div>
        </div>
      </div>
      
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
      
      <div className="pt-4 space-x-2">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
        
        <Button 
          onClick={resetFilters} 
          variant="outline" 
          className="w-full mt-2"
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
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filter Products</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-4 pb-8">
          <div>
            <h3 className="text-sm font-medium mb-2">Price Range</h3>
            <div className="px-2">
              <Slider
                defaultValue={priceValues}
                min={filterOptions.priceRange.min}
                max={filterOptions.priceRange.max}
                step={100}
                value={priceValues}
                onValueChange={handlePriceChange}
                className="mt-6"
              />
              <div className="flex justify-between mt-2">
                <span>{formatCurrency(priceValues[0])}</span>
                <span>{formatCurrency(priceValues[1])}</span>
              </div>
            </div>
          </div>
          
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
          
          <div className="pt-4 flex space-x-2">
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
            
            <Button 
              onClick={resetFilters} 
              variant="outline" 
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-4">
      <MobileFilters />
      <DesktopFilters />
      
      {/* Active Filter Pills */}
      <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
        {localFilters.gods?.map(god => (
          <div key={god} className="bg-secondary px-3 py-1 rounded-full text-xs flex items-center gap-1">
            {god}
            <button 
              onClick={() => handleGodsChange(god, false)}
              className="ml-1 hover:text-primary"
            >
              ×
            </button>
          </div>
        ))}
        
        {localFilters.occasions?.map(occasion => (
          <div key={occasion} className="bg-secondary px-3 py-1 rounded-full text-xs flex items-center gap-1">
            {occasion}
            <button 
              onClick={() => handleOccasionsChange(occasion, false)}
              className="ml-1 hover:text-primary"
            >
              ×
            </button>
          </div>
        ))}
        
        {localFilters.materials?.map(material => (
          <div key={material} className="bg-secondary px-3 py-1 rounded-full text-xs flex items-center gap-1">
            {material}
            <button 
              onClick={() => handleMaterialsChange(material, false)}
              className="ml-1 hover:text-primary"
            >
              ×
            </button>
          </div>
        ))}
        
        {localFilters.priceRange && (
          <div className="bg-secondary px-3 py-1 rounded-full text-xs flex items-center gap-1">
            Price: {formatCurrency(localFilters.priceRange.min)} - {formatCurrency(localFilters.priceRange.max)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
