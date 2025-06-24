-- Migration script to add product visibility and editing features
-- Run this on your existing Supabase database

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS sku VARCHAR(50),
ADD COLUMN IF NOT EXISTS width_in DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS height_in DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS depth_in DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add new indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_visible ON products(is_visible);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Update existing products with sample SKUs and dimensions (optional)
-- You can run this to add sample data to existing products, or modify as needed
UPDATE products SET 
    sku = 'PROD' || LPAD(id::text, 3, '0'),
    is_visible = TRUE,
    width_in = CASE 
        WHEN dimensions LIKE '%8%x%5%x%4%' THEN 8.0
        WHEN dimensions LIKE '%12%x%4%x%3%' THEN 12.0
        WHEN dimensions LIKE '%10%x%6%x%4%' THEN 10.0
        WHEN dimensions LIKE '%14%x%10%x%4%' THEN 14.0
        WHEN dimensions LIKE '%2.5%' THEN 2.5
        WHEN dimensions LIKE '%3%' THEN 3.0
        WHEN dimensions LIKE '%36%x%24%' THEN 36.0
        WHEN dimensions LIKE '%15%x%10%x%12%' THEN 15.0
        WHEN dimensions LIKE '%48%x%18%' THEN 48.0
        ELSE NULL
    END,
    height_in = CASE 
        WHEN dimensions LIKE '%8%x%5%x%4%' THEN 5.0
        WHEN dimensions LIKE '%12%x%4%x%3%' THEN 4.0
        WHEN dimensions LIKE '%10%x%6%x%4%' THEN 6.0
        WHEN dimensions LIKE '%14%x%10%x%4%' THEN 10.0
        WHEN dimensions LIKE '%2.5%' THEN 1.5
        WHEN dimensions LIKE '%6%height%' THEN 6.0
        WHEN dimensions LIKE '%36%x%24%' THEN 24.0
        WHEN dimensions LIKE '%15%x%10%x%12%' THEN 10.0
        WHEN dimensions LIKE '%48%x%18%' THEN 18.0
        ELSE NULL
    END,
    depth_in = CASE 
        WHEN dimensions LIKE '%8%x%5%x%4%' THEN 4.0
        WHEN dimensions LIKE '%12%x%4%x%3%' THEN 3.0
        WHEN dimensions LIKE '%10%x%6%x%4%' THEN 4.0
        WHEN dimensions LIKE '%14%x%10%x%4%' THEN 4.0
        WHEN dimensions LIKE '%2.5%' THEN 2.5
        WHEN dimensions LIKE '%3%diameter%' THEN 3.0
        WHEN dimensions LIKE '%15%x%10%x%12%' THEN 12.0
        WHEN dimensions LIKE '%48%x%18%' THEN 2.0
        ELSE NULL
    END
WHERE sku IS NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check if new columns were added successfully
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_visible = true THEN 1 END) as visible_products,
    COUNT(CASE WHEN is_visible = false THEN 1 END) as hidden_products,
    COUNT(CASE WHEN sku IS NOT NULL THEN 1 END) as products_with_sku
FROM products; 