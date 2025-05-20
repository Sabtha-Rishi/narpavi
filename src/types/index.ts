
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discounted_price?: number;
  image_urls: string[];
  category: string;
  subcategory?: string;
  related_gods?: string[];
  occasions?: string[];
  material: string;
  region_of_origin?: string;
  artisan?: string;
  dimensions?: string;
  weight?: string;
  stock_quantity: number;
  tags?: string[];
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  created_at: string;
}

export interface FilterOptions {
  gods?: string[];
  occasions?: string[];
  materials?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  categories?: string[];
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'featured' | 'popular';
  search?: string;
}

export type ViewMode = 'grid' | 'list';

export interface DisplaySettings {
  showStock: boolean;
  showPrice: boolean;
  showDimensions: boolean;
  showMaterial: boolean;
  showTags: boolean;
  showVendor: boolean;
}
