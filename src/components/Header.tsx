import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openSettings: () => void;
  onAdvancedSearch?: (filters: {
    widthSearch?: string;
    heightSearch?: string;
    depthSearch?: string;
    skuSearch?: string;
    weightSearch?: string;
    widthRange?: { min: number; max: number };
    heightRange?: { min: number; max: number };
    depthRange?: { min: number; max: number };
    weightRange?: { min: number; max: number };
  }) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  openSettings,
  onAdvancedSearch 
}) => {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-earthy-beige/70 py-4 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center group">
            <h1 className="text-3xl md:text-4xl font-bold text-earthy-brown transition-all duration-300 group-hover:text-earthy-maroon">
              Narpavi
              <span className="sr-only">Handicrafts</span>
            </h1>
          </Link>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80 lg:w-96">
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery}
                onAdvancedSearch={onAdvancedSearch}
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={openSettings}
              className="flex-shrink-0 text-earthy-brown hover:text-earthy-maroon hover:bg-earthy-beige/20"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
