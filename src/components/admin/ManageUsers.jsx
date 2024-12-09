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
        setLoading(false);
      });
  }, []);

  // Handle delete user
  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteData(`/admin/users/${userId}`)
        .then(() => {
          setUsers(users.filter((user) => user.id !== userId));
          alert('User deleted successfully');
        })
        .catch((error) => {
          console.error('Failed to delete user:', error);
          alert('Failed to delete user');
        });
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      middleName: user.middleName || '',
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      address: user.fullAddress || '',
      role: user.role,
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

    postData(`/admin/users/${editingUser.id}`, formData, 'PUT')
      .then(() => {
        setUsers(
          users.map((user) =>
            user.id === editingUser.id ? { ...user, ...formData } : user
          )
        );
        setEditingUser(null);
        alert('User updated successfully');
      })
      .catch((error) => {
        console.error('Failed to update user:', error);
        alert('Failed to update user');
      });
  };

  return (
    <div className="flex">
      <AdminSidebar/>
      <div className="flex-grow p-6">
        <AdminHeader title="Manage Users" />
        {loading ? (
          <div className="text-blue-500 text-center mt-6">Loading users...</div>
        ) : (
          <table className="w-full mt-4 border border-gray-300 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
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
                      onClick={() => handleDelete(user.id)}
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
