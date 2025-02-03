import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductSlider from '../products/ProductSlider';
import CartModal from '../cart/CartModal';
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';


const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const CategoryPage = ({ addToCart }) => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const productsPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await fetch(`${backendUrl}/items`);
        const data = await response.json();
        const categoryProducts = data.items.filter(item => item.category === category);
        setProducts(categoryProducts);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setShowModal(true);
  };

  const handleProductClick = (product) => {
    const productName = product.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/product/${productName}/${product.id}`);
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleNextPage = () => setCurrentPage((prev) => prev + 1);
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate("/collection")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {category.replace(/-/g, ' ')}
              </h2>
            </div>
    
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-xl" />
                    <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded mt-2 w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                      <div 
                        key={product.id}
                        className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-out overflow-hidden"
                      >
                        <div 
                          className="relative overflow-hidden cursor-pointer"
                          onClick={() => handleProductClick(product)}
                        >
                          <ProductSlider 
                            images={product.photos.map(photo => photo.url)}
                            className="aspect-square object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">
                            {product.title}
                          </h3>
                          <p className="text-lg font-bold text-blue-600 mb-4">
                            ${product.price}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                            >
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20">
                      <p className="text-gray-500 text-xl">No products found in this category</p>
                    </div>
                  )}
                </div>
    
                <div className="flex items-center justify-between mt-8 px-4">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  <span className="text-sm font-medium text-gray-600">
                    Page {currentPage} of {Math.ceil(products.length / productsPerPage)}
                  </span>
    
                  <button
                    onClick={handleNextPage}
                    disabled={indexOfLastProduct >= products.length}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
    
            {showModal && <CartModal closeModal={() => setShowModal(false)} />}
          </div>
        </div>
      );
    };
    
    export default CategoryPage;
