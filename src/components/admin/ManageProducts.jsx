import React, { useEffect, useState } from 'react';
import { fetchData, deleteData } from './utils/api';
import AdminSidebar from './AdminSidebar';
import ProductSlider from '../products/ProductSlider';

const ManageProducts = () => {
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchData('/admin/sellers')
      .then((data) => {
        setSellers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching sellers:', error);
        setFeedback({ message: 'Error fetching sellers', type: 'error' });
        setLoading(false);
      });
  }, []);

  const handleSellerClick = (sellerId) => {
    setLoading(true);
    fetchData(`/admin/sellers/${sellerId}/products`)
      .then((data) => {
        setProducts(data.items || []); // Ensure `items` is used as an array
        setSelectedSeller(sellers.find((seller) => seller.id === sellerId));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setFeedback({ message: 'Error fetching products', type: 'error' });
        setLoading(false);
      });
  };
  

  const removeProduct = (productId) => {
    deleteData(`/admin/products/${productId}`)
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
    <div className="flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-grow flex flex-col bg-gray-100 min-h-screen p-4 md:p-6">
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
                      Total Items: {seller.totalProducts || 0}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  // Safely handle product images
                  const productImages = product.photos?.map(photo => photo?.url) || [];
                  const hasImages = productImages.length > 0;

                  return (
                    <div
                    key={product.id}
                    className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mx-auto w-full max-w-[250px]"
                  > {/* Reduced width for the entire container */}
                  
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                        {product.discount}% OFF
                      </div>
                    )}
                  
                    {/* Image Preview - Smaller size */}
                    <div className="relative w-full h-40 overflow-hidden">
                      {hasImages ? (
                        <ProductSlider
                          images={productImages}
                          className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No images</span>
                        </div>
                      )}
                    </div>
                  
                    {/* Product Details */}
                    <div className="p-2"> {/* Reduced padding */}
                      <h3 className="font-semibold text-sm text-gray-800 truncate pr-2">
                        {product.title || 'Untitled Product'}
                      </h3>
                      <p className="text-gray-600 text-xs mb-1 line-clamp-2">
                        {product.description || 'No description available'}
                      </p>
                  
                      {/* Price & Stock */}
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-gray-900">
                          ${(product.price - (product.price * (product.discount || 0)) / 100).toFixed(2)}
                        </p>
                        {product.discount > 0 && (
                          <p className="text-xs text-gray-400 line-through">
                            ${(product.price || 0).toFixed(2)}
                          </p>
                        )}
                      </div>
                  
                      <button
                        onClick={() => setConfirmDelete(product.id)}
                        className="w-full py-2 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 hover:shadow-md transition-all duration-200"
                      >
                        Remove Product
                      </button>
                    </div>
                  </div>                  
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Feedback Modal */}
        {feedback.message && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`bg-white p-4 md:p-6 rounded shadow-lg w-1/3 text-center ${
              feedback.type === 'success' ? 'border-green-500' : 'border-red-500'
            }`}>
              <h3 className={`text-lg font-bold ${
                feedback.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
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
            <div className="bg-white p-4 md:p-6 rounded shadow-lg w-1/3 text-center">
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
