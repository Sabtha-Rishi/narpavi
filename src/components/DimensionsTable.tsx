import React from 'react';
import { Product } from '@/types';

interface DimensionsTableProps {
  product: Product;
  compact?: boolean;
}

const DimensionsTable: React.FC<DimensionsTableProps> = ({ product, compact = false }) => {
  const hasDbDimensions = product.width_in || product.height_in || product.depth_in;
  
  if (hasDbDimensions) {
    // Use database fields directly for exact dimensions in inches
    const width = product.width_in || 0;
    const height = product.height_in || 0;
    const depth = product.depth_in || 0;
    
    // If showing as "H x W x D Inches" format
    if (compact) {
      return (
        <div className="inline-flex items-center px-2 py-1 bg-earthy-beige/20 rounded-full text-xs text-earthy-brown border border-earthy-beige/50">
          <span className="font-medium">
            {height > 0 && `${height}"`}
            {height > 0 && width > 0 && " × "}
            {width > 0 && `${width}"`}
            {(height > 0 || width > 0) && depth > 0 && " × "}
            {depth > 0 && `${depth}"`}
            {(height > 0 || width > 0 || depth > 0) && " in"}
          </span>
        </div>
      );
    }
    
    // Enhanced table view for details - full width
    return (
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-earthy-beige/10 to-earthy-ochre/10 rounded-lg border border-earthy-beige/30 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-earthy-brown text-white px-4 py-3 text-center">
            <span className="text-sm font-bold uppercase tracking-wider">DIMENSIONS</span>
          </div>
          
          {/* Table Body */}
          <div className="bg-white">
            <table className="w-full">
              <tbody>
                {height > 0 && (
                  <tr className="border-b border-earthy-beige/20 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-earthy-brown/80 bg-earthy-beige/5 w-1/2">Height:</td>
                    <td className="px-4 py-3 text-right font-semibold text-earthy-brown w-1/2">
                      <span className="inline-flex items-center">
                        {height}
                        <span className="text-sm text-earthy-brown/60 ml-1">inches</span>
                      </span>
                    </td>
                  </tr>
                )}
                {width > 0 && (
                  <tr className="border-b border-earthy-beige/20 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-earthy-brown/80 bg-earthy-beige/5 w-1/2">Width:</td>
                    <td className="px-4 py-3 text-right font-semibold text-earthy-brown w-1/2">
                      <span className="inline-flex items-center">
                        {width}
                        <span className="text-sm text-earthy-brown/60 ml-1">inches</span>
                      </span>
                    </td>
                  </tr>
                )}
                {depth > 0 && (
                  <tr className="border-b border-earthy-beige/20 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-earthy-brown/80 bg-earthy-beige/5 w-1/2">Depth:</td>
                    <td className="px-4 py-3 text-right font-semibold text-earthy-brown w-1/2">
                      <span className="inline-flex items-center">
                        {depth}
                        <span className="text-sm text-earthy-brown/60 ml-1">inches</span>
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Summary Footer */}
          <div className="bg-earthy-beige/15 px-4 py-3 border-t border-earthy-beige/30">
            <div className="text-center">
              <span className="text-sm text-earthy-brown/70 font-medium">Overall: </span>
              <span className="text-sm font-mono font-bold text-earthy-brown">
                {height > 0 && `${height}"`}
                {height > 0 && width > 0 && " × "}
                {width > 0 && `${width}"`}
                {(height > 0 || width > 0) && depth > 0 && " × "}
                {depth > 0 && `${depth}"`} in
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback: Only show legacy dimension string if no DB fields and only in compact mode
  if (product.dimensions && typeof product.dimensions === 'string' && compact) {
    return (
      <div className="inline-flex items-center px-2 py-1 bg-earthy-beige/20 rounded-full text-xs text-earthy-brown border border-earthy-beige/50">
        <span className="font-medium">{product.dimensions}</span>
      </div>
    );
  }
  
  return null;
};

export default DimensionsTable; 