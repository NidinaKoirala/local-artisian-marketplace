import React, { useState } from "react";

const OrderList = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query
  const [filteredOrders, setFilteredOrders] = useState(orders); // State for filtered orders

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter orders based on the search query
    const filtered = orders.filter((order) =>
      order.orderId.toString().toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export.");
      return;
    }

    // Create CSV content
    const headers = [
      "Order ID",
      "Customer",
      "Contact",
      "Address",
      "Item",
      "Amount",
      "Quantity",
      "Order Date"
    ];

    const rows = filteredOrders.map((order) => [
      order.orderId,
      order.customerName,
      order.customerPhone || "N/A",
      order.customerAddress,
      order.itemName,
      (order.itemPrice * order.quantity).toFixed(2),
      order.quantity,
      new Date(order.orderDate).toLocaleString()
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by Order ID"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors"
          >
            Export to CSV
          </button>
        </div>
      </div>
      {filteredOrders.length === 0 ? (
        <p className="text-gray-600">No orders available</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Order ID</th>
              <th className="py-2 px-4 border">Customer</th>
              <th className="py-2 px-4 border">Contact</th>
              <th className="py-2 px-4 border">Address</th>
              <th className="py-2 px-4 border">Item</th>
              <th className="py-2 px-4 border">Amount</th>
              <th className="py-2 px-4 border">Quantity</th>
              <th className="py-2 px-4 border">Order Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.orderId}
                className="border-b hover:bg-gray-800 hover:text-white transition-colors"
              >
                <td className="py-2 px-4">{order.orderId}</td>
                <td className="py-2 px-4">{order.customerName}</td>
                <td className="py-2 px-4">{order.customerPhone || "N/A"}</td>
                <td className="py-2 px-4">{order.customerAddress}</td>
                <td className="py-2 px-4">{order.itemName}</td>
                <td className="py-2 px-4">
                  ${(order.itemPrice * order.quantity).toFixed(2)}
                </td>
                <td className="py-2 px-4">{order.quantity}</td>
                <td className="py-2 px-4">
                  {new Date(order.orderDate).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderList;
