import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Cart from '../components/Cart.jsx';
import ProductPreview from '../components/ProductPreview.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import OrderSuccessModal from '../components/OrderSuccessModal.jsx';
import { getStoreProducts, CURRENT_STORE_ID, searchProducts, submitOrder } from '../api/jotformApi.js';

// Toast notification component
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  
  return (
    <div 
      className={`fixed top-20 right-4 z-50 bg-black text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 flex items-center gap-2 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[-20px] opacity-0 pointer-events-none'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
};

// Quantity Control Component
const QuantityControl = ({ quantity, onIncrease, onDecrease }) => {
  return (
    <div className="flex items-center justify-between w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      <button 
        onClick={onDecrease}
        className="px-3 py-2 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <span className="font-medium text-sm">{quantity}</span>
      <button 
        onClick={onIncrease}
        className="px-3 py-2 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

//Test products yo!
const sampleProducts = [
  {
    id: '1',
    name: 'Product 1',
    price: 19.99,
    description: 'Description of Product 1',
    category: 'Painting',
    storeName: 'Sample Store',
    connectedProducts: JSON.stringify(['2', '3'])
  },
  {
    id: '2',
    name: 'Product 2',
    price: 29.99,
    description: 'Description of Product 2',
    category: 'Sculpture',
    storeName: 'Sample Store',
    connectedProducts: JSON.stringify(['1', '3'])
  },
  {
    id: '3',
    name: 'Product 3',
    price: 39.99,
    description: 'Description of Product 3',
    category: 'Photography',
    storeName: 'Sample Store',
    connectedProducts: JSON.stringify(['1', '2'])
  },
];

const Home = () => {
  const [products, setProducts] = useState(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState([]);
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [storeName, setStoreName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductPreviewOpen, setIsProductPreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 items per page (5 rows x 4 columns)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [animatingCartButtons, setAnimatingCartButtons] = useState({});
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState({ submitting: false, success: null, message: '' });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState({ orderId: '', total: 0 });

  // Define fetchProducts outside useEffect so it can be reused
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      //Use the getStoreProducts function to fetch from the current store
      const storeProducts = await getStoreProducts();
      console.log('Products from store:', storeProducts);
      
      if (storeProducts && storeProducts.length > 0) {
        setProducts(storeProducts);
        
        // Extract unique categories from products
        const allCategories = storeProducts.map(p => p.category).filter(Boolean);
        console.log('All categories found:', allCategories);
        
        const uniqueCategories = ['All', ...new Set(allCategories)];
        console.log('Unique categories:', uniqueCategories);
        setCategories(uniqueCategories);
        
        // Set store name from first product
        if (storeProducts[0].storeName) {
          setStoreName(storeProducts[0].storeName);
        }
        
        console.log('Successfully updated products state with API data');
      } else {
        setError("No products found in the store");
        console.warn('No products found, using sample products');
      }
    } catch (error) {
      setError("Error fetching products. Check console for details.");
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  //Filter products whenever category or search term changes
  useEffect(() => {
    if (products.length > 0) {
      // First apply search
      let results = products;
      if (searchTerm) {
        results = searchProducts(results, searchTerm);
      }
      
      // Then filter by category
      if (activeCategory !== 'All') {
        results = results.filter(product => product.category === activeCategory);
      }
      
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  }, [products, activeCategory, searchTerm]);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Handle search from header
  const handleSearch = (term) => {
    // Only update if the term has actually changed
    if (term !== searchTerm) {
      console.log('Searching for:', term);
      setSearchTerm(term);
      // Reset to first page when search term changes to ensure results are visible
      setCurrentPage(1);
    }
  };

  // Reset current page when category changes
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Reset to first page when category changes
    setCurrentPage(1);
    // Close the category sidebar after selection on mobile
    if (window.innerWidth < 768) {
      setIsCategoryOpen(false);
    }
  };

  // Show notification
  const showNotification = (message) => {
    setNotification({ message, visible: true });
  };

  // Hide notification
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  // Check if a product is in cart
  const getProductCartQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Animate Add to Cart button
  const animateCartButton = (productId) => {
    setAnimatingCartButtons(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAnimatingCartButtons(prev => ({ ...prev, [productId]: false }));
    }, 300);
  };

  const handleAddToCart = (product) => {
    animateCartButton(product.id);
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        showNotification(`Added another ${product.name} to your cart`);
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      showNotification(`${product.name} added to your cart`);
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => (item.id === id ? { ...item, quantity } : item));
      const updatedItem = updatedItems.find(item => item.id === id);
      showNotification(`Updated ${updatedItem.name} quantity to ${quantity}`);
      return updatedItems;
    });
  };

  const handleRemoveFromCart = (id) => {
    const itemToRemove = cartItems.find(item => item.id === id);
    if (itemToRemove) {
      showNotification(`Removed ${itemToRemove.name} from your cart`);
    }
    
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showNotification('Your cart is empty');
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const processCheckout = async (customerInfo) => {
    setOrderStatus({ submitting: true, success: null, message: '' });
    
    try {
      // Make sure customerInfo has the required fields
      if (!customerInfo.fullName || !customerInfo.address) {
        showNotification('Name and address are required');
        return;
      }
      
      console.log('Processing checkout with customer info:', customerInfo);
      console.log('Cart items for checkout:', cartItems);
      
      const result = await submitOrder(cartItems, customerInfo);
      
      if (result.success) {
        const orderTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setOrderStatus({
          submitting: false,
          success: true,
          message: `Order #${result.orderId} placed successfully!`
        });
        
        setSuccessOrderDetails({
          orderId: result.orderId || 'UNKNOWN',
          total: orderTotal
        });
        
        // Close checkout modal and show success modal
        setIsCheckoutModalOpen(false);
        setIsSuccessModalOpen(true);
        
        // Clear cart after successful order
        setCartItems([]);
        try {
          localStorage.removeItem('cartItems'); // Clear the cart in localStorage too
        } catch (error) {
          console.error('Error clearing cart from localStorage:', error);
        }
        setIsCartOpen(false);
        showNotification('Order placed successfully!');
        
        console.log('Order completed successfully:', result);
      } else {
        setOrderStatus({
          submitting: false,
          success: false,
          message: result.message || 'Failed to place order'
        });
        showNotification('Failed to place order: ' + result.message);
        console.error('Order failed:', result.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setOrderStatus({
        submitting: false,
        success: false,
        message: error.message || 'An unexpected error occurred'
      });
      showNotification('An error occurred during checkout');
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductPreviewOpen(true);
  };

  // Get current products for pagination
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle category sidebar
  const toggleCategory = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onSearch={handleSearch}
      />
      
      {/* Toast Notification */}
      <Toast 
        message={notification.message}
        isVisible={notification.visible}
        onClose={hideNotification}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Debug Information */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="text-lg font-semibold text-yellow-800">Debug Info</h3>
          <p className="text-sm text-yellow-700">
            Current Store ID: {CURRENT_STORE_ID}<br/>
            Store Name: {storeName}<br/>
            Categories Found: {categories.join(', ')}<br/>
            Product Count: {products.length}<br/>
            Search Term: {searchTerm ? `"${searchTerm}"` : 'None'}<br/>
            Filtered Products: {filteredProducts.length}
          </p>
        </div>
        
        {/* Main Content with Categories as floating element */}
        <div className="relative">
          {/* Categories Dropdown - Now as a floating element */}
          <div className="sticky top-4 z-20 mb-8">
            <div 
              className="flex items-center justify-between bg-white p-3 pr-4 rounded-xl cursor-pointer shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 max-w-xs mx-auto md:mx-0"
              onClick={toggleCategory}
            >
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span>Categories</span>
                <span className="text-blue-600 text-sm font-semibold px-2 py-0.5 bg-blue-50 rounded-full">
                  {activeCategory}
                </span>
              </h2>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-1">
                  {categories.length} categories
                </span>
                {isCategoryOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
            
            {/* Backdrop overlay when dropdown is open */}
            {isCategoryOpen && (
              <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
                onClick={toggleCategory}
              />
            )}
            
            {/* Category dropdown menu - absolute positioned */}
            <div 
              className={`fixed md:absolute left-4 right-4 md:left-0 md:right-0 md:w-96 top-16 md:top-auto mt-2 bg-white rounded-xl shadow-xl border border-gray-200 transition-all duration-300 ease-in-out z-30 ${
                isCategoryOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="p-4 max-h-[70vh] md:max-h-[400px] overflow-y-auto">
                <div className="flex justify-between items-center mb-3 pb-2 border-b">
                  <h3 className="font-medium text-gray-700">Select Category</h3>
                  <button
                    onClick={toggleCategory} 
                    className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map(category => {
                    // Count products in this category
                    const categoryCount = category === 'All' 
                      ? products.length 
                      : products.filter(p => p.category === category).length;
                    
                    return (
                    <div key={category} className="flex items-center">
                      <button
                        onClick={() => handleCategoryChange(category)}
                        className={`flex items-center text-sm py-2 px-3 rounded-lg w-full transition-colors ${
                          activeCategory === category
                            ? 'font-semibold text-white bg-blue-600 shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 bg-white border border-gray-200'
                        }`}
                      >
                        {activeCategory === category && (
                          <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                        )}
                        <span className="truncate">{category}</span>
                        <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${
                          activeCategory === category 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {categoryCount}
                        </span>
                      </button>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchTerm ? `Search Results: "${searchTerm}"` : 'Featured Products'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Sort by:</span>
                <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Popular</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
                </div>
                <p className="ml-4 text-lg text-gray-600">Loading products...</p>
              </div>
            ) : error ? (
              <div className="bg-white/70 backdrop-blur-sm border border-red-100 rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{error}</h3>
                <p className="text-gray-600 mb-6">We're showing sample products instead. Please try again later.</p>
                <button onClick={fetchProducts} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium">
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No matching products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or category filters.</p>
                <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentProducts.map((product) => {
                    const cartQuantity = getProductCartQuantity(product.id);
                    const isInCart = cartQuantity > 0;
                    const isAnimating = animatingCartButtons[product.id];
                    
                    return (
                      <div key={product.id} className="group">
                        <div 
                          className="bg-white overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col"
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="h-40 bg-gray-100 relative overflow-hidden">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Cart badge if in cart */}
                            {isInCart && (
                              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                {cartQuantity}
                              </div>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {isInCart ? (
                                <div 
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full"
                                >
                                  <QuantityControl 
                                    quantity={cartQuantity} 
                                    onIncrease={() => handleUpdateQuantity(product.id, cartQuantity + 1)}
                                    onDecrease={() => handleUpdateQuantity(product.id, cartQuantity - 1)}
                                  />
                                </div>
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product);
                                  }}
                                  className={`w-full bg-white hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl py-2 font-medium transition-all duration-300 ${isAnimating ? 'scale-95 bg-blue-600 text-white' : ''}`}
                                >
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                            <div className="flex items-center mt-1">
                              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {product.category || 'Uncategorized'}
                              </span>
                            </div>
                            <p className="mt-2 text-gray-600 text-xs line-clamp-2 flex-grow">{product.description}</p>
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-base font-bold text-blue-600">${product.price ? product.price.toFixed(2) : '0.00'}</span>
                              <div className="flex space-x-2">
                                {isInCart ? (
                                  <span className="text-xs font-medium px-2 py-1 text-blue-600">
                                    In Cart: {cartQuantity}
                                  </span>
                                ) : (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(product);
                                    }}
                                    className={`text-gray-500 hover:text-blue-600 transition-colors ${isAnimating ? 'scale-125 text-blue-600' : ''}`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center gap-2" aria-label="Pagination">
                      {/* Previous button */}
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {totalPages <= 7 ? (
                        // If there are 7 or fewer pages, show all page numbers
                        [...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                              currentPage === index + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))
                      ) : (
                        // If there are more than 7 pages, use ellipsis
                        <>
                          {/* Always show first page */}
                          <button
                            onClick={() => paginate(1)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                              currentPage === 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            1
                          </button>
                          
                          {/* Show ellipsis or second page */}
                          {currentPage > 3 && (
                            <span className="w-10 h-10 flex items-center justify-center text-gray-500">
                              ...
                            </span>
                          )}
                          
                          {/* Show current page and surrounding pages */}
                          {/* Simplified logic to show at most 2 pages before and after current page */}
                          {Array.from({ length: totalPages }).map((_, i) => {
                            const pageNumber = i + 1;
                            // Only show if it's not the first or last page
                            // And it's within 2 pages of current page
                            if (pageNumber !== 1 && 
                                pageNumber !== totalPages && 
                                Math.abs(currentPage - pageNumber) <= 2) {
                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => paginate(pageNumber)}
                                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                    currentPage === pageNumber
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {pageNumber}
                                </button>
                              );
                            }
                            return null;
                          }).filter(Boolean)}
                          
                          {/* Show ellipsis or second-to-last page */}
                          {currentPage < totalPages - 2 && (
                            <span className="w-10 h-10 flex items-center justify-center text-gray-500">
                              ...
                            </span>
                          )}
                          
                          {/* Always show last page */}
                          <button
                            onClick={() => paginate(totalPages)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                              currentPage === totalPages
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                      
                      {/* Next button */}
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="mt-20 bg-blue-600 rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-2/3">
              <h2 className="text-3xl font-bold text-white mb-4">Subscribe to our newsletter</h2>
              <p className="text-blue-100 mb-8">Subscribe to receive updates about new arrivals, special offers, and artist stories.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-grow px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button className="bg-white hover:bg-gray-100 text-blue-600 font-medium px-6 py-3 rounded-xl transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
            <div className="hidden md:block md:w-1/3 bg-blue-700 relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80')] bg-cover bg-center mix-blend-multiply opacity-20"></div>
            </div>
          </div>
        </div>
      </main>
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
        allProducts={products}
        onAddToCart={handleAddToCart}
      />

      <ProductPreview
        product={selectedProduct}
        isOpen={isProductPreviewOpen}
        onClose={() => setIsProductPreviewOpen(false)}
        onAddToCart={handleAddToCart}
        getCartQuantity={getProductCartQuantity}
        onUpdateQuantity={handleUpdateQuantity}
      />
      
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSubmit={processCheckout}
        cartItems={cartItems}
        total={cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
      />
      
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        orderId={successOrderDetails.orderId}
        orderTotal={successOrderDetails.total}
      />
    </div>
  );
};

export default Home; 