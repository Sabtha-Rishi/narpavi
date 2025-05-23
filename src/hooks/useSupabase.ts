
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product, FilterOptions } from '../types';
import { useToast } from "@/components/ui/use-toast";

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Start building the query
        let query = supabase
          .from('products')
          .select('*', { count: 'exact' });

        // Apply filters
        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }
        
        if (filters.categories && filters.categories.length > 0) {
          query = query.in('category', filters.categories);
        }
        
        if (filters.gods && filters.gods.length > 0) {
          query = query.contains('related_gods', filters.gods);
        }
        
        if (filters.occasions && filters.occasions.length > 0) {
          query = query.contains('occasions', filters.occasions);
        }
        
        if (filters.materials && filters.materials.length > 0) {
          query = query.in('material', filters.materials);
        }
        
        if (filters.priceRange) {
          query = query
            .gte('price', filters.priceRange.min)
            .lte('price', filters.priceRange.max);
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
        
        console.log("Executing Supabase query:", { filters, page, pageSize, from, to });
        
        const { data, count, error } = await query
          .range(from, to);
          
        if (error) {
          throw error;
        }
        
        console.log("Query results:", { data, count });
        
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
    };

    fetchProducts();
  }, [filters, page, pageSize, toast]);

  return { products, totalCount, loading, error };
};

export const useSingleProduct = (productId: number | null) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (productId === null) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        setProduct(data as Product);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, toast]);

  return { product, loading, error };
};

export const useFilterOptions = () => {
  const [gods, setGods] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching filter options...");
        
        // Fetch unique gods
        const { data: godsData, error: godsError } = await supabase
          .from('products')
          .select('related_gods');
        
        if (godsError) throw godsError;
        
        // Fetch unique occasions
        const { data: occasionsData, error: occasionsError } = await supabase
          .from('products')
          .select('occasions');
        
        if (occasionsError) throw occasionsError;
        
        // Fetch unique materials
        const { data: materialsData, error: materialsError } = await supabase
          .from('products')
          .select('material');
        
        if (materialsError) throw materialsError;
        
        // Fetch unique categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('products')
          .select('category');
        
        if (categoriesError) throw categoriesError;
        
        // Fetch min and max price
        const { data: minPriceData, error: minPriceError } = await supabase
          .from('products')
          .select('price')
          .order('price', { ascending: true })
          .limit(1);
        
        if (minPriceError) throw minPriceError;
        
        const { data: maxPriceData, error: maxPriceError } = await supabase
          .from('products')
          .select('price')
          .order('price', { ascending: false })
          .limit(1);
        
        if (maxPriceError) throw maxPriceError;

        console.log("Filter data retrieved:", { 
          godsData, 
          occasionsData, 
          materialsData, 
          categoriesData,
          minPriceData,
          maxPriceData
        });

        // Process gods (flatten the array of arrays and get unique values)
        const uniqueGods = Array.from(
          new Set(
            godsData?.flatMap(item => item.related_gods || []) || []
          )
        );

        // Process occasions (flatten the array of arrays and get unique values)
        const uniqueOccasions = Array.from(
          new Set(
            occasionsData?.flatMap(item => item.occasions || []) || []
          )
        );

        // Process materials (get unique values)
        const uniqueMaterials = Array.from(
          new Set(
            materialsData?.map(item => item.material).filter(Boolean) || []
          )
        );

        // Process categories (get unique values)
        const uniqueCategories = Array.from(
          new Set(
            categoriesData?.map(item => item.category).filter(Boolean) || []
          )
        );

        // Process price range
        const minPrice = minPriceData?.[0]?.price || 0;
        const maxPrice = maxPriceData?.[0]?.price || 10000;

        setGods(uniqueGods as string[]);
        setOccasions(uniqueOccasions as string[]);
        setMaterials(uniqueMaterials as string[]);
        setCategories(uniqueCategories as string[]);
        setPriceRange({ min: minPrice, max: maxPrice });
      } catch (err: any) {
        console.error('Error fetching filter options:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load filter options. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, [toast]);

  return { 
    filterOptions: {
      gods,
      occasions,
      materials,
      categories,
      priceRange
    },
    loading,
    error
  };
};
