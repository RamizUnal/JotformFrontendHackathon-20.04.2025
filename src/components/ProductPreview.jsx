import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLikedProducts } from '../contexts/LikedProductsContext';

const ProductPreview = ({ product, isOpen, onClose, onAddToCart, getCartQuantity, onUpdateQuantity }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { isProductLiked, toggleLikedProduct } = useLikedProducts();
  
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
                    <img
                      alt={product.name}
                      src={product.image}
                      className="h-full w-full rounded-lg bg-gray-100 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
                      }}
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
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductPreview; 