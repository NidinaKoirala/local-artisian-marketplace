import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StripePayment from './StripePayment';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const PlaceOrder = ({ cartItems = [], setCartItems }) => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressData, setAddressData] = useState({});
  const [orderMessage, setOrderMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Default payment method
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const CODCharge = 1.25; // Delivery Fee for COD

  const navigate = useNavigate();
  const location = useLocation();

  const product = location.state?.product;
  const quantity = location.state?.quantity || 1;

  const orderItems = product ? [{ ...product, quantity }] : cartItems;

  const itemsTotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = paymentMethod === 'COD' ? CODCharge : 0;
  const grandTotal = itemsTotal + deliveryFee;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
          setShowLoginModal(true);
          return;
        }

        const response = await fetch(`${backendUrl}/user/${storedUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        setUser(data);
        setAddressData({
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        });
      } catch (error) {
        console.error(error);
        setOrderMessage('Error loading user details. Please try again later.');
      }
    };

    fetchUserDetails();
  }, []);

  const handleEditAddressToggle = () => setIsEditingAddress((prev) => !prev);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData({ ...addressData, [name]: value });
  };

  const handleSaveAddress = async () => {
    try {
      const response = await fetch(`${backendUrl}/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...user, ...addressData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingAddress(false);
    } catch (error) {
      console.error(error);
      setOrderMessage('Failed to save address. Please try again.');
    }
  };

  const handlePayNow = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (paymentMethod === 'Card') {
      setShowStripePayment(true);
      return;
    }

    placeOrder(); // For COD
  };

  const placeOrder = async () => {
    setIsProcessing(true);
    setOrderMessage('');

    try {
      const response = await fetch(`${backendUrl}/order/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          orderItems,
          paymentMethod,
          amount: Math.round(grandTotal * 100), // Send amount in cents
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const result = await response.json();
      setOrderMessage('Order placed successfully! View your order history.');

      if (setCartItems) {
        setCartItems([]);
        localStorage.setItem('cartItems', JSON.stringify([]));
      }

      // Trigger success popup
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderMessage(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeSuccess = async () => {
    setIsProcessing(true); // Ensure consistent state updates
    setOrderMessage('Payment confirmed! Placing your order...');
    
    try {
        const response = await fetch(`${backendUrl}/order/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                orderItems,
                paymentMethod: 'Card', // Explicitly indicate payment method as Card
                amount: Math.round(grandTotal * 100), // Send amount in cents
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to place order');
        }

        const result = await response.json();

        setOrderMessage('Order placed successfully! View your order history.');

        if (setCartItems) {
            setCartItems([]);
            localStorage.setItem('cartItems', JSON.stringify([]));
        }
        setShowStripePayment(false); // Close the payment modal
        setShowSuccessPopup(true);        
    } catch (error) {
        console.error('Error placing order after payment:', error);
        setOrderMessage(error.message || 'Failed to place order. Please try again.');
    } finally {
        setIsProcessing(false);
    }
};


  const closeModal = () => setShowLoginModal(false);

  const goToLogin = () => {
    closeModal();
    navigate('/login', { state: { redirectAfterLogin: '/place-order', product, quantity } });
  };
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            {/* Error Message Modal */}
            {orderMessage && !orderMessage.includes('successfully') && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4 text-red-600">Error Occurred</h3>
                  <p className="text-gray-600 mb-4">{orderMessage}</p>
                  <button
                    onClick={() => setOrderMessage('')}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}  
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Section - Items and Address */}
            <div className="lg:w-2/3 space-y-6">
              {/* Shipping Address Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Shipping Address</h2>
                  <button
                    onClick={handleEditAddressToggle}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {isEditingAddress ? 'Cancel' : 'Edit'}
                  </button>
                </div>
  
                {isEditingAddress ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="addressLine1"
                      value={addressData.addressLine1 || ''}
                      onChange={handleAddressChange}
                      placeholder="Street Address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSaveAddress}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-500 transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-gray-600">
                    <p className="font-medium">{user?.fullName}</p>
                    <p>{user?.addressLine1}</p>
                    {user?.addressLine2 && <p>{user?.addressLine2}</p>}
                    <p>{user?.city}, {user?.state} {user?.postalCode}</p>
                    <p>{user?.country}</p>
                    <p className="mt-2">{user?.email}</p>
                    <p>{user?.phoneNumber}</p>
                  </div>
                )}
              </div>
  
              {/* Order Items Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Items</h2>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
            {/* Right Section - Summary and Payment */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-xl shadow-sm sticky top-8">
                {/* Order Summary */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${itemsTotal.toFixed(2)}</span>
                  </div>
                  {paymentMethod === 'COD' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">COD Fee</span>
                      <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-semibold text-indigo-600">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
  
                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Payment Method</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentMethod('COD')}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        paymentMethod === 'COD'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <span className="font-medium">Cash on Delivery</span>
                      <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('Card')}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        paymentMethod === 'Card'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <span className="font-medium">Credit/Debit Card</span>
                      <p className="text-sm text-gray-500 mt-1">Secure online payment</p>
                    </button>
                  </div>
                </div>
  
                {/* Place Order Button */}
                <button
                  onClick={handlePayNow}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
  
        {/* Keep all modals and popups from original code */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4">Login Required</h3>
              <button
                onClick={goToLogin}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-500 transition-colors"
              >
                Continue to Login
              </button>
            </div>
          </div>
        )}
  
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm w-full mx-4">
            <h3 className="text-2xl font-bold mb-4 text-center">Order Confirmed!</h3>
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => navigate('/profile')}
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
  
        {showStripePayment && (
          <StripePayment
            total={grandTotal}
            onClose={() => setShowStripePayment(false)}
            onPaymentConfirmed={handleStripeSuccess}
          />
        )}
      </div>
    );
  };
  
  export default PlaceOrder;
