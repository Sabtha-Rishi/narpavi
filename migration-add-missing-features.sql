-- Migration script to add missing product visibility and editing features
-- Based on your existing products table schema

-- Add only the missing columns
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_visible ON public.products USING btree (is_visible) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products USING btree (sku) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products USING btree (created_at) TABLESPACE pg_default;

-- Create full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN (
  to_tsvector('english', name || ' ' || description)
) TABLESPACE pg_default;

-- Set all existing products as visible by default
UPDATE public.products 
SET is_visible = TRUE 
WHERE is_visible IS NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'products' 
  AND column_name IN ('is_visible', 'updated_at', 'sku', 'width_in', 'height_in', 'depth_in')
ORDER BY ordinal_position;

-- Check the results
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_visible = true THEN 1 END) as visible_products,
    COUNT(CASE WHEN is_visible = false THEN 1 END) as hidden_products,
    COUNT(CASE WHEN sku IS NOT NULL AND sku != '' THEN 1 END) as products_with_sku,
    COUNT(CASE WHEN width_in IS NOT NULL THEN 1 END) as products_with_dimensions
FROM public.products;

-- Show sample of updated data
SELECT id, name, sku, is_visible, width_in, height_in, depth_in, updated_at
FROM public.products 
LIMIT 5; 