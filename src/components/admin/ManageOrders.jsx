import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { fetchData, sendData, deleteData } from './utils/api';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [groupBy, setGroupBy] = useState('seller'); // Default grouping by seller
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // For feedback messages

  useEffect(() => {
    fetchOrders();
  }, [groupBy]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchData(`/admin/orders?groupBy=${groupBy}`);
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setFeedback({ message: 'Failed to load orders', type: 'error' });
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

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow p-6">
        <AdminHeader title="Manage Orders" />
        {loading ? (
          <div className="text-blue-500 text-center mt-6">Loading orders...</div>
        ) : (
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Orders</h2>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="seller">Group by Seller</option>
                <option value="buyer">Group by Buyer</option>
              </select>
            </div>
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
          </>
        )}

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
