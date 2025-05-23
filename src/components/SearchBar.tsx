
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Search, X } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use debounce to prevent excessive updates
  const debouncedOnChange = useCallback(
    debounce((searchValue: string) => {
      onChange(searchValue);
    }, 300),
    [onChange]
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

  const clearSearch = () => {
    setLocalValue('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full animate-fade-in">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earthy-brown/70 h-4 w-4" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search products, gods, materials..."
        value={localValue}
        onChange={handleChange}
        className="pl-9 pr-8 transition-all duration-300 border-earthy-beige/70 focus:border-earthy-brown focus:ring-1 focus:ring-earthy-brown/30 rounded-md"
      />
      {localValue && (
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-earthy-brown/70 hover:text-earthy-maroon transition-colors"
          onClick={clearSearch}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
