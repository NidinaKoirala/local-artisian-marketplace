import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

// Initialize Stripe with public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const backendUrl = import.meta.env.VITE_BACKEND_URL // Backend URL

const StripePaymentForm = ({ total, onClose, onPaymentConfirmed }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch client secret for Stripe payment intent
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
          setErrorMessage('Failed to initialize payment. Please try again later.');
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
        console.log('Payment succeeded.');
        onPaymentConfirmed(); // Notify parent about successful payment
        onClose(); // Close the payment modal
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
      className="p-8 bg-white rounded-lg shadow-lg max-w-2xl w-full mx-auto space-y-6"
    >
      <h2 className="text-2xl font-bold text-center">Complete Payment</h2>
      <p className="text-gray-700 text-center">
        Amount to Pay: <span className="font-bold">${total.toFixed(2)}</span>
      </p>
      {errorMessage && (
        <div className="p-4 text-red-600 bg-red-100 border border-red-300 rounded-md">
          {errorMessage}
        </div>
      )}
      <div className="border p-4 rounded-lg bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '18px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-3 text-white font-bold rounded-lg transition-colors ${
          isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 text-gray-700 font-bold bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Cancel
      </button>
    </form>
  );
};

const StripePayment = ({ total, onClose, onPaymentConfirmed }) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <StripePaymentForm total={total} onClose={onClose} onPaymentConfirmed={onPaymentConfirmed} />
      </div>
    </Elements>
  );
};

export default StripePayment;
