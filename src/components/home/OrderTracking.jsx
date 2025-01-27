import React, { useState } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const OrderTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async () => {
    if (!orderId) {
      setError("Please enter a valid Order ID.");
      return;
    }

    setLoading(true);
    setError("");
    setOrderData(null);

    try {
      const response = await axios.get(`${backendUrl}/order/timeline?orderId=${orderId}`);
      setOrderData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "No Order Found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        className="bg-gray-100 bg-opacity-70 border border-gray-300 text-gray-900 placeholder-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button
        onClick={handleTrackOrder}
        className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-md shadow-md transition-colors"
      >
        {loading ? "Loading..." : "Track"}
      </button>


{/* Modal for No Order Found */}
{error && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white border border-red-500 shadow-lg rounded-lg w-80 p-6 relative">
      <button
        onClick={() => setError("")}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
      <h3 className="text-lg font-bold text-red-600 mb-2 text-center">Error</h3>
      <p className="text-sm text-gray-700 text-center">{error}</p>
    </div>
  </div>
)}

{/* Modal for Order Details */}
{orderData && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white border border-indigo-500 shadow-lg rounded-lg w-80 p-6 relative">
      <button
        onClick={() => setOrderData(null)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
      <h3 className="text-lg font-bold text-indigo-600 mb-2 text-center">Order Details</h3>
      <div className="text-sm space-y-2 text-center">
        <p>
          <strong>Order ID:</strong> {orderData.order.orderId}
        </p>
        <p>
          <strong>Order Date:</strong>{" "}
          {new Date(orderData.order.orderDate).toLocaleString()}
        </p>
        <p>
          <strong>Customer Name:</strong> {orderData.order.customerName}
        </p>
        <p>
          <strong>Item Name:</strong> {orderData.order.itemName}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className="text-indigo-600 font-medium">{orderData.order.status}</span>
        </p>
      </div>
    </div>
  </div>
)}
</div>
  );
};

export default OrderTracking;
