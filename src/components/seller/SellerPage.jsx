import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SellerDashboardStats from '../seller/SellerDashboardStats';
import OrderList from '../seller/OrderList';

const SellerPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const productResponse = await fetch('/api/seller/products');
        const productData = await productResponse.json();
        setProducts(productData);

        const orderResponse = await fetch('/api/seller/orders');
        const orderData = await orderResponse.json();
        setOrders(orderData);
      } catch (error) {
        console.error("Error fetching seller data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  const calculateRevenue = () => {
    return orders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2);
  };

  const topSellingProduct = () => {
    return products.reduce((top, product) => (product.sales > (top.sales || 0) ? product : top), {});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with 'Your Orders' Button */}
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
          {/* Main Dashboard Stats */}
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
              <h3 className="text-lg font-semibold">Total Orders</h3>
              <p className="text-3xl font-bold text-indigo-600">{orders.length}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold">Top Selling Product</h3>
              <p className="text-xl font-bold text-indigo-600">
                {topSellingProduct().title || "N/A"}
              </p>
              <p className="text-gray-500">Sales: {topSellingProduct().sales || 0}</p>
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
                <div key={product.id} className="bg-white shadow-lg rounded-lg overflow-hidden p-4">
                  <img src={product.imageUrl} alt={product.title} className="w-full h-40 object-cover" />
                  <h3 className="font-bold text-lg mt-2">{product.title}</h3>
                  <p className="text-gray-600">Price: ${product.price}</p>
                  <p className="text-gray-500">Sales: {product.sales}</p>
                  <Link to={`/product/${product.id}/edit`} className="text-indigo-600 hover:underline mt-2 inline-block">
                    Edit Product
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default SellerPage;
