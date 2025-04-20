import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Cart from '../components/Cart';
import { useLikedProducts } from '../contexts/LikedProductsContext';
import { useCart } from '../contexts/CartContext';
import ProductPreview from '../components/ProductPreview';
import OptimizedImage from '../components/OptimizedImage';

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

const LikedProducts = () => {
  const { likedProducts, removeFromLikedProducts } = useLikedProducts();
  const { 
    cartItems, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    getProductCartQuantity 
  } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductPreviewOpen, setIsProductPreviewOpen] = useState(false);
  const [animatingCartButtons, setAnimatingCartButtons] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('default');
  const [sortedProducts, setSortedProducts] = useState([]);
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'in-cart'

  // Sort and filter the liked products whenever they change or sort/filter settings change
  useEffect(() => {
    let filtered = [...likedProducts];
    
    // Apply filtering
    if (filterBy === 'in-cart') {
      filtered = filtered.filter(product => getProductCartQuantity(product.id) > 0);
    }
    
    // Apply sorting
    if (sortOrder === 'price-asc') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }
    
    setSortedProducts(filtered);
  }, [likedProducts, sortOrder, filterBy, getProductCartQuantity]);

  // Animate Add to Cart button
  const animateCartButton = (productId) => {
    setAnimatingCartButtons(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAnimatingCartButtons(prev => ({ ...prev, [productId]: false }));
    }, 300);
  };

  // Handle clicking on a product to open the preview
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductPreviewOpen(true);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    animateCartButton(product.id);
    addToCart(product);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)}
        likedProductsCount={likedProducts.length}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Store
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Liked Products</h1>
          {likedProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Filter by:</span>
                <select 
                  className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                  value={filterBy}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Products</option>
                  <option value="in-cart">In Cart</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Sort by:</span>
                <select 
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                  value={sortOrder}
                  onChange={handleSortChange}
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 mb-8">
          {likedProducts.length === 0 ? 
            "You haven't liked any products yet. Explore our store and click the heart icon to save products you love!" : 
            `You have ${likedProducts.length} liked product${likedProducts.length === 1 ? '' : 's'}${
              filterBy === 'in-cart' ? ` (showing ${sortedProducts.length} in cart)` : ''
            }.`}
        </p>
        
        {likedProducts.length > 0 ? (
          sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map(product => {
                const cartQuantity = getProductCartQuantity(product.id);
                const isInCart = cartQuantity > 0;
                const isAnimating = animatingCartButtons[product.id];
                
                return (
                  <div key={product.id} className="group">
                    <div 
                      className="bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col relative"
                    >
                      <div className="absolute top-4 right-4 z-10">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromLikedProducts(product.id);
                          }}
                          className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                          aria-label="Remove from liked products"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <div 
                        className="h-40 bg-gray-100 relative overflow-hidden"
                        onClick={() => handleProductClick(product)}
                      >
                        {product.image ? (
                          <OptimizedImage 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full"
                            objectFit="cover"
                            placeholderColor="bg-gray-100"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Cart badge if in cart */}
                        {isInCart && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center z-10">
                            {cartQuantity}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 flex flex-col flex-grow" onClick={() => handleProductClick(product)}>
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {product.category || 'Uncategorized'}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600 text-xs line-clamp-2 flex-grow">{product.description}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-base font-bold text-blue-600">
                            ${product.price ? product.price.toFixed(2) : '0.00'}
                          </span>
                          
                          {isInCart ? (
                            <div className="w-32" onClick={(e) => e.stopPropagation()}>
                              <QuantityControl 
                                quantity={cartQuantity} 
                                onIncrease={() => updateCartQuantity(product.id, cartQuantity + 1)}
                                onDecrease={() => updateCartQuantity(product.id, cartQuantity - 1)}
                              />
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                                animateCartButton(product.id);
                              }}
                              className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-medium transition-all ${isAnimating ? 'scale-95' : ''}`}
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 text-center">
              <div className="inline-block p-6 rounded-full bg-blue-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">No products in cart</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {filterBy === 'in-cart' ? 'None of your liked products are in your cart yet.' : ''}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setFilterBy('all')}
                  className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Show All Liked Products
                </button>
                <Link 
                  to="/" 
                  className="inline-flex items-center justify-center px-5 py-3 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="mt-8 text-center">
            <div className="inline-block p-6 rounded-full bg-gray-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">No liked products yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Discover products you love and click the heart icon to save them for later.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      {/* Product Preview Modal */}
      {selectedProduct && (
        <ProductPreview 
          product={selectedProduct}
          isOpen={isProductPreviewOpen}
          onClose={() => setIsProductPreviewOpen(false)}
          onAddToCart={handleAddToCart}
          getCartQuantity={getProductCartQuantity}
          onUpdateQuantity={updateCartQuantity}
        />
      )}
      
      {/* Cart Sidebar */}
      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {}}
        allProducts={likedProducts}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default LikedProducts; 