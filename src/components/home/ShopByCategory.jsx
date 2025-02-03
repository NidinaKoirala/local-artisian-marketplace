import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const ShopByCategory = ({ loading = false, categories = [], items = [], handleCategoryClick }) => {
  return (
    <div className="mt-16 mb-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 md:mb-0">
            Explore Collections
          </h2>
          <Link
            to="/collection"
            className="flex items-center space-x-2 group text-gray-600 hover:text-purple-600 transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="font-medium">View All Categories</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-100 rounded-2xl aspect-square mb-4"></div>
                <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => {
                const latestProduct = items.find((item) => item.category === category);
                return (
                  <div
                    key={category}
                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800 mb-3 truncate">{category}</h3>
                      <div
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-50"
                        onClick={() => handleCategoryClick(category)}
                      >
                        {latestProduct ? (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <img
                              src={latestProduct.photos[0]?.url || assets.placeholder}
                              alt={latestProduct.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            />
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                            <span className="text-sm">Coming Soon</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Link
                      to={`/category/${category}`}
                      className="absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-purple-600 hover:text-white transition-all group/link"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover/link:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                );
              })}
            </div>

            {categories.length > 6 && (
              <div className="flex justify-center mt-8">
                <Link
                  to="/collection"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Discover All Collections
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopByCategory;