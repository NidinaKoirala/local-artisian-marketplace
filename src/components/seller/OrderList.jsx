import React, { useState, useEffect } from "react";

const OrderList = ({ orders, onUpdateOrderStatus }) => {
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatuses, setOrderStatuses] = useState({}); // Store statuses for each order

  // Fetch the status for each order
  const fetchOrderStatuses = async () => {
    const updatedStatuses = {};
    for (const order of orders) {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL || "http://localhost:5174"
          }/order/status?orderId=${order.orderId}`
        );
        if (response.ok) {
          const { status } = await response.json();
          updatedStatuses[order.orderId] = status;
        } else {
          console.error(`Failed to fetch status for order ID: ${order.orderId}`);
          updatedStatuses[order.orderId] = "Unknown";
        }
      } catch (error) {
        console.error(`Error fetching status for order ID: ${order.orderId}`, error);
        updatedStatuses[order.orderId] = "Unknown";
      }
    }
    setOrderStatuses(updatedStatuses);
  };

  useEffect(() => {
    fetchOrderStatuses();
  }, [orders]);

  useEffect(() => {
    setFilteredOrders(
      orders.filter((order) => {
        const matchesStatus =
          statusFilter === "All" || orderStatuses[order.orderId] === statusFilter;
        const matchesSearch = order.orderId.toString().includes(searchQuery.trim());
        return matchesStatus && matchesSearch;
      })
    );
  }, [orders, statusFilter, searchQuery, orderStatuses]);

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:5174"
        }/order/status`,
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Received":
        return "bg-blue-500 text-white";
      case "Packed":
        return "bg-yellow-500 text-white";
      case "Ready to Ship":
        return "bg-orange-500 text-white";
      case "Delivered":
        return "bg-green-500 text-white";
      case "Cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6 w-[95vw] max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by Order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.orderId} className="border-b transition-colors">
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
                <td className="py-2 px-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusClass(
                      orderStatuses[order.orderId]
                    )}`}
                  >
                    {orderStatuses[order.orderId] || "Fetching..."}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <select
                    value={orderStatuses[order.orderId] || "Received"}
                    onChange={(e) =>
                      handleStatusChange(order.orderId, e.target.value)
                    }
                    className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
      )}
    </div>
  );
};

export default OrderList;
