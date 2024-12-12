import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaBoxOpen, FaStore, FaClipboardList } from "react-icons/fa";

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`bg-gray-800 text-white ${
        isExpanded ? "w-64" : "w-16"
      } min-h-screen h-auto flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="p-4 bg-gray-700 hover:bg-gray-600 focus:outline-none text-center"
      >
        {isExpanded ? "<<" : ">>"}
      </button>

      {/* Admin Panel Title (only visible when expanded) */}
      {isExpanded && (
        <h2 className="p-4 text-lg font-bold text-center">Admin Panel</h2>
      )}

      {/* Navigation Links */}
      <nav className="space-y-4 mt-4 flex-grow">
        <Link
          to="/admin/dashboard"
          className={`flex items-center ${
            isExpanded ? "justify-start" : "justify-center"
          } py-2 px-4 hover:bg-gray-700 rounded transition-all`}
        >
          <FaTachometerAlt size={20} />
          {isExpanded && <span className="ml-4">Dashboard</span>}
        </Link>
        <Link
          to="/admin/users"
          className={`flex items-center ${
            isExpanded ? "justify-start" : "justify-center"
          } py-2 px-4 hover:bg-gray-700 rounded transition-all`}
        >
          <FaUsers size={20} />
          {isExpanded && <span className="ml-4">Manage Users</span>}
        </Link>
        <Link
          to="/admin/products"
          className={`flex items-center ${
            isExpanded ? "justify-start" : "justify-center"
          } py-2 px-4 hover:bg-gray-700 rounded transition-all`}
        >
          <FaBoxOpen size={20} />
          {isExpanded && <span className="ml-4">Manage Products</span>}
        </Link>
        <Link
          to="/admin/sellers"
          className={`flex items-center ${
            isExpanded ? "justify-start" : "justify-center"
          } py-2 px-4 hover:bg-gray-700 rounded transition-all`}
        >
          <FaStore size={20} />
          {isExpanded && <span className="ml-4">Manage Sellers</span>}
        </Link>
        <Link
          to="/admin/orders"
          className={`flex items-center ${
            isExpanded ? "justify-start" : "justify-center"
          } py-2 px-4 hover:bg-gray-700 rounded transition-all`}
        >
          <FaClipboardList size={20} />
          {isExpanded && <span className="ml-4">Manage Orders</span>}
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
