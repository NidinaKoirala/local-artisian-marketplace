import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const SellerProductsPage = () => {
  const { sellerId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        // Simulate a loading delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        const response = await fetch(`${backendUrl}/sellers/${sellerId}/products`);
        if (!response.ok) throw new Error('Failed to fetch seller products');
        const data = await response.json();

        const processedProducts = data.products.map((product) => ({
          ...product,
          photos: product.photos || [],
        }));

        setProducts(processedProducts || []);
      } catch (error) {
        console.error('Error fetching seller products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProducts();
  }, [sellerId]);

  const handleProductClick = (product) => {
    const productName = product.title.toLowerCase().replace(/\s+/g, "-");
    navigate(`/product/${productName}/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Products by Seller
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-emerald-600"></div>
          </div>
        ) : (
          <div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-100 ease-in-out cursor-pointer overflow-hidden flex flex-col items-center"
                    onClick={() => handleProductClick(product)}
                    style={{ width: "auto", height: "auto" }}
                  >
                    <div className="w-auto h-auto max-w-full max-h-full bg-gray-200">
                      <img
                        src={product.photos[0]?.url || 'https://via.placeholder.com/400'}
                        alt={product.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-100 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-4 flex flex-col items-center text-center">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {product.title}
                      </h2>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-emerald-600">
                            ${product.price}
                          </p>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {product.shopName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products available from this seller.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProductsPage;
