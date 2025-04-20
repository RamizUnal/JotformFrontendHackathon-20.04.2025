import React, { useState, useEffect, useCallback } from 'react';

const Header = ({ cartItemsCount = 0, onCartClick, onSearch }) => {
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
    <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl font-bold text-blue-600">
          Jotform Store
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1.5 bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </form>

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
    </header>
  );
};

export default Header; 