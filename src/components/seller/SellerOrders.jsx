import React, { useState, useEffect } from 'react';
import OrderList from './OrderList';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id; // Get the logged-in user's ID

        if (!userId) {
          console.error("User ID is missing. Unable to fetch orders.");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/order/forsellers?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch seller orders");
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching seller orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <OrderList orders={orders} />
      )}
    </div>
  );
};

export default SellerOrders;
