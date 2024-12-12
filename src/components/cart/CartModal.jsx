import React, { useEffect } from 'react';

const CartModal = ({ showModal, setShowModal }) => {
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 1000); // Auto close after 1 second

      return () => clearTimeout(timer); // Cleanup timeout on unmount or re-render
    }
  }, [showModal, setShowModal]);

  if (!showModal) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 w-80">
      <h2 className="text-xl font-bold mb-2">Item Added to Cart</h2>
      <p className="text-gray-700">Your item has been successfully added to the cart.</p>
    </div>
  );
};

export default CartModal;
