import React, { useState, useEffect } from "react";

const OrderList = ({ orders, onNextPage, hasMoreOrders }) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatuses, setOrderStatuses] = useState({});
  const itemsPerPage = 2;

  useEffect(() => {
    const fetchOrderStatuses = async () => {
      const updatedStatuses = {};
      for (const order of orders) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5174"}/order/status?orderId=${order.orderId}`
          );
          if (response.ok) {
            const { status } = await response.json();
            updatedStatuses[order.orderId] = status;
          } else {
            updatedStatuses[order.orderId] = "Unknown";
          }
        } catch {
          updatedStatuses[order.orderId] = "Unknown";
        }
      }
      setOrderStatuses(updatedStatuses);
    };

    if (orders.length) {
      fetchOrderStatuses();
    }
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "All" || orderStatuses[order.orderId] === statusFilter;
    const matchesSearch = order.orderId.toString().includes(searchQuery.trim());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5174"}/order/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId, status: newStatus }),
        }
      );

      if (response.ok) {
        setOrderStatuses((prevStatuses) => ({
          ...prevStatuses,
          [orderId]: newStatus,
        }));
      } else {
        console.error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Customer",
      "Contact",
      "Address",
      "Item",
      "Amount",
      "Quantity",
      "Order Date",
      "Status",
    ];

    const rows = filteredOrders.map((order) => [
      order.orderId,
      order.customerName,
      order.customerPhone || "N/A",
      order.customerAddress,
      order.itemName,
      (order.itemPrice * order.quantity).toFixed(2),
      order.quantity,
      new Date(order.orderDate).toLocaleString(),
      orderStatuses[order.orderId] || "Unknown",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      Received: "bg-blue-100 text-blue-800",
      Packed: "bg-yellow-100 text-yellow-800",
      "Ready to Ship": "bg-purple-100 text-purple-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 mb-6 w-[95vw] max-w-[1200px] mx-auto">
      {/* Filters and Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search Order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All</option>
            <option value="Received">Received</option>
            <option value="Packed">Packed</option>
            <option value="Ready to Ship">Ready to Ship</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors whitespace-nowrap"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Order ID", "Customer", "Contact", "Address", "Item", "Amount", "Quantity", "Date", "Status", "Actions"].map((header) => (
                <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-4 text-sm">{order.orderId}</td>
                <td className="px-2 py-4 text-sm font-medium">{order.customerName}</td>
                <td className="px-2 py-4 text-sm text-gray-500">{order.customerPhone || "N/A"}</td>
                <td className="px-2 py-4 text-sm max-w-[800px]">{order.customerAddress}</td>
                <td className="px-2 py-4 text-sm">{order.itemName}</td>
                <td className="px-2 py-4 text-sm">${(order.itemPrice * order.quantity).toFixed(2)}</td>
                <td className="px-2 py-4 text-sm">{order.quantity}</td>
                <td className="px-2 py-4 text-sm">{new Date(order.orderDate).toLocaleDateString()}</td>
                <td className="px-2 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(orderStatuses[order.orderId])}`}>
                    {orderStatuses[order.orderId] || "Fetching..."}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={orderStatuses[order.orderId] || "Received"}
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Received">Received</option>
                    <option value="Packed">Packed</option>
                    <option value="Ready to Ship">Ready to Ship</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.orderId} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                <p className="text-sm text-gray-500">{order.customerName}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(orderStatuses[order.orderId])}`}>
                {orderStatuses[order.orderId] || "Fetching..."}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Item:</span>
                <span>{order.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span>${(order.itemPrice * order.quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity:</span>
                <span>{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
            </div>
            <select
              value={orderStatuses[order.orderId] || "Received"}
              onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
              className="mt-3 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Received">Received</option>
              <option value="Packed">Packed</option>
              <option value="Ready to Ship">Ready to Ship</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>

      {/* Next Button */}
      {hasMoreOrders && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onNextPage}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-500 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList;