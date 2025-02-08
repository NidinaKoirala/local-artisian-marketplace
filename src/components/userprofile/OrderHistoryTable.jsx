import React from 'react';

const OrderHistoryTable = ({ orderHistory, handleProductClick, loadingOrders }) => {
  if (loadingOrders) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse bg-gray-100 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!orderHistory || orderHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Review
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orderHistory.map((order) => (
            <tr
              key={order.id}
              className={`hover:bg-gray-50 transition-colors ${order.isReviewed === 1 ? 'bg-green-50' : ''}`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {order.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(order.orderDate).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {order.itemTitle}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {order.isReviewed ? (
                  <button
                    className="px-4 py-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed text-sm font-medium"
                    disabled
                  >
                    Reviewed
                  </button>
                ) : order.status === 'Delivered' ? (
                  <button
                    onClick={() => handleProductClick(order)}
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-sm font-medium"
                  >
                    Review
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed text-sm font-medium"
                    disabled
                  >
                    Review
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistoryTable;