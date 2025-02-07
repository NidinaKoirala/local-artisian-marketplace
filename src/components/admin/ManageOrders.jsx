import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { fetchData, sendData, deleteData } from './utils/api';
import { FiSearch, FiX, FiArrowUp, FiArrowDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';


const ManageOrders = () => {
  const [orders, setOrders] = useState([]); // Ensure orders is initialized as an empty array
  const [groupBy, setGroupBy] = useState('seller'); // Default grouping by seller
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // For feedback messages
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [searchOrderId, setSearchOrderId] = useState(''); // For tracking search input
  const [confirmation, setConfirmation] = useState(null); // Confirmation state
  const [orderSort, setOrderSort] = useState('desc');

  useEffect(() => {
    fetchOrders();
  }, [groupBy, currentPage]);

  const fetchOrders = async (searchOrderId = null) => {
    setLoading(true);
    try {
      let url = `/admin/orders?groupBy=${groupBy}&page=${currentPage}&limit=5`;
      if (searchOrderId) {
        url = `/admin/orders?orderId=${searchOrderId}`;
      }

      const data = await fetchData(url);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 0);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setFeedback({ message: 'Failed to load orders', type: 'error' });
      setOrders([]);
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
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchOrderId.trim() === '') {
      fetchOrders();
    } else {
      fetchOrders(searchOrderId.trim());
    }
  };

  const handleActionConfirmation = async () => {
    if (!confirmation) return;
    const { action, orderId } = confirmation;

    if (action === 'Cancel') {
      await updateOrderStatus(orderId, 'Cancelled');
    } else if (action === 'Delete') {
      await deleteOrder(orderId);
    }

    setConfirmation(null);
  };
  const sortOrdersById = () => {
    const sortedOrders = [...orders].sort((a, b) => {
      if (orderSort === 'desc') {
        return a.id < b.id ? 1 : -1;
      } else {
        return a.id > b.id ? 1 : -1;
      }
    });
    setOrders(sortedOrders);
    setOrderSort(orderSort === 'desc' ? 'asc' : 'desc'); // Toggle sorting direction
  };  
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Wider Sidebar */}
        <div className="w-72"> {/* Increased width from 64 to 72 */}
          <AdminSidebar />
        </div>
  
        {/* Main Content Area */}
        <div className="flex-grow p-6">
          <AdminHeader title="Manage Orders" />
          
          {/* Controls Section */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="flex-1 relative max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Order ID"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {searchOrderId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOrderId('');
                      fetchOrders();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </form>
  
            <div className="flex items-center gap-4">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="seller">Group by Seller</option>
                <option value="buyer">Group by Buyer</option>
              </select>
            </div>
          </div>
  
          {/* Feedback Messages */}
          {feedback.message && (
            <div className={`mb-4 p-3 rounded-lg ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {feedback.message}
            </div>
          )}
  
          {/* Orders Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                        onClick={sortOrdersById}
                      >
                        <div className="flex items-center gap-1">
                          Order ID
                          {orderSort === 'desc' ? <FiArrowDown /> : <FiArrowUp />}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        {groupBy === 'seller' ? 'Seller' : 'Buyer'}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Item</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Qty</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {groupBy === 'seller' ? order.sellerName : order.buyerName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.itemTitle}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmation({ action: 'Cancel', orderId: order.id })}
                              className="px-3 py-1.5 text-sm rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => setConfirmation({ action: 'Delete', orderId: order.id })}
                              className="px-3 py-1.5 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">No orders found. Try adjusting your search.</p>
            </div>
          )}
  
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                disabled={currentPage === 1}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                disabled={currentPage === totalPages}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
  
          {/* Confirmation Modal */}
          {confirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                <h3 className="text-lg font-semibold mb-4">
                  Confirm {confirmation.action}
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to {confirmation.action.toLowerCase()} this order? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmation(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleActionConfirmation}
                    className={`px-4 py-2 rounded-lg text-white transition-colors ${
                      confirmation.action === 'Delete' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                  >
                    Confirm {confirmation.action}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default ManageOrders;
