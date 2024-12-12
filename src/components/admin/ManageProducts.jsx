import React, { useEffect, useState } from 'react';
import { fetchData, deleteData } from './utils/api'; // Utility for API operations
import AdminSidebar from './AdminSidebar'; // Include the Sidebar for consistent layout

const ManageProducts = () => {
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // Feedback modal state
  const [confirmDelete, setConfirmDelete] = useState(null); // Product ID for delete confirmation

  // Fetch all sellers on component mount
  useEffect(() => {
    setLoading(true);
    fetchData('/admin/sellers') // Replace with your backend endpoint
      .then((data) => {
        console.log('Fetched Sellers:', data);
        setSellers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching sellers:', error);
        setFeedback({ message: 'Error fetching sellers', type: 'error' });
        setLoading(false);
      });
  }, []);

  // Fetch products for a specific seller
  const handleSellerClick = (sellerId) => {
    setLoading(true);
    fetchData(`/admin/sellers/${sellerId}/products`) // Replace with your backend endpoint
      .then((data) => {
        console.log('Fetched Products:', data);
        setProducts(data);
        setSelectedSeller(sellers.find((seller) => seller.id === sellerId));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setFeedback({ message: 'Error fetching products', type: 'error' });
        setLoading(false);
      });
  };

  // Remove a product
  const removeProduct = (productId) => {
    deleteData(`/admin/products/${productId}`) // Replace with your backend endpoint
      .then(() => {
        setProducts(products.filter((product) => product.id !== productId));
        setFeedback({ message: 'Product removed successfully', type: 'success' });
      })
      .catch((error) => {
        console.error('Error deleting product:', error);
        setFeedback({ message: 'Failed to delete product', type: 'error' });
      })
      .finally(() => setConfirmDelete(null));
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow flex flex-col bg-gray-100 min-h-screen p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Products</h2>
        {loading && (
          <div className="flex justify-center items-center">
            <span className="text-blue-500 text-lg">Loading...</span>
          </div>
        )}

        {!selectedSeller ? (
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Sellers</h3>
            <ul className="space-y-2">
              {sellers.map((seller) => (
                <li
                  key={seller.id}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg shadow cursor-pointer"
                  onClick={() => handleSellerClick(seller.id)}
                >
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">{seller.shopName}</span>
                    <span className="text-gray-500">
                      Total Items: {seller.totalProducts || 0} {/* Corrected property */}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-4">
            <button
              onClick={() => {
                setSelectedSeller(null);
                setProducts([]);
              }}
              className="text-blue-500 hover:text-blue-700 mb-4"
            >
              &larr; Back to Sellers
            </button>
            <h3 className="text-lg font-semibold mb-4">Products by {selectedSeller.shopName}</h3>
            {products.length === 0 ? (
              <p className="text-gray-600">No products found for this seller.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-4 border-b text-gray-800 font-semibold">Product Name</th>
                    <th className="p-4 border-b text-gray-800 font-semibold">Price</th>
                    <th className="p-4 border-b text-gray-800 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{product.title}</td>
                      <td className="p-4">{product.price}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setConfirmDelete(product.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
              <p className="mt-2">Are you sure you want to delete this product?</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => removeProduct(confirmDelete)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
