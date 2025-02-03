import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdClose, MdDelete, MdEdit, MdShoppingCart, MdAttachMoney, MdInventory } from 'react-icons/md';
import ReactModal from 'react-modal';

const SellerPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // For latest 5 orders
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(''); // Added useState for deleteStatus
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'seller') {
      setShowLoginPrompt(true);
      return;
    }

    const userId = user.id; // Get the user's ID
    if (!userId) {
      console.error('Missing userId for the logged-in seller');
      setShowLoginPrompt(true);
      return;
    }

    const fetchSellerDetails = async () => {
      try {
        // Fetch products
        const productResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/products/seller-details?userId=${userId}`
        );
        if (!productResponse.ok) {
          throw new Error('Failed to fetch seller details');
        }
        const productData = await productResponse.json();
        setProducts(productData || []);

        // Fetch latest 5 orders
        const ordersResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/order/forsellers?userId=${userId}&limit=5`
        );
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch latest orders');
        }
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      } catch (error) {
        console.error('Error fetching seller details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [navigate]);

  const calculateRevenue = () => {
    return products.reduce((total, product) => total + product.price * product.soldQuantity, 0).toFixed(2);
  };

  const topSellingProduct = () => {
    return products.reduce(
      (top, product) => (product.soldQuantity > (top.soldQuantity || 0) ? product : top),
      {}
    );
  };

  const handleProceedToLogin = () => {
    setShowLoginPrompt(false);
    navigate('/login', { state: { redirectTo: '/seller' } });
  };

  const handleCloseModal = () => {
    setShowLoginPrompt(false);
    navigate('/'); // Redirect to homepage
  };

  const handleOpenDeleteModal = (productId) => {
    setSelectedProductId(productId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedProductId(null);
    setShowDeleteModal(false);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProductId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/products/delete/${selectedProductId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter((product) => product.id !== selectedProductId));
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      handleCloseDeleteModal();
    }
  };
    return (
      <div className="min-h-screen bg-gray-50 font-inter">
        {showLoginPrompt ? (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
              <p className="text-gray-600 mb-6">Please login with your seller account to continue.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToLogin}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdShoppingCart className="text-indigo-600 w-6 h-6" />
                  Seller Dashboard
                </h1>
                <button
                  onClick={() => navigate('/seller/orders')}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
                >
                  <MdShoppingCart className="w-5 h-5" />
                  View Orders
                </button>
              </div>
            </header>
  
            {loading ? (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-6 py-1">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 text-white p-6 rounded-xl shadow-lg">
                    <MdInventory className="w-8 h-8 mb-4" />
                    <h3 className="text-sm font-medium mb-1">Total Products</h3>
                    <p className="text-3xl font-bold">{products.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-600 to-green-500 text-white p-6 rounded-xl shadow-lg">
                    <MdAttachMoney className="w-8 h-8 mb-4" />
                    <h3 className="text-sm font-medium mb-1">Total Revenue</h3>
                    <p className="text-3xl font-bold">${calculateRevenue()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600 to-purple-500 text-white p-6 rounded-xl shadow-lg">
                    <MdShoppingCart className="w-8 h-8 mb-4" />
                    <h3 className="text-sm font-medium mb-1">Top Product</h3>
                    <p className="text-xl font-bold truncate">{topSellingProduct().title || 'N/A'}</p>
                    <p className="text-sm opacity-90">Sold: {topSellingProduct().soldQuantity || 0}</p>
                  </div>
                </div>
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                  <button
                    onClick={() => navigate('/seller/add-product')}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                  >
                    <MdEdit className="w-5 h-5" />
                    Add New Product
                  </button>
                </div>                  
                {/* Recent Orders Section */}
                <section className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                    <button
                      onClick={() => navigate('/seller/orders')}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Item</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderId}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{order.customerName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[160px]">{order.itemName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">${order.totalPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && (
                      <div className="text-center py-8 text-gray-500">No recent orders found</div>
                    )}
                  </div>
                </section>  
                
                {/* Products Grid */}
                <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Your Products</h2>                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <div>
                            <p className="text-indigo-600 font-medium">${product.price}</p>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>Stock: {product.inStock}</span>
                              <span>Sold: {product.soldQuantity}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              to={`/products/${product.id}/edit`}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <MdEdit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleOpenDeleteModal(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </section>
              </main>
            )}  
      {/* Delete Confirmation Modal */}
      <ReactModal
            isOpen={showDeleteModal}
            onRequestClose={handleCloseDeleteModal}
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative"
            overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        {!deleteStatus ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/products/delete/${selectedProductId}`,
                      { method: 'DELETE' }
                    );

                    if (!response.ok) {
                      throw new Error('Failed to delete product');
                    }

                    setProducts(products.filter((product) => product.id !== selectedProductId));
                    setDeleteStatus('Product deleted successfully!');
                  } catch (error) {
                    console.error('Error deleting product:', error);
                    setDeleteStatus('Failed to delete the product. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              className={`text-center text-lg font-semibold ${
                deleteStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {deleteStatus}
            </p>
            <div className="flex justify-center mt-6">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </>
        )}
          </ReactModal>
        </>
      )}
    </div>
  );
};

export default SellerPage;
