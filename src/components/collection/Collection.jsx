import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CartModal from "../cart/CartModal";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5174";

const Collection = ({ addToCart }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [autoSlideIndex, setAutoSlideIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState("relevant");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();
  const productsPerPage = 16;
  const categoriesPerPage = 30;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItemsAndCategories = async () => {
      try {
        const itemsResponse = await fetch(`${backendUrl}/items`);
        const itemsData = await itemsResponse.json();
        setItems(itemsData.items || []);

        const categoriesResponse = await fetch(`${backendUrl}/categories`);
        const categoriesData = await categoriesResponse.json();
        setCategories(["All", ...categoriesData]);
      } catch (error) {
        console.error("Error fetching items or categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemsAndCategories();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, categoryPage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    setSearchQuery(query);
  }, [location.search]);

  const filteredProducts = items
    .filter(
      (product) =>
        selectedCategory === "All" || product.category === selectedCategory
    )
    .filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sortOrder === "highToLow") return b.price - a.price;
    if (sortOrder === "lowToHigh") return a.price - b.price;
    return 0;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const indexOfLastCategory = categoryPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  const handleNextPage = () => setCurrentPage((prev) => prev + 1);
  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleNextCategoryPage = () => setCategoryPage((prev) => prev + 1);
  const handlePreviousCategoryPage = () =>
    setCategoryPage((prev) => Math.max(prev - 1, 1));

  const handleProductClick = (product) => {
    const productName = product.title.toLowerCase().replace(/\s+/g, "-");
    navigate(`/product/${productName}/${product.id}`);
  };

  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    addToCart(product);
    setShowModal(true);
  };

  const handleCategorySelect = (category) => {
    navigate(`/category/${category}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowSidebar(false);
  };

  const renderStars = (rating) => {
    const filledStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const totalStars = 5;
    return (
      <div className="flex items-center mb-2">
        {[...Array(filledStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">
            &#9733;
          </span>
        ))}
        {halfStar && <span className="text-yellow-400">&#9734;</span>}
        {[...Array(totalStars - filledStars - (halfStar ? 1 : 0))].map(
          (_, i) => (
            <span key={i} className="text-gray-300">
              &#9733;
            </span>
          )
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Mobile Categories Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-4 right-4 z-50 p-3 bg-gray-800 text-white rounded-lg shadow-lg text-sm md:hidden flex items-center gap-2"
      >
        {showSidebar ? (
          <>&times; Close</>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Categories
          </>
        )}
      </button>

      {/* Sidebar (Categories) */}
      {showSidebar && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col p-6 overflow-y-auto md:hidden shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Categories</h2>
            <button onClick={() => setShowSidebar(false)} className="text-gray-500 hover:text-gray-700">
              &times;
            </button>
          </div>
          <ul className="space-y-2">
            {currentCategories.map((category) => (
              <li key={category}>
                <button
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-gray-800 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
          {/* Pagination controls remain the same */}
        </div>
      )}

      {/* Desktop Categories */}
      <div className="hidden md:block w-full md:w-64 lg:w-72 pr-6 mb-6 md:mb-0">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Categories</h2>
          <ul className="space-y-2">
            {currentCategories.map((category) => (
              <li key={category}>
                <button
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-gray-800 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
          {/* Pagination controls remain the same */}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:flex-1">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent flex-1"
          />
          <select
            onChange={(e) => setSortOrder(e.target.value)}
            value={sortOrder}
            className="p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent w-full md:w-64"
          >
            <option value="relevant">Relevant</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="lowToHigh">Price: Low to High</option>
          </select>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4 text-6xl">🛒</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.photos[autoSlideIndex % product.photos.length]?.url}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      -{product.discount}%
                    </div>
                  )}
                </div>
          <div className="p-4">
           {/* Product Title - Bold and Prominent */}
           <h3 className="font-bold text-gray-900 text-[16px] mb-2 truncate hover:text-gray-800 transition-colors">
             {product.title}
           </h3>
         
           {/* Price Section */}
           <div className="flex items-center gap-1.5 mb-1">
             <span className={`text-base font-semibold ${product.discount > 0 ? 'text-red-500' : 'text-gray-900'}`}>
               ${(product.price - (product.price * product.discount) / 100).toFixed(2)}
             </span>
             {product.discount > 0 && (
               <span className="text-gray-400 line-through text-xs">
                 ${product.price.toFixed(2)}
               </span>
             )}
           </div>
         
           {/* Rating Section - Displayed Just Below Price */}
           {product.averageRating > 0 && (
             <div className="flex items-center gap-1 mb-3">
               <div className="flex items-center space-x-0.5">
                 {[...Array(5)].map((_, i) => (
                   <span key={i} className={`text-[15px] ${
                     i < Math.floor(product.averageRating)
                       ? 'text-yellow-400'
                       : product.averageRating % 1 !== 0 && i === Math.floor(product.averageRating)
                       ? 'text-yellow-400'
                       : 'text-gray-200'
                   }`}>
                     ★
                   </span>
                 ))}
               </div>
               <span className="text-gray-500 text-xs font-medium">
                 ({product.averageRating.toFixed(1)})
               </span>
             </div>
           )}
         
           {/* Stock & Add to Cart Section */}
           <div className="flex items-center justify-between">
             {/* Stock Indicator */}
             <span className={`px-2 py-1 rounded-full text-[11px] font-medium tracking-wide ${
               product.inStock === 0
                 ? 'bg-gray-100 text-gray-400'
                 : product.inStock > 5
                 ? 'bg-green-100/80 text-green-600'
                 : 'bg-amber-100/80 text-amber-600'
             }`}>
               {product.inStock === 0 ? 'Sold Out' : `${product.inStock} Left`}
             </span>
         
             {/* Add to Cart Button */}
             <button
               onClick={(e) => handleAddToCart(product, e)}
               className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all transform ${
                 product.inStock === 0
                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                   : 'bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-sm hover:shadow-md hover:from-indigo-700 hover:to-blue-600 active:scale-95'
               }`}
               disabled={product.inStock === 0}
             >
               Add to Cart
             </button>
           </div>
         </div> 
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8 mb-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            Previous
          </button>
          <span className="text-gray-600 font-medium">Page {currentPage}</span>
          <button
            onClick={handleNextPage}
            disabled={indexOfLastProduct >= sortedProducts.length}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
              indexOfLastProduct >= sortedProducts.length
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && <CartModal showModal={showModal} setShowModal={setShowModal} />}
    </div>
  );
};
export default Collection;
