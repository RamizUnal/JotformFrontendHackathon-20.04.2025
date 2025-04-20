import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLikedProducts } from '../contexts/LikedProductsContext';
import OptimizedImage from './OptimizedImage';

const ProductPreview = ({ product, isOpen, onClose, onAddToCart, getCartQuantity, onUpdateQuantity }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [connectedProductsData, setConnectedProductsData] = useState([]);
  const { isProductLiked, toggleLikedProduct } = useLikedProducts();
  
  // Clear connected products when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setConnectedProductsData([]);
    }
  }, [isOpen]);
  
  // Fetch connected products data when the product changes
  useEffect(() => {
    const fetchConnectedProducts = async () => {
      if (!product) return;
      
      // Log product and connected products data for debugging
      console.log('Current product:', product.id, product.name);
      console.log('Full product object:', product);
      console.log('Connected products IDs:', product.connectedProducts);
      
      // Check if connected products exist and is an array with items
      if (!product.connectedProducts || 
          !Array.isArray(product.connectedProducts) || 
          product.connectedProducts.length === 0) {
        console.log('No valid connected products found');
        setConnectedProductsData([]);
        return;
      }

      try {
        // Import required functions from API
        const { getStoreProducts, getProductById } = await import('../api/jotformApi');
        
        // Get all products from the store
        const allProducts = await getStoreProducts();
        console.log('All products fetched, count:', allProducts.length);
        console.log('First few products:', allProducts.slice(0, 3));
        
        // Create a map of product IDs for faster lookup
        const productMap = {};
        allProducts.forEach(p => {
          // Store product with both string and number keys to handle any ID format
          productMap[p.id] = p;
          productMap[String(p.id)] = p;
          
          // Also store by key if available
          if (p.key) {
            productMap[p.key] = p;
            productMap[String(p.key)] = p;
          }
        });
        
        // Find each connected product directly
        const relatedProducts = [];
        
        // Track missing product IDs to create placeholders
        const missingProductIds = [];
        
        // Process each connected product ID
        for (const connectedId of product.connectedProducts) {
          const connectedIdStr = String(connectedId);
          
          console.log(`Looking for connected product ID: ${connectedIdStr}`);
          
          // Try to find the product by ID in the map
          let relatedProduct = productMap[connectedIdStr] || productMap[connectedId];
          
          // If not found in the map, try to fetch it directly
          if (!relatedProduct) {
            console.log(`Product ID ${connectedIdStr} not found in map, trying direct fetch...`);
            relatedProduct = await getProductById(connectedIdStr);
          }
          
          if (relatedProduct) {
            console.log('Found related product:', relatedProduct.id, relatedProduct.name);
            relatedProducts.push(relatedProduct);
          } else {
            console.warn('Connected product not found:', connectedIdStr);
            missingProductIds.push(connectedIdStr);
          }
        }
        
        console.log(`Found ${relatedProducts.length} connected products, missing ${missingProductIds.length}`);
        
        // Add placeholder objects for missing products
        // This ensures we at least show something for the missing products
        missingProductIds.forEach(id => {
          relatedProducts.push({
            id: id,
            name: `Product #${id}`,
            price: 0,
            description: "Product information unavailable",
            image: "",
            isMissingProduct: true  // Flag to identify placeholder products
          });
        });
        
        setConnectedProductsData(relatedProducts);
      } catch (error) {
        console.error('Error fetching connected products:', error);
        setConnectedProductsData([]);
      }
    };

    if (isOpen) {
      fetchConnectedProducts();
    }
  }, [product, isOpen]);
  
  if (!product) return null;
  
  const cartQuantity = getCartQuantity ? getCartQuantity(product.id) : 0;
  const isInCart = cartQuantity > 0;
  const productIsLiked = isProductLiked(product.id);
  
  const handleAddToCart = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onAddToCart(product);
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-30">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl data-closed:opacity-0 data-closed:scale-95 data-enter:ease-out data-enter:duration-300 data-leave:ease-in data-leave:duration-200"
          >
            <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="bg-white p-6 sm:p-8">
              <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                <div className="aspect-2/3 w-full sm:col-span-4 lg:col-span-5">
                  {product.image ? (
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      className="rounded-lg"
                      objectFit="cover"
                      height="100%"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                
                <div className="sm:col-span-8 lg:col-span-7">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">{product.name}</h2>
                    <button 
                      onClick={() => toggleLikedProduct(product)}
                      className={`transition-all duration-300 p-2 rounded-full ${productIsLiked ? 'bg-rose-50 text-rose-500' : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'}`}
                      aria-label={productIsLiked ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill={productIsLiked ? "currentColor" : "none"} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  <section aria-labelledby="information-heading" className="mt-2">
                    <h3 id="information-heading" className="sr-only">
                      Product information
                    </h3>

                    <p className="text-2xl text-gray-900">${product.price.toFixed(2)}</p>

                    {product.category && (
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {product.category}
                        </span>
                      </div>
                    )}
                  </section>

                  <section className="mt-4">
                    <div className="prose prose-sm text-gray-500">
                      <p>{product.description || "No description available."}</p>
                    </div>
                  </section>

                  <section className="mt-10">
                    {product.storeName && (
                      <p className="text-xs text-gray-500">
                        From: {product.storeName}
                      </p>
                    )}
                  </section>
                </div>
              </div>
              
              <div className="mt-8 w-full flex justify-center">
                {isInCart ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl overflow-hidden border border-gray-200 w-32">
                      <button 
                        onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                        className="px-3 py-2 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="font-medium">{cartQuantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                        className="px-3 py-2 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">In Your Cart</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 ${isAnimating ? 'scale-95 bg-blue-700' : ''}`}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
              
              {/* Connected Products Section */}
              {connectedProductsData.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">You might also like:</h3>
                  <div className="flex overflow-x-auto gap-4 pb-2">
                    {connectedProductsData.map(relatedProduct => {
                      const relatedCartQuantity = getCartQuantity ? getCartQuantity(relatedProduct.id) : 0;
                      const isRelatedInCart = relatedCartQuantity > 0;
                      const isMissing = relatedProduct.isMissingProduct;
                      
                      return (
                        <div key={relatedProduct.id} className="flex-shrink-0 w-32">
                          <div className={`bg-white rounded-lg shadow-sm border ${isMissing ? 'border-dashed border-gray-300' : 'border-gray-200'} overflow-hidden`}>
                            <div className="h-24 bg-gray-100 relative">
                              {relatedProduct.image ? (
                                <OptimizedImage 
                                  src={relatedProduct.image} 
                                  alt={relatedProduct.name}
                                  className="w-full h-full"
                                  objectFit="cover"
                                  placeholderColor="bg-gray-50"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full bg-gray-100">
                                  {isMissing ? (
                                    <div className="text-center p-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </div>
                              )}
                              
                              {isRelatedInCart && !isMissing && (
                                <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center z-10">
                                  {relatedCartQuantity}
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-medium text-gray-900 line-clamp-1">{relatedProduct.name}</p>
                              {!isMissing ? (
                                <p className="text-xs font-bold text-blue-600 mt-1">${relatedProduct.price.toFixed(2)}</p>
                              ) : (
                                <p className="text-xs italic text-gray-500 mt-1">Product unavailable</p>
                              )}
                              
                              {!isMissing && (isRelatedInCart ? (
                                <div className="mt-2 flex items-center justify-between bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
                                  <button 
                                    onClick={() => onUpdateQuantity(relatedProduct.id, relatedCartQuantity - 1)}
                                    className="px-1 py-1"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                  <span className="text-xs font-medium">{relatedCartQuantity}</span>
                                  <button 
                                    onClick={() => onUpdateQuantity(relatedProduct.id, relatedCartQuantity + 1)}
                                    className="px-1 py-1"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => onAddToCart(relatedProduct)}
                                  className="mt-2 w-full py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                  disabled={isMissing}
                                >
                                  {isMissing ? "Unavailable" : "Add"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductPreview; 