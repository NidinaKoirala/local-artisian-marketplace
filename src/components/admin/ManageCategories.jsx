import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { fetchData, sendData, deleteData } from './utils/api';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]); // Categories as an array of strings
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch all categories
  useEffect(() => {
    setLoading(true);
    fetchData('/admin/categories')
      .then((data) => {
        setCategories(data); // Response is an array of strings
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load categories:', error);
        setFeedback({ message: 'Failed to load categories', type: 'error' });
        setLoading(false);
      });
  }, []);

  // Handle delete category
  const handleDelete = (categoryName) => {
    deleteData(`/admin/categories/${categoryName}`)
      .then(() => {
        setCategories(categories.filter((category) => category !== categoryName));
        setFeedback({ message: 'Category deleted successfully', type: 'success' });
      })
      .catch((error) => {
        console.error('Failed to delete category:', error);
        setFeedback({ message: 'Failed to delete category', type: 'error' });
      })
      .finally(() => setConfirmDelete(null));
  };

  // Handle edit category
  const handleEdit = (categoryName) => {
    setEditingCategory(categoryName);
    setFormData({ name: categoryName });
  };

  // Handle adding new category
  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission for adding/updating category
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFeedback({ message: 'Category name is required', type: 'error' });
      return;
    }

    const url = editingCategory
      ? `/admin/categories/${editingCategory}`
      : '/admin/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    sendData(url, { name: formData.name }, method)
      .then(() => {
        if (editingCategory) {
          setCategories(
            categories.map((category) =>
              category === editingCategory ? formData.name : category
            )
          );
        } else {
          setCategories([...categories, formData.name]);
        }
        setEditingCategory(null);
        setFormData({ name: '' });
        setFeedback({
          message: editingCategory ? 'Category updated successfully' : 'Category added successfully',
          type: 'success',
        });
      })
      .catch((error) => {
        console.error('Failed to save category:', error);
        setFeedback({ message: 'Failed to save category', type: 'error' });
      });
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow p-6">
        <AdminHeader title="Manage Categories" />

        {/* Add New Category Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddCategory}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add New Category
          </button>
        </div>

        {loading ? (
          <div className="text-blue-500 text-center mt-6">Loading categories...</div>
        ) : (
          <table className="w-full mt-4 border border-gray-300 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-2">{category}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(category)}
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
              className={`bg-white p-6 rounded shadow-lg text-center ${
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
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <h3 className="text-lg font-bold text-red-500">Confirm Deletion</h3>
              <p className="mt-2">Are you sure you want to delete this category?</p>
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

        {/* Add/Edit Category Modal */}
        {(editingCategory || formData.name) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-1/3 text-center">
              <h3 className="text-lg font-bold mb-4">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setFormData({ name: '' });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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

export default ManageCategories;
