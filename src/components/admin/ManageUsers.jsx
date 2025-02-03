import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { fetchData, sendData, deleteData } from './utils/api';
import { FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiX } from 'react-icons/fi';

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

  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

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
        setFeedback({ message: 'User deleted successfully', type: 'success' });
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
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <div className="flex-grow">
        <AdminHeader title="Manage Users" />
        <div className="p-6 xl:p-8">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">User ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{user.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex px-2 py-1 text-xs font-medium capitalize rounded-full bg-blue-100 text-blue-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Feedback Modal */}
          {feedback.message && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className={`bg-white p-6 rounded-lg shadow-lg w-96 text-center ${feedback.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                <h3 className={`text-lg font-bold ${feedback.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {feedback.type === 'success' ? 'Success' : 'Error'}
                </h3>
                <p className="mt-2 text-gray-600">{feedback.message}</p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                <h3 className="text-lg font-bold text-red-500">Confirm Deletion</h3>
                <p className="mt-2 text-gray-600">Are you sure you want to delete this user?</p>
                <div className="mt-4 flex justify-center gap-4">
                  <button
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => setConfirmDelete(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Edit User</h3>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <div className="flex items-center border rounded-lg p-2">
                        <FiUser className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Middle Name</label>
                      <div className="flex items-center border rounded-lg p-2">
                        <FiUser className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleChange}
                          className="w-full outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <div className="flex items-center border rounded-lg p-2">
                        <FiUser className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <div className="flex items-center border rounded-lg p-2">
                        <FiMail className="text-gray-400 mr-2" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="flex items-center border rounded-lg p-2">
                        <FiPhone className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="w-full outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <div className="flex items-center border rounded-lg p-2">
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="seller">Seller</option>
                          <option value="buyer">Buyer</option>
                          <option value="deliverer">Deliverer</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <div className="flex items-center border rounded-lg p-2">
                        <FiMapPin className="text-gray-400 mr-2" />
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
