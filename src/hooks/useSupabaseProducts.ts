import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product, FilterOptions } from '../types';
import { useToast } from "@/components/ui/use-toast";
import { debounce } from '@/lib/utils';

/**
 * Custom hook for fetching products with filtering, sorting, and pagination
 */
export const useProducts = (
  filters: FilterOptions = {},
  page = 1,
  pageSize = 12
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Memoize the fetch function to prevent recreating it on every render
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });
      
      // Apply search filters
      if (filters.search) {
        const searchTerm = filters.search.trim();
        
        if (searchTerm) {
          // First, try to get results from a comprehensive search
          // If no filters except search, do a special comprehensive search
          const hasOtherFilters = filters.categories?.length || filters.gods?.length || 
                                filters.occasions?.length || filters.materials?.length || 
                                filters.priceRange || filters.widthSearch || filters.heightSearch || 
                                filters.depthSearch || filters.skuSearch || filters.weightSearch ||
                                filters.widthRange || filters.heightRange || filters.depthRange || filters.weightRange;
          
          if (!hasOtherFilters) {
            // For search-only queries, get all products and filter comprehensively
            const { data: allProducts } = await supabase
              .from('products')
              .select('*');
            
            if (allProducts) {
              const searchLower = searchTerm.toLowerCase();
              
              // Helper function to extract weight in kg from a string
              const extractWeightInKg = (weightStr: string): number | null => {
                if (!weightStr) return null;
                
                const str = weightStr.toLowerCase().replace(/\s+/g, '');
                
                // Match patterns like: 2kg, 2.5kg, 500g, 1500g, 2, 2.5
                const kgMatch = str.match(/(\d+(?:\.\d+)?)\s*kg/);
                if (kgMatch) {
                  return parseFloat(kgMatch[1]);
                }
                
                const gMatch = str.match(/(\d+(?:\.\d+)?)\s*g$/);
                if (gMatch) {
                  return parseFloat(gMatch[1]) / 1000; // Convert grams to kg
                }
                
                // If just a number, assume kg
                const numberMatch = str.match(/^(\d+(?:\.\d+)?)$/);
                if (numberMatch) {
                  return parseFloat(numberMatch[1]);
                }
                
                return null;
              };
              
              // Check if search term is a weight query
              const searchWeight = extractWeightInKg(searchTerm);
              
              const matchedProducts = (allProducts as Product[]).filter(product => {
                // Weight-based search - show products with weight >= searched weight
                if (searchWeight !== null && product.weight) {
                  const productWeight = extractWeightInKg(product.weight);
                  if (productWeight !== null && productWeight >= searchWeight) {
                    return true;
                  }
                }
                
                // Apply other filters if present (for comprehensive filtering)
                // Weight range filter
                if (filters.weightRange && product.weight) {
                  const productWeight = extractWeightInKg(product.weight);
                  if (productWeight !== null) {
                    if (productWeight < filters.weightRange.min || productWeight > filters.weightRange.max) {
                      return false;
                    }
                  }
                }
                
                // Dimension range filters
                if (filters.widthRange && product.width_in !== null) {
                  if (product.width_in < filters.widthRange.min || product.width_in > filters.widthRange.max) {
                    return false;
                  }
                }
                
                if (filters.heightRange && product.height_in !== null) {
                  if (product.height_in < filters.heightRange.min || product.height_in > filters.heightRange.max) {
                    return false;
                  }
                }
                
                if (filters.depthRange && product.depth_in !== null) {
                  if (product.depth_in < filters.depthRange.min || product.depth_in > filters.depthRange.max) {
                    return false;
                  }
                }
                
                // Text field searches (excluding weight for separate handling)
                const textFields = [
                  product.name,
                  product.description,
                  product.material,
                  product.dimensions,
                  product.sku,
                  product.artisan,
                  product.region_of_origin,
                  product.category,
                  product.subcategory
                ];
                
                const textMatch = textFields.some(field => 
                  field?.toLowerCase().includes(searchLower)
                );
                
                // Weight text search (for non-numeric weight searches)
                const weightTextMatch = searchWeight === null && 
                  product.weight?.toLowerCase().includes(searchLower);
                
                // Array field searches
                const arrayMatch = [
                  ...(product.related_gods || []),
                  ...(product.tags || []),
                  ...(product.occasions || [])
                ].some(item => item?.toLowerCase().includes(searchLower));
                
                return textMatch || weightTextMatch || arrayMatch;
              });
              
              // Apply sorting
              let sortedProducts = matchedProducts;
              switch (filters.sort) {
                case 'price-asc':
                  sortedProducts = matchedProducts.sort((a, b) => a.price - b.price);
                  break;
                case 'price-desc':
                  sortedProducts = matchedProducts.sort((a, b) => b.price - a.price);
                  break;
                case 'newest':
                  sortedProducts = matchedProducts.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                  break;
                case 'featured':
                  sortedProducts = matchedProducts.filter(p => p.is_featured).sort((a, b) => a.id - b.id);
                  break;
                case 'popular':
                  sortedProducts = matchedProducts.filter(p => p.is_bestseller).sort((a, b) => a.id - b.id);
                  break;
                default:
                  sortedProducts = matchedProducts.sort((a, b) => a.id - b.id);
              }
              
              // Apply pagination
              const startIndex = (page - 1) * pageSize;
              const endIndex = startIndex + pageSize;
              const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
              
              setProducts(paginatedProducts);
              setTotalCount(sortedProducts.length);
              return;
            }
          } else {
            // For queries with other filters, use server-side search for text fields only
            query = query.or(
              `name.ilike.%${searchTerm}%,` +
              `description.ilike.%${searchTerm}%,` +
              `material.ilike.%${searchTerm}%,` +
              `dimensions.ilike.%${searchTerm}%,` +
              `weight.ilike.%${searchTerm}%,` +
              `sku.ilike.%${searchTerm}%,` +
              `artisan.ilike.%${searchTerm}%,` +
              `region_of_origin.ilike.%${searchTerm}%,` +
              `category.ilike.%${searchTerm}%,` +
              `subcategory.ilike.%${searchTerm}%`
            );
          }
        }
      }
      
      // Apply array-based filters
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }
      
      if (filters.gods && filters.gods.length > 0) {
        const godsConditions = filters.gods.map(god => 
          `related_gods.cs.{${god}}`
        ).join(',');
        query = query.or(godsConditions);
      }
      
      if (filters.occasions && filters.occasions.length > 0) {
        const occasionsConditions = filters.occasions.map(occasion => 
          `occasions.cs.{${occasion}}`
        ).join(',');
        query = query.or(occasionsConditions);
      }
      
      if (filters.materials && filters.materials.length > 0) {
        query = query.in('material', filters.materials);
      }
      
      if (filters.priceRange) {
        query = query
          .gte('price', filters.priceRange.min)
          .lte('price', filters.priceRange.max);
      }
      
      // Apply specific dimension searches using database columns
      if (filters.widthSearch) {
        query = query.eq('width_in', parseFloat(filters.widthSearch));
      }

      if (filters.heightSearch) {
        query = query.eq('height_in', parseFloat(filters.heightSearch));
      }

      if (filters.depthSearch) {
        query = query.eq('depth_in', parseFloat(filters.depthSearch));
      }

      // Apply SKU search
      if (filters.skuSearch) {
        query = query.ilike('sku', `%${filters.skuSearch}%`);
      }

      // Apply weight search
      if (filters.weightSearch) {
        query = query.ilike('weight', `%${filters.weightSearch}%`);
      }

      // Apply dimension range filters
      if (filters.widthRange) {
        query = query.gte('width_in', filters.widthRange.min);
        query = query.lte('width_in', filters.widthRange.max);
      }

      if (filters.heightRange) {
        query = query.gte('height_in', filters.heightRange.min);
        query = query.lte('height_in', filters.heightRange.max);
      }

      if (filters.depthRange) {
        query = query.gte('depth_in', filters.depthRange.min);
        query = query.lte('depth_in', filters.depthRange.max);
      }

      // Weight range filtering is now handled client-side for better accuracy
      // The server-side weight field contains strings like "2kg", "500g" which can't be directly compared
      // So we skip server-side weight range filtering and handle it in the client-side filter above
      
      // Apply sorting
      switch (filters.sort) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'featured':
          query = query.eq('is_featured', true).order('id', { ascending: true });
          break;
        case 'popular':
          query = query.eq('is_bestseller', true).order('id', { ascending: true });
          break;
        default:
          query = query.order('id', { ascending: true });
      }
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Execute query with all filters applied
      const { data, count, error } = await query.range(from, to);
      
      if (error) {
        throw error;
      }
      
      setProducts(data as Product[]);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, toast]);

  useEffect(() => {
    // Create a cleanup flag to prevent state updates after unmount
    let isActive = true;
    
    const loadData = async () => {
      await fetchProducts();
    };
    
    loadData();
    
    return () => {
      isActive = false;
    };
  }, [fetchProducts]);

  return { products, totalCount, loading, error };
};

/**
 * Custom hook for fetching a single product by ID
 */
export const useSingleProduct = (productId: number | null) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (productId === null) return;
    
    let isActive = true;
    
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (isActive) {
          setProduct(data as Product);
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        if (isActive) {
          setError(err.message);
          toast({
            title: "Error",
            description: "Failed to load product details. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProduct();
    
    return () => {
      isActive = false;
    };
  }, [productId, toast]);

  return { product, loading, error };
};

/**
 * Hook to fetch filter options from the database
 */
export const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState<{
    gods: string[];
    occasions: string[];
    materials: string[];
    categories: string[];
    priceRange: { min: number; max: number };
  }>({
    gods: [],
    occasions: [],
    materials: [],
    categories: [],
    priceRange: { min: 0, max: 10000 }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isActive = true;
    
    const fetchFilterOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use Promise.all for parallel requests to improve performance
        const [
          godsResult,
          occasionsResult,
          materialsResult,
          categoriesResult,
          minPriceResult,
          maxPriceResult
        ] = await Promise.all([
          supabase.from('products').select('related_gods'),
          supabase.from('products').select('occasions'),
          supabase.from('products').select('material'),
          supabase.from('products').select('category'),
          supabase.from('products').select('price').order('price', { ascending: true }).limit(1),
          supabase.from('products').select('price').order('price', { ascending: false }).limit(1)
        ]);

        // Check for errors
        if (godsResult.error) throw godsResult.error;
        if (occasionsResult.error) throw occasionsResult.error;
        if (materialsResult.error) throw materialsResult.error;
        if (categoriesResult.error) throw categoriesResult.error;
        if (minPriceResult.error) throw minPriceResult.error;
        if (maxPriceResult.error) throw maxPriceResult.error;
        
        // Process data to extract unique values
        const uniqueGods = Array.from(
          new Set(
            godsResult.data?.flatMap(item => item.related_gods || []) || []
          )
        );

        const uniqueOccasions = Array.from(
          new Set(
            occasionsResult.data?.flatMap(item => item.occasions || []) || []
          )
        );

        const uniqueMaterials = Array.from(
          new Set(
            materialsResult.data?.map(item => item.material).filter(Boolean) || []
          )
        );

        const uniqueCategories = Array.from(
          new Set(
            categoriesResult.data?.map(item => item.category).filter(Boolean) || []
          )
        );

        // Process price range
        const minPrice = minPriceResult.data?.[0]?.price || 0;
        const maxPrice = maxPriceResult.data?.[0]?.price || 10000;

        if (isActive) {
          setFilterOptions({
            gods: uniqueGods as string[],
            occasions: uniqueOccasions as string[],
            materials: uniqueMaterials as string[],
            categories: uniqueCategories as string[],
            priceRange: { min: minPrice, max: maxPrice }
          });
        }
      } catch (err: any) {
        console.error('Error fetching filter options:', err);
        if (isActive) {
          setError(err.message);
          toast({
            title: "Error",
            description: "Failed to load filter options. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchFilterOptions();
    
    return () => {
      isActive = false;
    };
  }, [toast]);

  return { filterOptions, loading, error };
};
