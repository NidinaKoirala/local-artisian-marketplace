import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StripePayment from './StripePayment';

const backendUrl = import.meta.env.VITE_BACKEND_URL

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
    <div className="p-10 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-4">Place Order</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold">Shipping Address</h3>
        {isEditingAddress ? (
          <input
            type="text"
            name="addressLine1"
            value={addressData.addressLine1 || ''}
            onChange={handleAddressChange}
            placeholder="Address Line 1"
            className="w-full mb-2 px-4 py-2 border rounded-md"
          />
        ) : (
          <>
            <p>{user?.fullName}</p>
            <p>{user?.email}</p>
            <p>{user?.phoneNumber}</p>
            <p>{user?.addressLine1}</p>
          </>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold">Order Summary</h3>
        {orderItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center border-b py-3">
            <span>{item.title} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center mt-4 font-bold">
          <span>Items Total</span>
          <span>${itemsTotal.toFixed(2)}</span>
        </div>
        {paymentMethod === 'COD' && (
          <div className="flex justify-between items-center mt-1">
            <span>Delivery Fee (COD)</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center mt-4 text-lg font-bold">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold">Payment Method</h3>
        <div className="flex space-x-4">
          <div
            onClick={() => setPaymentMethod('COD')}
            className={`cursor-pointer px-4 py-2 border rounded-md text-center ${
              paymentMethod === 'COD' ? 'bg-indigo-500 text-white' : 'bg-gray-200'
            }`}
          >
            Cash on Delivery
          </div>
          <div
            onClick={() => setPaymentMethod('Card')}
            className={`cursor-pointer px-4 py-2 border rounded-md text-center ${
              paymentMethod === 'Card' ? 'bg-indigo-500 text-white' : 'bg-gray-200'
            }`}
          >
            Credit/Debit Card
          </div>
        </div>
      </div>

      <button
        onClick={handlePayNow}
        className={`w-full ${isProcessing ? 'bg-gray-400' : 'bg-indigo-600'} text-white py-2 rounded-lg font-medium hover:bg-indigo-500 transition-colors`}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Place Order'}
      </button>

      {orderMessage && (
        <div className="mt-6 text-center">
          <p
            className={`text-lg font-semibold ${
              orderMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {orderMessage}
          </p>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Login Required</h3>
            <button
              onClick={goToLogin}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors mb-4"
            >
              Login
            </button>
          </div>
        </div>
      )}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h3 className="text-2xl font-bold mb-4">Order Placed Successfully!</h3>
            <p className="mb-4">What would you like to do next?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500 transition"
              >
                View Order History
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition"
              >
                Go to Homepage
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
