import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdClose } from 'react-icons/md';

const SellerPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
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
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'
          }/products/seller-details?userId=${userId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch seller details');
        }
        const data = await response.json();
        setProducts(data || []);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {showLoginPrompt ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <MdClose className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">You must log in as a seller to access this page.</p>
            <button
              onClick={handleProceedToLogin}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : (
        <>
          <header className="bg-indigo-600 text-white py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            <button
              onClick={() => navigate('/seller/orders')}
              className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Your Orders
            </button>
          </header>

          {loading ? (
            <div className="flex justify-center py-6">
              <p>Loading seller data...</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Dashboard Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold">Total Products</h3>
                  <p className="text-3xl font-bold text-indigo-600">{products.length}</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">${calculateRevenue()}</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold">Top Selling Product</h3>
                  <p className="text-xl font-bold text-indigo-600">
                    {topSellingProduct().title || 'N/A'}
                  </p>
                  <p className="text-gray-500">Sold: {topSellingProduct().soldQuantity || 0}</p>
                </div>
              </div>

              {/* Button to Navigate to Add Product Page */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => navigate('/seller/add-product')}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  + Add New Product
                </button>
              </div>

              {/* Product Management Section */}
              <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Your Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white shadow-lg rounded-lg overflow-hidden p-4"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-40 object-cover"
                      />
                      <h3 className="font-bold text-lg mt-2">{product.title}</h3>
                      <p className="text-gray-600">Price: ${product.price}</p>
                      <p className="text-gray-500">Stock: {product.inStock}</p>
                      <p className="text-gray-500">Sold: {product.soldQuantity}</p>
                      <Link
                        to={`/product/${product.id}/edit`}
                        className="text-indigo-600 hover:underline mt-2 inline-block"
                      >
                        Edit Product
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellerPage;
