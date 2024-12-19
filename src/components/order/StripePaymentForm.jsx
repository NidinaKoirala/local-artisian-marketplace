import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'; // Backend URL

const StripePaymentForm = ({ total, onClose, onOrderPlaced }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await fetch(`${backendUrl}/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: Math.round(total * 100) }), // Convert to cents
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setErrorMessage('Failed to initialize payment. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching client secret:', error);
        setErrorMessage('Failed to initialize payment. Please check your connection.');
      }
    };

    fetchClientSecret();
  }, [total]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Payment system is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error('Payment Error:', error);
        setErrorMessage(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        onOrderPlaced?.(paymentIntent);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-md shadow-md max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold mb-4">Complete Payment</h2>
      {errorMessage && (
        <div className="p-4 text-red-600 bg-red-100 border border-red-300 rounded-md mb-4">
          {errorMessage}
        </div>
      )}
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
        className="w-full px-4 py-2 mt-4 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
      >
        Cancel
      </button>
    </form>
  );
};

export default StripePaymentForm;
