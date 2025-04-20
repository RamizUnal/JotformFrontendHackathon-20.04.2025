import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Import logo (you'll need to add your logo file to the assets folder)
import logoImage from '../assets/logo.png'; // Default import path - update with your logo path

const Header = ({ cartItemsCount = 0, onCartClick, onSearch, likedProductsCount = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounce search term to avoid excessive re-renders and processing on each keystroke
  const debounce = useCallback((fn, delay) => {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Use debounced version of search term
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    
    handler();
    
    return () => {
      handler.clear && handler.clear();
    };
  }, [searchTerm, debounce]);

  // Only trigger search when debounced term changes
  useEffect(() => {
    if (onSearch && debouncedTerm !== undefined) {
      onSearch(debouncedTerm);
    }
  }, [debouncedTerm, onSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="bg-gray-50 py-6">
      <header className="max-w-7xl mx-auto bg-white rounded-full shadow-md px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Jotform Store Logo"
                className="h-10 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              {/* Website name - always visible */}
              <span className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">Jotform Store</span>
            </Link>
          </div>

          {/* Right Side - Actions and Search */}
          <div className="flex items-center gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-48 md:w-64 py-2 pl-10 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>

            {/* Liked Products Button */}
            <Link 
              to="/liked-products"
              className="relative flex items-center p-2 text-gray-700 hover:text-rose-500 transition-colors"
              aria-label="Liked Products"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likedProductsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {likedProductsCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative flex items-center p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Shopping Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header; 