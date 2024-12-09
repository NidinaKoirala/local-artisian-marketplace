import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import StatsCard from './StatsCard';
import { fetchData } from './utils/api';

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
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    console.log("Stored User:", storedUser); // Debug log for stored user
    console.log("Token:", token); // Debug log for token

    if (!storedUser || storedUser.role !== 'admin' || !token) {
      console.warn('Access Denied: Not an Admin or Missing Token');
      navigate('/access-denied');
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        // Fetch stats from APIs
        const users = await fetchData('/admin/users');
        const sellersData = await fetchData('/admin/sellers');
        const productsData = await fetchData('/admin/products');

        const buyers = users.filter((user) => user.userType === 'Buyer').length;
        const sellers = sellersData.length;
        const admins = users.filter((user) => user.userType === 'Admin').length;
        const deliverers = users.filter((user) => user.userType === 'Deliverer').length;

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
        console.error('Failed to load dashboard stats:', error);
        setLoading(false);
        navigate('/access-denied'); // Navigate to access denied on failure
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow p-6">
        <AdminHeader title="Dashboard" />
        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <span className="text-blue-500 text-lg">Loading Dashboard...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <StatsCard title="Users" value={stats.users} color="blue" />
              <StatsCard title="Sellers" value={stats.sellers} color="red" />
              <StatsCard title="Buyers" value={stats.buyers} color="green" />
              <StatsCard title="Admins" value={stats.admins} color="purple" />
              <StatsCard title="Deliverers" value={stats.deliverers} color="orange" />
              <StatsCard title="Products" value={stats.products} color="teal" />
            </div>
            <div className="mt-8 bg-white shadow p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Details Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Sellers Overview</h3>
                  <p className="text-gray-600">Total Sellers: {stats.sellers}</p>
                  <p className="text-gray-600">
                    Products Per Seller: {(stats.products / stats.sellers || 0).toFixed(1)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Products Overview</h3>
                  <p className="text-gray-600">Total Products: {stats.products}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Roles Distribution</h3>
                  <p className="text-gray-600">Admins: {stats.admins}</p>
                  <p className="text-gray-600">Deliverers: {stats.deliverers}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Buyers Overview</h3>
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
