import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { fetchData } from "./utils/api";
import { FaUsers, FaStore, FaShoppingCart, FaUserShield, FaTruck, FaBox } from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    sellers: 0,
    products: 0,
    buyers: 0,
    admins: 0,
    deliverers: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || storedUser.role !== "admin" || !token) {
      navigate("/access-denied");
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        const users = await fetchData("/admin/users");
        const sellersData = await fetchData("/admin/sellers");
        const productsData = await fetchData("/admin/products");

        const buyers = users.filter((user) => user.userType === "Buyer").length;
        const sellers = sellersData.length;
        const admins = users.filter((user) => user.userType === "Admin").length;
        const deliverers = users.filter((user) => user.userType === "Deliverer").length;

        setStats({
          users: users.length,
          sellers,
          buyers,
          admins,
          deliverers,
          products: productsData.length,
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        setLoading(false);
        navigate("/access-denied");
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  const statCards = [
    {
      title: "Users",
      value: stats.users,
      color: "bg-blue-500",
      icon: <FaUsers size={24} className="text-white" />,
    },
    {
      title: "Sellers",
      value: stats.sellers,
      color: "bg-red-500",
      icon: <FaStore size={24} className="text-white" />,
    },
    {
      title: "Buyers",
      value: stats.buyers,
      color: "bg-green-500",
      icon: <FaShoppingCart size={24} className="text-white" />,
    },
    {
      title: "Admins",
      value: stats.admins,
      color: "bg-purple-500",
      icon: <FaUserShield size={24} className="text-white" />,
    },
    {
      title: "Deliverers",
      value: stats.deliverers,
      color: "bg-orange-500",
      icon: <FaTruck size={24} className="text-white" />,
    },
    {
      title: "Products",
      value: stats.products,
      color: "bg-teal-500",
      icon: <FaBox size={24} className="text-white" />,
    },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow bg-gray-100 p-6">
        <AdminHeader title="Dashboard" />
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <span className="text-blue-500 text-lg font-semibold">
              Loading Dashboard...
            </span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-6">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg shadow-lg ${card.color} flex items-center justify-between`}
                >
                  <div>
                    <h3 className="text-white text-lg font-bold">
                      {card.title}
                    </h3>
                    <p className="text-white text-3xl font-semibold">
                      {card.value}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-full">
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Details Overview */}
            <div className="mt-10 bg-white shadow-lg p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Details Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Sellers Overview
                  </h3>
                  <p className="text-gray-600">Total Sellers: {stats.sellers}</p>
                  <p className="text-gray-600">
                    Products Per Seller:{" "}
                    {(stats.products / stats.sellers || 0).toFixed(1)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Products Overview
                  </h3>
                  <p className="text-gray-600">Total Products: {stats.products}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Roles Distribution
                  </h3>
                  <p className="text-gray-600">Admins: {stats.admins}</p>
                  <p className="text-gray-600">
                    Deliverers: {stats.deliverers}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Buyers Overview
                  </h3>
                  <p className="text-gray-600">Total Buyers: {stats.buyers}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
