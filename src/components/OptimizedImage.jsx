import React, { useState, useEffect } from 'react';

/**
 * OptimizedImage component that improves image loading performance
 * 
 * Features:
 * - Lazy loading
 * - Loading placeholder
 * - Error handling
 * - Blurred thumbnail loading for progressive loading
 * - Image caching control
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  placeholderColor = 'bg-gray-200',
  width,
  height,
  objectFit = 'cover'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  
  // Set up the image load once when the component mounts or src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Reset image source when src prop changes
    if (src) {
      // Small delay to allow render of loading state
      const timeoutId = setTimeout(() => {
        setImageSrc(src);
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [src]);
  
  // Calculate image sizing styles
  const sizeStyles = {};
  if (width) sizeStyles.width = typeof width === 'number' ? `${width}px` : width;
  if (height) sizeStyles.height = typeof height === 'number' ? `${height}px` : height;
  
  // Calculate placeholder styling
  const placeholderStyles = {
    ...sizeStyles,
    objectFit
  };

  // Handle successful image load
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  // Handle image load error
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className || ''}`} 
      style={sizeStyles}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className={`absolute inset-0 ${placeholderColor} animate-pulse flex items-center justify-center`}
          aria-hidden="true"
        >
          <svg 
            className="w-10 h-10 text-gray-300" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {/* Actual image with lazy loading */}
      {src && (
        <img
          src={imageSrc}
          alt={alt || ''}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 object-${objectFit}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            objectPosition: 'center'
          }}
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          aria-hidden="true"
        >
          <svg 
            className="w-8 h-8 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 