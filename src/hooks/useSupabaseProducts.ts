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
      // Start building the query
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });
      
      // Apply text search filters - Enhanced to include new fields
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,` +
          `description.ilike.%${filters.search}%,` +
          `tags.cs.{${filters.search}},` +
          `related_gods.cs.{${filters.search}},` +
          `material.ilike.%${filters.search}%,` +
          `dimensions.ilike.%${filters.search}%,` +
          `weight.ilike.%${filters.search}%,` +
          `sku.ilike.%${filters.search}%,` +
          `artisan.ilike.%${filters.search}%,` +
          `region_of_origin.ilike.%${filters.search}%`
        );
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
