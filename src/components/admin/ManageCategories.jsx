import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { fetchData, sendData, deleteData } from './utils/api';
import { FiEdit, FiTrash2, FiPlus, FiX, FiTag, FiAlertTriangle, FiFolderPlus } from 'react-icons/fi';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchData('/admin/categories')
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load categories:', error);
        setFeedback({ message: 'Failed to load categories', type: 'error' });
        setLoading(false);
      });
  }, []);

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

  const handleEdit = (categoryName) => {
    setEditingCategory(categoryName);
    setFormData({ name: categoryName });
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFeedback({ message: 'Category name is required', type: 'error' });
      return;
    }

    const url = editingCategory ? `/admin/categories/${editingCategory}` : '/admin/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    sendData(url, { name: formData.name }, method)
      .then(() => {
        if (editingCategory) {
          setCategories(categories.map((category) => 
            category === editingCategory ? formData.name : category
          ));
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
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <div className="flex-grow">
        <AdminHeader title="Manage Categories" />
        <div className="p-6 xl:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Product Categories</h2>
            <button
              onClick={handleAddCategory}
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <FiPlus className="mr-2" /> Add Category
            </button>
          </div>

          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <FiFolderPlus className="w-16 h-16 mb-4" />
              <p className="text-lg">No categories found</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Category Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map((category, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{category}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(category)}
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
                <h3 className="text-lg font-bold text-red-500 flex items-center justify-center gap-2">
                  <FiAlertTriangle /> Confirm Deletion
                </h3>
                <p className="mt-2 text-gray-600">Are you sure you want to delete this category?</p>
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

          {/* Add/Edit Category Modal */}
          {(editingCategory || formData.name) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">
                    {editingCategory ? 'Edit Category' : 'New Category'}
                  </h3>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setFormData({ name: '' });
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                      <div className="flex items-center border rounded-lg p-2">
                        <FiTag className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full outline-none"
                          placeholder="Enter category name"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {editingCategory ? 'Update' : 'Create'}
                      </button>
                    </div>
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

export default ManageCategories;
