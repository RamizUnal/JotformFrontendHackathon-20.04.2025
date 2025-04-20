import React, { createContext, useState, useContext, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Initialize cart from localStorage if available
    try {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Check if a product is in cart
  const getProductCartQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Add product to cart
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Update quantity in cart
  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      removeFromCart(id);
    } else {
      // Update quantity
      setCartItems(prevItems => 
        prevItems.map(item => item.id === id ? { ...item, quantity } : item)
      );
    }
  };

  // Remove from cart
  const removeFromCart = (id) => {
    if (Array.isArray(id)) {
      // If an array of IDs is provided, remove all those items
      setCartItems(prevItems => prevItems.filter(item => !id.includes(item.id)));
    } else {
      // Remove a single item
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    }
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getProductCartQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext); 