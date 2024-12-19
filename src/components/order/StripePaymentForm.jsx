import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'; // Use the backend URL from environment variables

const StripePaymentForm = ({ total, onClose, onOrderPlaced }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    // Fetch the client secret from the backend
    const fetchClientSecret = async () => {
      try {
        const response = await fetch(`${backendUrl}/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: Math.round(total * 100) }), // Amount in cents
        });

        const data = await response.json();
        console.log('Client Secret:', data.clientSecret); // Debug log
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error fetching client secret:', error);
      }
    };

    fetchClientSecret();
  }, [total]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      alert('Stripe is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error('Payment Error:', error);
        alert('Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Trigger order placement
        await placeOrder();
        setPaymentStatus('success');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const placeOrder = async () => {
    try {
      const response = await fetch(`${backendUrl}/order/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'Card',
          totalAmount: total,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order.');
      }

      const orderData = await response.json();
      console.log('Order placed successfully:', orderData);
      onOrderPlaced(orderData); // Callback to update parent component
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please contact support.');
    }
  };

  if (!stripe || !elements) {
    console.log('Stripe or Elements not ready:', { stripe, elements });
    return <p>Loading payment form...</p>;
  }

  return (
    <div>
      {paymentStatus === 'success' ? (
        <div className="p-6 bg-white rounded-md shadow-md max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold text-green-600">Payment Successful!</h2>
          <p>Your order has been placed successfully.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-md shadow-md max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Complete Payment</h2>
          <p className="text-gray-600">
            Amount to Pay: <span className="font-bold">${total.toFixed(2)}</span>
          </p>
          <div className="border p-2 rounded-md bg-gray-50">
            <CardElement />
          </div>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className={`w-full px-4 py-2 text-white font-bold rounded-md ${
              isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default StripePaymentForm;
