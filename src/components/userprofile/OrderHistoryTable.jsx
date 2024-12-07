const OrderHistoryTable = ({ orderHistory, handleProductClick, loadingOrders }) => {
  if (loadingOrders) {
    return <p className="text-center text-gray-500">Loading orders...</p>;
  }

  if (orderHistory.length === 0) {
    return <p className="text-gray-500">No orders found.</p>;
  }

  return (
    <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <thead>
        <tr className="bg-indigo-600 text-white">
          <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Review</th>
        </tr>
      </thead>
      <tbody>
        {orderHistory.map((order) => (
          <tr
            key={order.orderId}
            className={`hover:bg-gray-50 ${order.isReviewed ? 'bg-green-100' : ''}`}
          >
            <td className="border border-gray-300 px-4 py-2">{order.orderId}</td>
            <td className="border border-gray-300 px-4 py-2">{new Date(order.orderDate).toLocaleString()}</td>
            <td className="border border-gray-300 px-4 py-2">{order.itemName}</td>
            <td className="border border-gray-300 px-4 py-2">{order.quantity}</td>
            <td className="border border-gray-300 px-4 py-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${order.statusClass}`}>
                {order.status}
              </span>
            </td>
            <td className="border border-gray-300 px-4 py-2">${order.itemPrice.toFixed(2)}</td>
            <td className="border border-gray-300 px-4 py-2">
              {order.isReviewed ? (
                <button
                  className="px-3 py-1 rounded bg-gray-300 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  Reviewed
                </button>
              ) : order.status === 'Delivered' ? (
                <button
                  onClick={() => handleProductClick(order)}
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                >
                  Review
                </button>
              ) : (
                <button
                  className="px-3 py-1 rounded bg-gray-300 text-gray-500 cursor-not-allowed"
                  disabled
                >
                 Reiview
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderHistoryTable;
