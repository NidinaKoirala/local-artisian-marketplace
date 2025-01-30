import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductSlider from '../products/ProductSlider';

const JustForYou = ({ items = [], loading, handleProductClick, handleAddToCart, renderStars }) => {
  const [randomItems, setRandomItems] = useState([]);

  useEffect(() => {
    if (items.length > 0) {
      // Shuffle array and pick random 9 items only on component mount
      const getRandomItems = (array, num) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
      };

      setRandomItems(getRandomItems(items.filter((product) => product.inStock > 0), 9));
    }
  }, [items]); // Run only when `items` change (e.g., first render)

  return (
    <div className="bg-gray-50 px-6 md:px-12 py-10 rounded-lg shadow-md">
      <h2 className="text-4xl font-bold mb-6 text-left text-gray-800">Just for You</h2>
      {loading ? (
        <div className="flex justify-center my-6">
          <p className="text-gray-600 text-lg">Loading products For You...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {randomItems.map((product) => (
              <div 
                key={product.id} 
                className="bg-white p-4 rounded-xl shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 transform hover:scale-105"
                onClick={() => handleProductClick(product)}
              >
                <ProductSlider images={product.photos.map((photo) => photo.url)} />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <p className="text-gray-800 font-semibold mb-2">
                    Price: 
                    {product.discount > 0 ? (
                      <>
                        <span className="line-through text-gray-500 ml-2">${product.price.toFixed(2)}</span>{' '}
                        <span className="text-red-500">
                          ${(product.price - (product.price * product.discount) / 100).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span> ${product.price.toFixed(2)}</span>
                    )}
                  </p>
        
                  {/* Rating Display */}
                  {product.rating > 0 && renderStars(product.rating)}
        
                  {/* Stock Display with Conditional Styling */}
                  <p className={`text-sm font-semibold ${product.inStock > 5 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.inStock > 5 ? `In Stock: ${product.inStock}` : 'Low Stock'}
                  </p>
        
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-500 transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          {items.length > 9 && (
            <div className="flex justify-center mt-8">
              <Link
                to="/collection"
                className="px-6 py-2 bg-indigo-600 text-white rounded-full shadow-md text-base font-semibold hover:bg-indigo-500 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                See More Products
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JustForYou;
