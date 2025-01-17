import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL

const SellerProductsPage = () => {
  const { sellerId } = useParams();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        const response = await fetch(`${backendUrl}/sellers/${sellerId}/products`);
        if (!response.ok) throw new Error('Failed to fetch seller products');
        const data = await response.json();

        // Process products with associated photos
        const processedProducts = data.products.map((product) => ({
          ...product,
          photos: product.photos || [],
        }));

        setProducts(processedProducts || []);
      } catch (error) {
        console.error('Error fetching seller products:', error);
      }
    };

    fetchSellerProducts();
  }, [sellerId]);

  const handleProductClick = (product) => {
    const productName = product.title.toLowerCase().replace(/\s+/g, "-");
    navigate(`/product/${productName}/${product.id}`);
  };

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Products by Seller</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border p-4 rounded shadow cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleProductClick(product)}
          >
            <img
              src={product.photos[0]?.url || 'https://via.placeholder.com/150'}
              alt={product.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h2 className="text-lg font-bold">{product.title}</h2>
            <p className="text-gray-600">${product.price}</p>
            <p className="text-gray-500 text-sm">{product.shopName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerProductsPage;
