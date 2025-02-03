import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const Cart = ({ cartItems, setCartItems }) => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = 1.25;
  const grandTotal = cartTotal + shippingFee;

  const increaseQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handlePayment = () => {
    if (!user) {
      setShowLoginModal(true); // Show modal if user is not logged in
    } else {
      navigate('/place-order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Your cart is empty. Start shopping!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row gap-8">
            {/* Left Side: Cart Items */}
            <div className="flex-1">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b last:border-0"
                  >
                    <img
                      src={item.photos[0]?.url}
                      alt={item.title}
                      className="w-full sm:w-32 h-32 object-cover rounded-xl"
                    />

                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-medium text-gray-900">
                            ${item.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <FaChevronDown className="w-4 h-4" />
                            </button>
                            <span className="text-gray-900 font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(item.id)}
                              className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <FaChevronUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="w-full sm:w-96 bg-gray-100 rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg pt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-blue-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h3>
            <p className="text-gray-600 mb-6">
              You need to be logged in to complete your purchase. Please sign in or create an account.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/login', { state: { fromCart: true } })}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
