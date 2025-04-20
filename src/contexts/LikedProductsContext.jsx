import React, { createContext, useState, useContext, useEffect } from 'react';

export const LikedProductsContext = createContext();

export const LikedProductsProvider = ({ children }) => {
  const [likedProducts, setLikedProducts] = useState(() => {
    // Initialize liked products from localStorage if available
    try {
      const savedLikedProducts = localStorage.getItem('likedProducts');
      return savedLikedProducts ? JSON.parse(savedLikedProducts) : [];
    } catch (error) {
      console.error('Error loading liked products from localStorage:', error);
      return [];
    }
  });

  // Save liked products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
    } catch (error) {
      console.error('Error saving liked products to localStorage:', error);
    }
  }, [likedProducts]);

  // Check if a product is liked
  const isProductLiked = (productId) => {
    return likedProducts.some(product => product.id === productId);
  };

  // Add a product to liked products
  const addToLikedProducts = (product) => {
    if (!isProductLiked(product.id)) {
      setLikedProducts([...likedProducts, product]);
    }
  };

  // Remove a product from liked products
  const removeFromLikedProducts = (productId) => {
    setLikedProducts(likedProducts.filter(product => product.id !== productId));
  };

  // Toggle a product's liked status
  const toggleLikedProduct = (product) => {
    if (isProductLiked(product.id)) {
      removeFromLikedProducts(product.id);
    } else {
      addToLikedProducts(product);
    }
  };

  return (
    <LikedProductsContext.Provider
      value={{
        likedProducts,
        addToLikedProducts,
        removeFromLikedProducts,
        isProductLiked,
        toggleLikedProduct
      }}
    >
      {children}
    </LikedProductsContext.Provider>
  );
};

// Custom hook to use the liked products context
export const useLikedProducts = () => useContext(LikedProductsContext); 