import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductSlider from '../products/ProductSlider';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const TopSales = ({ addToCart }) => {
  const [topSales, setTopSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(86400); // 24 hours in seconds
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSales = async () => {
      try {
        const response = await fetch(`${backendUrl}/items`);
        const data = await response.json();

        // Sort items by soldQuantity in descending order
        const sortedItems = data.items.sort((a, b) => b.soldQuantity - a.soldQuantity);
        setTopSales(sortedItems.slice(0, 5)); // Only get the top 5 items
      } catch (error) {
        console.error('Error fetching top sales:', error);
      } finally {
        setLoading(false); // Set loading to false once fetching is complete
      }
    };

    fetchTopSales();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.title.toLowerCase().replace(/\s+/g, '-')}/${product.id}`);
  };  
    return (
      <div className="my-12 mx-4 p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Trending Now 🔥
            </h2>
            <p className="mt-2 text-lg text-gray-600">Most popular choices this week</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-sm font-medium text-gray-600">Flash Offer ends in</span>
              <span className="text-lg font-bold text-red-600 animate-pulse">
                {formatTime(countdown)}
              </span>
            </div>
            <Link
              to="/collection"
              className="group flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full transition-all duration-300"
            >
              <span>Explore Collection</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
  
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {topSales.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                      {product.discount}% OFF
                    </div>
                  )}
                  
                  <div className="relative aspect-square overflow-hidden">
                    <ProductSlider 
                      images={product.photos?.map((photo) => photo.url) || []}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate">{product.title}</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-gray-900">
                          ${(product.price - (product.price * product.discount) / 100).toFixed(2)}
                        </p>
                        {product.discount > 0 && (
                          <p className="text-sm text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {product.soldQuantity || 0} sold
                      </div>
                    </div>
  
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                        product.inStock > 0
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:shadow-lg'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={product.inStock === 0}
                    >
                      {product.inStock > 0 ? (
                        <span className="flex items-center justify-center">
                          Add to Cart 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                          </svg>
                        </span>
                      ) : (
                        'Out of Stock'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };
  
  export default TopSales;
