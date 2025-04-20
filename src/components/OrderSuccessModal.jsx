import React from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const OrderSuccessModal = ({ isOpen, onClose, orderId, orderTotal }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 transition-opacity duration-300 ease-in-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="mx-auto max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all data-closed:scale-95 data-closed:opacity-0"
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-10 w-10 text-green-600" aria-hidden="true" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">Order Successful!</h3>

              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Thank you for your order. Your order has been received and is being processed.
                </p>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Number:</span>
                  <span className="font-medium text-gray-900">#{orderId}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-medium text-gray-900">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default OrderSuccessModal; 