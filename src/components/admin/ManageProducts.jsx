import React, { useEffect, useState } from 'react';
import { fetchData } from './utils/api'; // Utility to fetch data from the backend
import AdminSidebar from './AdminSidebar'; // Include the Sidebar for consistent layout

const ManageProducts = () => {
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all sellers on component mount
  useEffect(() => {
    setLoading(true);
    fetchData('/admin/sellers') // Replace with your backend endpoint
      .then((data) => {
        // Log response to verify if `totalProducts` exists
        console.log("Fetched Sellers:", data);
        setSellers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching sellers:', error);
        setLoading(false);
      });
  }, []);

  // Fetch products for a specific seller
  const handleSellerClick = (sellerId) => {
    setLoading(true);
    fetchData(`/admin/sellers/${sellerId}/products`) // Replace with your backend endpoint
      .then((data) => {
        console.log("Fetched Products:", data);
        setProducts(data);
        setSelectedSeller(sellers.find((seller) => seller.id === sellerId));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  };

  const removeProduct = (productId) => {
    console.log(`Remove product with ID: ${productId}`);
    // Add logic to delete product via API
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
                          onClick={() => removeProduct(product.id)}
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
      </div>
    </div>
  );
};

export default ManageProducts;
