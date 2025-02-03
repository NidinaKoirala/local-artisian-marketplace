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
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <div className="flex-grow">
        <AdminHeader title="Dashboard" />
        <div className="p-6 xl:p-8">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {statCards.map((card, index) => (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${card.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/90">{card.title}</p>
                        <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        {React.cloneElement(card.icon, { className: "text-white/80" })}
                      </div>
                    </div>
                    <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/10"></div>
                  </div>
                ))}
              </div>

              {/* Overview Section */}
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {/* Sellers Overview */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">Sellers Overview</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Sellers</span>
                      <span className="font-medium text-gray-800">{stats.sellers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg. Products</span>
                      <span className="font-medium text-gray-800">
                        {(stats.products / stats.sellers || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Products Overview */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">Products Overview</h3>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-gray-800">{stats.products}</p>
                    <p className="mt-2 text-sm text-gray-600">Total listed products</p>
                  </div>
                </div>

                {/* Roles Distribution */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">Roles Distribution</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Admins</span>
                      <span className="font-medium text-gray-800">{stats.admins}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Deliverers</span>
                      <span className="font-medium text-gray-800">{stats.deliverers}</span>
                    </div>
                  </div>
                </div>

                {/* Buyers Overview */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">Buyers Overview</h3>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-gray-800">{stats.buyers}</p>
                    <p className="mt-2 text-sm text-gray-600">Active buyers</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
