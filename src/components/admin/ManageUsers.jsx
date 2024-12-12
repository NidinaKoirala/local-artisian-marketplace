import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { fetchData, sendData, deleteData } from './utils/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    role: 'user',
  });

  const [feedback, setFeedback] = useState({ message: '', type: '' }); // Feedback for modal
  const [confirmDelete, setConfirmDelete] = useState(null); // To handle delete confirmation

  // Fetch all users
  useEffect(() => {
    setLoading(true);
    fetchData('/admin/users')
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load users:', error);
        setFeedback({ message: 'Failed to load users', type: 'error' });
        setLoading(false);
      });
  }, []);

  // Handle delete user
  const handleDelete = (userId) => {
    deleteData(`/admin/users/${userId}`)
      .then(() => {
        setUsers(users.filter((user) => user.id !== userId));
        setFeedback({ message: 'User and associated role record deleted successfully', type: 'success' });
      })
      .catch((error) => {
        console.error('Failed to delete user:', error);
        setFeedback({ message: 'Failed to delete user', type: 'error' });
      })
      .finally(() => setConfirmDelete(null));
  };

  // Handle edit user
  const handleEdit = (user) => {
    fetchData(`/admin/users/${user.id}`)
      .then((userData) => {
        setEditingUser(userData);
        setFormData({
          firstName: userData.firstName,
          middleName: userData.middleName || '',
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber || '',
          address: `${userData.addressLine1}, ${userData.addressLine2 || ''}, ${userData.city}, ${userData.state}, ${userData.postalCode}, ${userData.country}`,
          role: userData.role,
        });
      })
      .catch((error) => {
        console.error('Failed to fetch user details:', error);
        setFeedback({ message: 'Failed to fetch user details', type: 'error' });
      });
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission for updating user
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    sendData(`/admin/users/${editingUser.id}`, formData, 'PUT')
      .then(() => {
        setUsers(
          users.map((user) =>
            user.id === editingUser.id ? { ...user, ...formData } : user
          )
        );
        setEditingUser(null);
        setFeedback({ message: 'User updated successfully', type: 'success' });
      })
      .catch((error) => {
        console.error('Failed to update user:', error);
        setFeedback({ message: 'Failed to update user', type: 'error' });
      });
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow p-6">
        <AdminHeader title="Manage Users" />
        {loading ? (
          <div className="text-blue-500 text-center mt-6">Loading users...</div>
        ) : (
          <table className="w-full mt-4 border border-gray-300 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">User ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border p-2">{user.id}</td>
                  <td className="border p-2">{user.fullName}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.role}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Feedback Modal */}
        {feedback.message && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className={`bg-white p-6 rounded shadow-lg w-1/3 text-center ${
                feedback.type === 'success' ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <h3
                className={`text-lg font-bold ${
                  feedback.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {feedback.type === 'success' ? 'Success' : 'Error'}
              </h3>
              <p className="mt-2">{feedback.message}</p>
              <button
                className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setFeedback({ message: '', type: '' })}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-1/3 text-center">
              <h3 className="text-lg font-bold text-red-500">Confirm Deletion</h3>
              <p className="mt-2">Are you sure you want to delete this user?</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDelete(confirmDelete)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-1/2">
              <h3 className="text-lg font-bold mb-4">Edit User</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="seller">Seller</option>
                      <option value="buyer">Buyer</option>
                      <option value="deliverer">Deliverer</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
