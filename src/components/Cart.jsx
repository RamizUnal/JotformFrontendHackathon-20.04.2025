import React, { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Cart = ({
  items = [],
  onUpdateQuantity,
  onRemove,
  onCheckout,
  onClose,
  isOpen,
  allProducts = [],
  onAddToCart
}) => {
  const [animatingItems, setAnimatingItems] = useState({});
  const [recommendedAnimating, setRecommendedAnimating] = useState({});
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (id, newQuantity) => {
    // Animate the quantity button
    setAnimatingItems(prev => ({ ...prev, [id]: 'quantity' }));
    setTimeout(() => {
      setAnimatingItems(prev => ({ ...prev, [id]: null }));
    }, 300);
    
    onUpdateQuantity(id, newQuantity);
  };
  
  const handleRemove = (id) => {
    // Animate the item before removal
    setAnimatingItems(prev => ({ ...prev, [id]: 'remove' }));
    setTimeout(() => {
      onRemove(id);
    }, 300);
  };

  // Get connected products for all items in cart
  const getConnectedProducts = () => {
    if (!allProducts || allProducts.length === 0 || !items || items.length === 0) return [];
    
    // Get all connected product IDs from cart items
    const connectedProductIds = new Set();
    
    items.forEach(item => {
      if (item.connectedProducts) {
        try {
          // Parse the connectedProducts JSON string if it exists
          const connected = JSON.parse(item.connectedProducts);
          if (Array.isArray(connected)) {
            connected.forEach(id => connectedProductIds.add(id.toString()));
          }
        } catch (error) {
          console.error("Error parsing connected products:", error);
        }
      }
    });
    
    // Filter out products that are already in the cart
    const cartProductIds = new Set(items.map(item => item.id.toString()));
    const filteredIds = [...connectedProductIds].filter(id => !cartProductIds.has(id));
    
    // Find the actual product objects
    const recommendations = filteredIds
      .map(id => allProducts.find(product => product.id.toString() === id))
      .filter(Boolean); // Remove any undefined values
    
    return recommendations;
  };

  // Handle adding a recommended product to cart
  const handleAddRecommended = (product) => {
    setRecommendedAnimating(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setRecommendedAnimating(prev => ({ ...prev, [product.id]: false }));
    }, 300);
    
    onAddToCart(product);
  };

  const recommendedProducts = getConnectedProducts();
  const hasRecommendations = recommendedProducts.length > 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-300"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                      Your Cart ({items.reduce((sum, item) => sum + item.quantity, 0)} {items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'})
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {items.length > 0 ? (
                    <div className="mt-8">
                      <div className="flow-root">
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {items.map((item) => (
                            <li 
                              key={item.id} 
                              className={`flex py-6 transition-all duration-300 ${
                                animatingItems[item.id] === 'remove' 
                                  ? 'opacity-0 transform translate-x-full' 
                                  : 'opacity-100'
                              }`}
                            >
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="h-full w-full object-cover object-center"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                    }}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full bg-gray-100">
                                    <span className="text-gray-400 text-xs">No image</span>
                                  </div>
                                )}
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.name}</h3>
                                    <p className="ml-4">${item.price.toFixed(2)}</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">{item.category || 'Uncategorized'}</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <div className={`flex items-center border rounded-md overflow-hidden transition-all duration-200 ${
                                    animatingItems[item.id] === 'quantity' ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                  }`}>
                                    <button 
                                      onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                      className="px-3 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                    <span className="px-3 py-1 text-gray-800 font-medium">{item.quantity}</span>
                                    <button 
                                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                      className="px-3 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>

                                  <div className="flex">
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemove(item.id)}
                                      className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                      Remove All
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start adding some items to your cart!
                      </p>
                      <div className="mt-6">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transform transition-transform active:scale-95"
                          onClick={onClose}
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Recommended Products Section */}
                  {items.length > 0 && hasRecommendations && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-base font-medium text-gray-900 mb-4">You might also like</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {recommendedProducts.map(product => (
                          <div 
                            key={product.id} 
                            className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all"
                          >
                            <div className="aspect-square w-full relative bg-gray-100 overflow-hidden">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                                  <span className="text-xs">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h4>
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</p>
                                <button
                                  onClick={() => handleAddRecommended(product)}
                                  className={`text-xs font-medium px-2 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all ${
                                    recommendedAnimating[product.id] ? 'scale-90' : 'scale-100'
                                  }`}
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>${total.toFixed(2)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                    <div className="mt-6">
                      <button
                        onClick={onCheckout}
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-all transform hover:scale-[1.01] active:scale-[0.98]"
                      >
                        Checkout
                      </button>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                      <p>
                        or{' '}
                        <button
                          type="button"
                          onClick={onClose}
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Continue Shopping
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default Cart; 