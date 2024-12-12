import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { fetchData, sendData, deleteData } from './utils/api';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]); // Ensure orders is initialized as an empty array
  const [groupBy, setGroupBy] = useState('seller'); // Default grouping by seller
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // For feedback messages
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [searchOrderId, setSearchOrderId] = useState(''); // For tracking search input

  useEffect(() => {
    fetchOrders();
  }, [groupBy, currentPage]);

  const fetchOrders = async (searchOrderId = null) => {
    setLoading(true);
    try {
      // Construct the API URL dynamically based on whether searchOrderId is provided
      let url = `/admin/orders?groupBy=${groupBy}&page=${currentPage}&limit=20`;
      if (searchOrderId) {
        url = `/admin/orders?orderId=${searchOrderId}`;
      }

      const data = await fetchData(url);

      // Update state with fetched data
      setOrders(data.orders || []); // Ensure orders is always an array
      setTotalPages(data.totalPages || 0); // Handle missing totalPages gracefully
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setFeedback({ message: 'Failed to load orders', type: 'error' });
      setOrders([]); // Set orders to an empty array on failure
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await sendData(`/admin/orders/${id}`, { status }, 'PUT');
      setFeedback({ message: 'Order status updated successfully', type: 'success' });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      setFeedback({ message: 'Failed to update order status', type: 'error' });
    }
  };

  const deleteOrder = async (id) => {
    try {
      await deleteData(`/admin/orders/${id}`);
      setFeedback({ message: 'Order deleted successfully', type: 'success' });
      fetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      setFeedback({ message: 'Failed to delete order', type: 'error' });
    }
  };


  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      document.documentElement.scrollTop = 0; // For most browsers
      document.body.scrollTop = 0; // For Safari
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchOrderId.trim() === "") {
      // If search box is empty, fetch all orders
      fetchOrders();
    } else {
      // Fetch orders by specific order ID
      fetchOrders(searchOrderId.trim());
    }
  };
  
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow p-6">
        <AdminHeader title="Manage Orders" />
        <div className="flex justify-end mb-4 gap-4">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Order ID"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="border p-2 rounded pr-10"
              />
              {searchOrderId && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchOrderId("");
                    fetchOrders(); // Fetch all orders when cleared
                  }}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  &times;
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 ml-2"
            >
              Search
            </button>
          </form>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="seller">Group by Seller</option>
            <option value="buyer">Group by Buyer</option>
          </select>
        </div>
        {loading ? (
          <div className="text-blue-500 text-center mt-6">Loading orders...</div>
        ) : orders.length > 0 ? (
          <table className="w-full mt-4 border border-gray-300 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Order ID</th>
                <th className="border p-2">Buyer/Seller</th>
                <th className="border p-2">Item</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border p-2">{order.id}</td>
                  <td className="border p-2">
                    {groupBy === 'seller' ? order.sellerName : order.buyerName}
                  </td>
                  <td className="border p-2">{order.itemTitle}</td>
                  <td className="border p-2">{order.quantity}</td>
                  <td className="border p-2">{order.status}</td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-gray-500 mt-6">
            No orders found. Use the search bar to look for specific orders or clear the search.
          </div>
        )}
        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        {/* Feedback Modal */}
        {feedback.message && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-1/3 text-center">
              <h3
                className={`text-lg font-bold ${
                  feedback.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {feedback.type === 'success' ? 'Success' : 'Error'}
              </h3>
              <p className="mt-2">{feedback.message}</p>
              <button
                className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setFeedback({ message: '', type: '' })}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
