import React from 'react';

const OrderList = ({ orders }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders available</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">Order ID</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Contact</th>
              <th className="py-2 px-4">Item</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Quantity</th>
              <th className="py-2 px-4">Order Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{order.orderId}</td>
                <td className="py-2 px-4">{order.customerName}</td>
                <td className="py-2 px-4">{order.customerPhone || 'N/A'}</td>
                <td className="py-2 px-4">{order.itemName}</td>
                <td className="py-2 px-4">${(order.itemPrice * order.quantity).toFixed(2)}</td>
                <td className="py-2 px-4">{order.quantity}</td>
                <td className="py-2 px-4">{new Date(order.orderDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderList;
