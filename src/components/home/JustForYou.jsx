import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductSlider from '../products/ProductSlider';

const JustForYou = ({ items = [], loading, handleProductClick, handleAddToCart, renderStars }) => {
  const [randomItems, setRandomItems] = useState([]);

  useEffect(() => {
    if (items.length > 0) {
      const getRandomItems = (array, num) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
      };
      setRandomItems(getRandomItems(items.filter((product) => product.inStock > 0), 9));
    }
  }, [items]);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white px-4 md:px-8 lg:px-12 py-12 lg:py-16 rounded-3xl shadow-xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
          <h2 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 md:mb-0">
            Curated for You
          </h2>
          <Link
            to="/collection"
            className="flex items-center space-x-2 group text-gray-600 hover:text-purple-600 transition-colors"
          >
            <span className="font-medium">Explore All Products</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-100 rounded-2xl aspect-[4/3] mb-4"></div>
                <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded-full w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {randomItems.map((product) => (
                <div 
                  key={product.id} 
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {product.discount > 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                      {product.discount}% OFF
                    </div>
                  )}
                  
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <ProductSlider 
                      images={product.photos.map((photo) => photo.url)}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-2 pt-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-800 truncate pr-2">{product.title}</h3>
                      {product.rating > 0 && (
                        <div className="flex items-center space-x-1 text-amber-500">
                          {renderStars(product.rating)}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-1">
                        <p className="text-xl font-bold text-gray-900">
                          ${(product.price - (product.price * product.discount) / 100).toFixed(2)}
                        </p>
                        {product.discount > 0 && (
                          <p className="text-sm text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.inStock > 5 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inStock > 5 ? `${product.inStock} in stock` : 'Low stock'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleAddToCart(product); 
                      }}
                      className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 9 && (
              <div className="flex justify-center mt-10">
                <Link
                  to="/collection"
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Discover More Treasures
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JustForYou;