
import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Narpavi <span className="text-accent">Handicrafts</span>
            </h1>
          </Link>
          
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search for handicrafts..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
