import React, { useState } from 'react';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [error, setError] = useState('');

  const handleTrackOrder = async () => {
    if (!orderId) {
      setError('Please enter a valid Order ID.');
      return;
    }

    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/order/track/${orderId}`);
      const data = await response.json();

      if (response.ok) {
        setTrackingInfo(data);
      } else {
        setError(data.message || 'Unable to track the order.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mx-4 md:mx-20 my-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Track Your Order</h2>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full md:w-2/3 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleTrackOrder}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Track Order
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {trackingInfo && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-100">
          <h3 className="font-semibold text-lg">Order Status</h3>
          <p><strong>ID:</strong> {trackingInfo.id}</p>
          <p><strong>Status:</strong> {trackingInfo.status}</p>
          <p><strong>Expected Delivery:</strong> {trackingInfo.expectedDelivery}</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
