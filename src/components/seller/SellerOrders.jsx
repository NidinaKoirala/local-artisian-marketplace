import React, { useState, useEffect } from 'react';
import OrderList from './OrderList';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const ordersPerPage = 7;

  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;

      if (!userId) {
        console.error("User ID is missing. Unable to fetch orders.");
        setHasMoreOrders(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/order/forsellers?userId=${userId}&page=${page}&limit=${ordersPerPage}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch seller orders");
      }

      const data = await response.json();

      const newOrders = data.orders || [];
      if (newOrders.length === 0 && page === 1) {
        setOrders([]);
        setHasMoreOrders(false);
        return;
      }

      setOrders((prevOrders) => {
        const existingOrderIds = new Set(prevOrders.map(order => order.orderId));
        
        const uniqueNewOrders = newOrders.filter(order => !existingOrderIds.has(order.orderId));

        return [...prevOrders, ...uniqueNewOrders];
      });

      setHasMoreOrders(newOrders.length === ordersPerPage);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      setHasMoreOrders(false); // Stop attempting to fetch more if fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (hasMoreOrders) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      {loading && currentPage === 1 ? (
        <p>Loading orders...</p>
      ) : orders.length > 0 ? (
        <>
          <OrderList
            orders={orders}
            hasMoreOrders={hasMoreOrders}
            onNextPage={handleNextPage}
          />
          {!loading && !hasMoreOrders && (
            <div className="text-center mt-4">
              <p>End of orders</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center mt-4">
          <p>No orders found</p>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;