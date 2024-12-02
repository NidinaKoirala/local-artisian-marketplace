import React, { useEffect, useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showProfileDetails, setShowProfileDetails] = useState(false); // Toggle profile details
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
          setMessage('Please log in to view your profile.');
          return;
        }

        const response = await fetch(`${backendUrl}/user/${storedUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        setUser(data);

        // Fetch order history
        fetchOrderHistory(storedUser.id);
      } catch (error) {
        console.error(error);
        setMessage(error.message || 'An error occurred while fetching user details.');
      }
    };

    fetchUserDetails();
  }, []);

  const fetchOrderHistory = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/order/history/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }

      const data = await response.json();
      setOrderHistory(data.orders);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'An error occurred while fetching order history.');
    }
  };

  const toggleProfileDetails = () => {
    setShowProfileDetails((prev) => !prev);
  };

  if (message && !user) {
    return <p className="text-center mt-10">{message}</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Your Orders</h2>
      <div className="mb-8">
        {orderHistory.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {orderHistory.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{order.orderId}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(order.orderDate).toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.itemName}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2">${order.itemPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        onClick={toggleProfileDetails}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
      >
        {showProfileDetails ? 'Hide Profile Details' : 'Show Profile Details'}
      </button>

      {showProfileDetails && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Profile Details</h3>
          <p className="text-gray-500 mb-2"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p className="text-gray-500 mb-2"><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-500 mb-2"><strong>Username:</strong> {user.username}</p>
          <p className="text-gray-500 mb-2"><strong>Role:</strong> {user.role}</p>
          <p className="text-gray-500 mb-2"><strong>Phone:</strong> {user.phoneNumber || 'Not provided'}</p>
          <p className="text-gray-500"><strong>Address:</strong> {user.addressLine1}, {user.addressLine2 || ''}, {user.city}, {user.state}, {user.postalCode}, {user.country}</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
