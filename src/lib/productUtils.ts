import { Product } from '@/types';
import { formatCurrency } from './utils';

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (original: number, discounted: number): number => {
  if (!original || !discounted || original <= 0) return 0;
  const percentage = Math.round(((original - discounted) / original) * 100);
  return percentage > 0 ? percentage : 0;
};

/**
 * Get product display price with formatting
 */
export const getDisplayPrice = (product: Product): string => {
  if (product.discounted_price) {
    return formatCurrency(product.discounted_price);
  }
  return formatCurrency(product.price);
};

/**
 * Get product tags as a formatted string
 */
export const getProductTagsString = (product: Product): string => {
  const tags: string[] = [];
  
  if (product.category) tags.push(product.category);
  if (product.material) tags.push(product.material);
  if (product.related_gods?.length) tags.push(...product.related_gods);
  
  return tags.join(', ');
};

/**
 * Check if a product is in stock
 */
export const isInStock = (product: Product): boolean => {
  return product.stock_quantity > 0;
};

/**
 * Get stock display text
 */
export const getStockDisplay = (product: Product): { text: string; color: string } => {
  if (product.stock_quantity <= 0) {
    return { text: 'Out of stock', color: 'text-red-500' };
  } 
  if (product.stock_quantity < 5) {
    return { text: `Only ${product.stock_quantity} left`, color: 'text-amber-500' };
  }
  return { text: 'In stock', color: 'text-green-500' };
};

/**
 * Group related products by category
 */
export const groupProductsByCategory = (products: Product[]): Record<string, Product[]> => {
  return products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
};

/**
 * Get all searchable content from a product
 */
export const getSearchableContent = (product: Product): string => {
  const searchableFields = [
    product.name,
    product.description,
    product.category,
    product.subcategory,
    product.material,
    product.region_of_origin,
    product.artisan,
    ...(product.related_gods || []),
    ...(product.occasions || []),
    ...(product.tags || [])
  ];
  
  return searchableFields.filter(Boolean).join(' ').toLowerCase();
};

/**
 * Format weight to include kg suffix if not present
 */
export const formatWeight = (weight?: string): string => {
  if (!weight) return '';
  
  // If weight already has units (kg, g, lbs, etc.), return as is
  if (/\b(kg|g|lbs?|oz|grams?|kilograms?)\b/i.test(weight)) {
    return weight;
  }
  
  // If it's just a number, add kg
  if (/^\d+\.?\d*$/.test(weight.trim())) {
    return `${weight} kg`;
  }
  
  // Otherwise return as is
  return weight;
};

/**
 * Parse dimensions into a structured format for table display
 */
export const parseDimensions = (product: Product): {
  width?: string;
  height?: string;
  depth?: string;
  original?: string;
} => {
  const result: {
    width?: string;
    height?: string;
    depth?: string;
    original?: string;
  } = {};

  // Use individual dimension fields if available
  if (product.width_in) {
    result.width = `${product.width_in}"`;
  }
  if (product.height_in) {
    result.height = `${product.height_in}"`;
  }
  if (product.depth_in) {
    result.depth = `${product.depth_in}"`;
  }

  // If we have individual dimensions, return them
  if (result.width || result.height || result.depth) {
    return result;
  }

  // Otherwise, try to parse the dimensions string
  if (product.dimensions) {
    result.original = product.dimensions;
    
    // Try to extract W x H x D pattern
    const dimensionPattern = /(\d+\.?\d*)\s*["\']?\s*x\s*(\d+\.?\d*)\s*["\']?\s*x?\s*(\d+\.?\d*)?/i;
    const match = product.dimensions.match(dimensionPattern);
    
    if (match) {
      result.width = match[1] + '"';
      result.height = match[2] + '"';
      if (match[3]) {
        result.depth = match[3] + '"';
      }
    }
  }

  return result;
};

/**
 * Check if product has complete dimension data
 */
export const hasCompleteDimensions = (product: Product): boolean => {
  const parsed = parseDimensions(product);
  return !!(parsed.width && parsed.height);
};

/**
 * Format product details for WhatsApp sharing
 */
export const formatProductForWhatsApp = (product: Product): string => {
  const lines: string[] = [];
  
  // Header
  lines.push(`🛍️ *${product.name}*`);
  lines.push('');
  
  // Description
  if (product.description) {
    lines.push(`📝 *Description:*`);
    lines.push(product.description);
    lines.push('');
  }
  
  // Price
  lines.push(`💰 *Price:*`);
  if (product.discounted_price) {
    lines.push(`~~${formatCurrency(product.price)}~~ *${formatCurrency(product.discounted_price)}*`);
    const discount = calculateDiscountPercentage(product.price, product.discounted_price);
    lines.push(`🏷️ *${discount}% OFF!*`);
  } else {
    lines.push(`*${formatCurrency(product.price)}*`);
  }
  lines.push('');
  
  // Product Details
  lines.push(`📋 *Product Details:*`);
  lines.push(`• *Category:* ${product.category}`);
  if (product.subcategory) {
    lines.push(`• *Subcategory:* ${product.subcategory}`);
  }
  lines.push(`• *Material:* ${product.material}`);
  
  // Dimensions
  if (product.width_in || product.height_in || product.depth_in) {
    const dims = [];
    if (product.width_in) dims.push(`W: ${product.width_in}"`);
    if (product.height_in) dims.push(`H: ${product.height_in}"`);
    if (product.depth_in) dims.push(`D: ${product.depth_in}"`);
    lines.push(`• *Dimensions:* ${dims.join(' × ')}`);
  } else if (product.dimensions) {
    lines.push(`• *Dimensions:* ${product.dimensions}`);
  }
  
  if (product.weight) {
    lines.push(`• *Weight:* ${formatWeight(product.weight)}`);
  }
  
  if (product.sku) {
    lines.push(`• *SKU:* ${product.sku}`);
  }
  
  if (product.region_of_origin) {
    lines.push(`• *Origin:* ${product.region_of_origin}`);
  }
  
  if (product.artisan) {
    lines.push(`• *Artisan:* ${product.artisan}`);
  }
  
  // Stock
  const stockInfo = getStockDisplay(product);
  lines.push(`• *Availability:* ${stockInfo.text}`);
  lines.push('');
  
  // Cultural significance
  if (product.related_gods?.length || product.occasions?.length) {
    lines.push(`🕉️ *Cultural Significance:*`);
    if (product.related_gods?.length) {
      lines.push(`• *Related Deities:* ${product.related_gods.join(', ')}`);
    }
    if (product.occasions?.length) {
      lines.push(`• *Occasions:* ${product.occasions.join(', ')}`);
    }
    lines.push('');
  }
  
  // Footer
  lines.push(`🏺 *Narpavi Handicrafts*`);
  lines.push(`_Authentic Indian handicrafts, handcrafted with love_`);
  
  return lines.join('\n');
};

export const generateDescriptionFromData = (product: Product): string => {
  // Check if description exists and is meaningful (not null, not NaN, not too short)
  const hasValidDescription = product.description && 
    typeof product.description === 'string' && 
    product.description.trim() && 
    product.description.trim().length >= 5 &&
    !product.description.toLowerCase().includes('nan') &&
    product.description !== 'null' &&
    product.description !== 'undefined';

  if (hasValidDescription) {
    return product.description.trim();
  }

  // Generate description from available data
  const parts: string[] = [];
  
  // Start with category and material
  if (product.category) {
    parts.push(`This exquisite ${product.category.toLowerCase()}`);
    if (product.material) {
      parts.push(`crafted from premium ${product.material.toLowerCase()}`);
    }
  } else if (product.material) {
    parts.push(`This beautiful ${product.material.toLowerCase()} artifact`);
  } else {
    parts.push("This handcrafted artisan piece");
  }

  // Add origin and artisan info
  if (product.region_of_origin && product.artisan) {
    parts.push(`is meticulously created by skilled artisan ${product.artisan} from the culturally rich region of ${product.region_of_origin}`);
  } else if (product.region_of_origin) {
    parts.push(`originates from the culturally significant region of ${product.region_of_origin}`);
  } else if (product.artisan) {
    parts.push(`is skillfully crafted by artisan ${product.artisan}`);
  }

  // Add cultural significance
  if (product.related_gods && product.related_gods.length > 0) {
    if (product.related_gods.length === 1) {
      parts.push(`This sacred piece is dedicated to ${product.related_gods[0]}`);
    } else {
      parts.push(`This sacred piece is associated with ${product.related_gods.slice(0, -1).join(', ')} and ${product.related_gods[product.related_gods.length - 1]}`);
    }
  }

  // Add occasions
  if (product.occasions && product.occasions.length > 0) {
    if (product.occasions.length === 1) {
      parts.push(`making it perfect for ${product.occasions[0]} celebrations`);
    } else {
      parts.push(`making it ideal for ${product.occasions.slice(0, -1).join(', ')} and ${product.occasions[product.occasions.length - 1]} celebrations`);
    }
  }

  // Add dimensions if available
  if (product.width_in || product.height_in || product.depth_in) {
    const dims: string[] = [];
    if (product.height_in) dims.push(`${product.height_in}" height`);
    if (product.width_in) dims.push(`${product.width_in}" width`);
    if (product.depth_in) dims.push(`${product.depth_in}" depth`);
    
    if (dims.length > 0) {
      parts.push(`With dimensions of ${dims.join(', ')}, this piece offers perfect proportions for any space`);
    }
  }

  // Add weight if available
  if (product.weight) {
    parts.push(`Weighing ${formatWeight(product.weight)}, it provides substantial presence while remaining manageable`);
  }

  // Add quality and authenticity note
  parts.push("Each piece represents authentic Indian craftsmanship and cultural heritage, making it a valuable addition to any collection or a meaningful gift for special occasions.");

  return parts.join('. ') + '.';
};

/**
 * Copy product details to clipboard for easy sharing
 */
export const copyProductToClipboard = async (product: Product): Promise<boolean> => {
  try {
    const description = generateDescriptionFromData(product);
    
    // Create rich text content with image
    const imageUrl = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '';
    
    // Format product details as rich text/HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" style="width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin-bottom: 16px;" />` : ''}
        <h2 style="color: #8B4513; margin: 0 0 12px 0;">${product.name}</h2>
        <p style="color: #666; line-height: 1.6; margin: 0 0 16px 0;">${description}</p>
        
        <div style="background: #f9f7f4; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #8B4513; margin: 0 0 12px 0; font-size: 16px;">Product Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${product.price ? `<tr><td style="padding: 4px 0; color: #8B4513; font-weight: bold;">Price:</td><td style="padding: 4px 0;">${formatCurrency(product.price)}</td></tr>` : ''}
            ${product.category ? `<tr><td style="padding: 4px 0; color: #8B4513; font-weight: bold;">Category:</td><td style="padding: 4px 0;">${product.category}</td></tr>` : ''}
            ${product.material ? `<tr><td style="padding: 4px 0; color: #8B4513; font-weight: bold;">Material:</td><td style="padding: 4px 0;">${product.material}</td></tr>` : ''}
            ${(product.width_in || product.height_in || product.depth_in) ? `<tr><td style="padding: 4px 0; color: #8B4513; font-weight: bold;">Dimensions:</td><td style="padding: 4px 0;">${[product.height_in && `${product.height_in}"`, product.width_in && `${product.width_in}"`, product.depth_in && `${product.depth_in}"`].filter(Boolean).join(' × ')} inches</td></tr>` : ''}
            ${product.weight ? `<tr><td style="padding: 4px 0; color: #8B4513; font-weight: bold;">Weight:</td><td style="padding: 4px 0;">${formatWeight(product.weight)}</td></tr>` : ''}
            ${product.sku ? `<tr><td style="padding: 4px 0; color: #8B4513; font-weight: bold;">SKU:</td><td style="padding: 4px 0;">${product.sku}</td></tr>` : ''}
            ${product.region_of_origin ? `<tr><td style="padding: 4px 0; color: #8B4513; font-weight: bold;">Origin:</td><td style="padding: 4px 0;">${product.region_of_origin}</td></tr>` : ''}
            ${product.artisan ? `<tr><td style="padding: 4px 0; color: #8B4513; font-weight: bold;">Artisan:</td><td style="padding: 4px 0;">${product.artisan}</td></tr>` : ''}
          </table>
        </div>
        
        ${product.related_gods && product.related_gods.length > 0 ? `
          <div style="margin: 16px 0;">
            <h4 style="color: #8B4513; margin: 0 0 8px 0; font-size: 14px;">Related Gods:</h4>
            <p style="margin: 0; color: #666;">${product.related_gods.join(', ')}</p>
          </div>
        ` : ''}
        
        ${product.occasions && product.occasions.length > 0 ? `
          <div style="margin: 16px 0;">
            <h4 style="color: #8B4513; margin: 0 0 8px 0; font-size: 14px;">Occasions:</h4>
            <p style="margin: 0; color: #666;">${product.occasions.join(', ')}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
          <p style="margin: 0;">🏺 Narpavi Artisan Showcase - Authentic Indian Handicrafts</p>
          <p style="margin: 4px 0 0 0;">Preserving Cultural Heritage Through Artisan Excellence</p>
        </div>
      </div>
    `;

    // Plain text fallback
    const textContent = `${product.name}

${description}

Product Details:
${product.price ? `Price: ${formatCurrency(product.price)}\n` : ''}${product.category ? `Category: ${product.category}\n` : ''}${product.material ? `Material: ${product.material}\n` : ''}${(product.width_in || product.height_in || product.depth_in) ? `Dimensions: ${[product.height_in && `${product.height_in}"`, product.width_in && `${product.width_in}"`, product.depth_in && `${product.depth_in}"`].filter(Boolean).join(' × ')} inches\n` : ''}${product.weight ? `Weight: ${formatWeight(product.weight)}\n` : ''}${product.sku ? `SKU: ${product.sku}\n` : ''}${product.region_of_origin ? `Origin: ${product.region_of_origin}\n` : ''}${product.artisan ? `Artisan: ${product.artisan}\n` : ''}
${product.related_gods && product.related_gods.length > 0 ? `Related Gods: ${product.related_gods.join(', ')}\n` : ''}${product.occasions && product.occasions.length > 0 ? `Occasions: ${product.occasions.join(', ')}\n` : ''}
${imageUrl ? `Image: ${imageUrl}\n` : ''}
🏺 Narpavi Artisan Showcase - Authentic Indian Handicrafts
Preserving Cultural Heritage Through Artisan Excellence`;

    // Try to copy as rich content first, fallback to plain text
    if (navigator.clipboard && navigator.clipboard.write) {
      const clipboardItems = [
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([textContent], { type: 'text/plain' })
        })
      ];
      
      await navigator.clipboard.write(clipboardItems);
      return true;
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textContent);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textContent;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Open WhatsApp with pre-filled product details
 */
export const shareProductOnWhatsApp = (product: Product, phoneNumber?: string): void => {
  const formattedText = formatProductForWhatsApp(product);
  const encodedText = encodeURIComponent(formattedText);
  
  let whatsappUrl = `https://wa.me/${phoneNumber ? phoneNumber : ''}?text=${encodedText}`;
  
  // For mobile devices, try to open in WhatsApp app
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    whatsappUrl = `whatsapp://send?${phoneNumber ? `phone=${phoneNumber}&` : ''}text=${encodedText}`;
  }
  
  window.open(whatsappUrl, '_blank');
};
