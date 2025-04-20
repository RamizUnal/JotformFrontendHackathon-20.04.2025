import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ProductPreview = ({ product, isOpen, onClose, onAddToCart, getCartQuantity, onUpdateQuantity }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  if (!product) return null;
  
  const cartQuantity = getCartQuantity ? getCartQuantity(product.id) : 0;
  const isInCart = cartQuantity > 0;
  
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

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
          <DialogPanel
            transition
            className="flex w-full transform text-left text-base transition data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:my-8 md:max-w-2xl md:px-4 data-closed:md:translate-y-0 data-closed:md:scale-95 lg:max-w-4xl"
          >
            <div className="relative flex w-full flex-col items-center overflow-hidden bg-white px-4 pt-14 pb-8 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-8 lg:right-8"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>

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
                  <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">{product.name}</h2>

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