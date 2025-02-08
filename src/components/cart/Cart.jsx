import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTrash, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';

const Cart = ({ cartItems, setCartItems }) => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    // Check if there are cart items in the location state
    const savedCartItems = location.state?.cartItems;
    if (savedCartItems) {
      setCartItems(savedCartItems);
    }
  }, [location, setCartItems]);

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
      // Save cart items to localStorage before redirecting
      localStorage.setItem('tempCartItems', JSON.stringify(cartItems));
      localStorage.setItem('tempCartTotal', JSON.stringify(cartTotal));
      localStorage.setItem('tempShippingFee', JSON.stringify(shippingFee));
      localStorage.setItem('tempGrandTotal', JSON.stringify(grandTotal));
      
      setShowLoginModal(true);
    } else {
      navigate('/place-order', {
        state: {
          cartItems,
          cartTotal,
          shippingFee,
          grandTotal,
        },
      });
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FiShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Your Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">Your cart is empty. Start shopping!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              {cartItems.map((item) => (
                <div key={item.id} className="group flex items-start gap-6 py-6 border-b last:border-0">
                  <img
                    src={item.photos[0]?.url}
                    alt={item.title}
                    className="w-32 h-32 object-cover rounded-xl shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-medium text-blue-600">
                          ${item.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <FaChevronDown className="w-4 h-4" />
                          </button>
                          <span className="text-gray-900 font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <FaChevronUp className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-blue-600 text-lg">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h3>
              <p className="text-gray-600 mb-6">
                Please sign in to complete your purchase. We'll keep your cart items safe!
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/login', { state: { fromCart: true } })}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Sign In Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 