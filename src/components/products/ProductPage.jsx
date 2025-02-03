import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const ProductPage = ({ addToCart, isLoggedIn, cartItems, setCartItems }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showCartConfirmation, setShowCartConfirmation] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const response = await fetch(`${backendUrl}/items/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product details');
        const data = await response.json();
        setProduct(data);

        const reviewsResponse = await fetch(`${backendUrl}/items/items/${productId}/reviews`);
        if (!reviewsResponse.ok) throw new Error('Failed to fetch reviews');
        const reviewsData = await reviewsResponse.json();

        setReviews(reviewsData.reviews || []);
      } catch (error) {
        console.error('Error fetching product or reviews:', error);
      }
    };

    fetchProductAndReviews();
  }, [productId]);

  useEffect(() => {
    if (product && product.photos && product.photos.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.photos.length);
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [product]);

  const handleAddToCart = () => {
    setCartItems((prevCartItems) => {
      const existingProduct = prevCartItems.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCartItems, { ...product, quantity }];
      }
    });

    setShowCartConfirmation(true);
    setTimeout(() => setShowCartConfirmation(false), 2000);
  };

  const handleBuyNow = () => {
    if (isLoggedIn) {
      navigate('/place-order', { state: { product, quantity } });
    } else {
      setShowLoginPrompt(true);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + delta));
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
  };

  const calculateDiscountedPrice = () => {
    if (product.discount && product.discount > 0) {
      return (product.price - (product.price * product.discount) / 100).toFixed(2);
    }
    return product.price;
  };

  const renderStars = (rating) => {
    const filledStars = Math.floor(rating);
    const totalStars = 5;
    return (
      <div className="flex items-center mb-2">
        {[...Array(filledStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">&#9733;</span>
        ))}
        {[...Array(totalStars - filledStars)].map((_, i) => (
          <span key={i} className="text-gray-300">&#9733;</span>
        ))}
      </div>
    );
  };

  const handleSeeMoreReviews = () => {
    if (product) {
      navigate(`/product/${product.title.replace(/\s+/g, '-').toLowerCase()}/${product.id}/all-reviews`);
    }
  };

  const handleSellerClick = () => {
    if (product?.sellerId) {
      navigate(`/seller/${product.sellerId}`);
    }
  };
  if (!product) return <p>Loading...</p>;
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
            {/* Left Column: Image and Description */}
            <div className="mb-8 lg:mb-0">
              {/* Image Gallery */}
              <div className="relative aspect-square rounded-2xl bg-white shadow-lg overflow-hidden">
                <img
                  src={product.photos[currentImageIndex]?.url}
                  alt={product.title}
                  className="w-full h-full object-contain transform transition-transform duration-500 hover:scale-105"
                />
                
                {/* Image Navigation Dots */}
                {product.photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {product.photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageClick(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-blue-600' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
  
              {/* Thumbnail Grid */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`${product.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
  
              {/* Product Description */}
              <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.longDescription || product.description}
                </p>
              </div>
            </div>
  
            {/* Right Column: Product Details and Reviews */}
            <div>
              {/* Product Details Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
                
                {/* Price Section */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <span className={`text-3xl font-bold ${
                      product.discount > 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      ${calculateDiscountedPrice()}
                    </span>
                    {product.discount > 0 && (
                      <span className="line-through text-xl text-gray-500">${product.price}</span>
                    )}
                    {product.discount > 0 && (
                      <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                </div>
  
                {/* Seller & Category Info */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium mr-2">Sold by:</span>
                    <button
                      onClick={handleSellerClick}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      {product.shopName || "Unknown Shop"}
                    </button>
                  </div>
                  {product.category && (
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium mr-2">Category:</span>
                      <button
                        onClick={() => navigate(`/category/${encodeURIComponent(product.category)}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        {product.category}
                      </button>
                    </div>
                  )}
                </div>
  
                {/* Rating Section */}
                {product.averageRating > 0 && (
                  <div className="flex items-center mb-6">
                    {renderStars(product.averageRating)}
                    <span className="ml-2 text-gray-600">({reviews.length} reviews)</span>
                  </div>
                )}
  
                {/* Stock Status */}
                <div className="mb-8">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.inStock > 5 
                      ? 'bg-green-100 text-green-800'
                      : product.inStock > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock > 5 
                      ? `In Stock (${product.inStock} available)`
                      : product.inStock > 0 
                        ? 'Low Stock'
                        : 'Out of Stock'}
                  </span>
                </div>
  
                {/* Quantity Selector */}
                <div className="mb-8">
                  <label className="block text-gray-700 font-medium mb-3">Quantity:</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                      disabled={product.inStock === 0}
                    >
                      <span className="text-xl">-</span>
                    </button>
                    <span className="w-16 text-center text-xl font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                      disabled={product.inStock === 0}
                    >
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                </div>
  
                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.inStock === 0}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                      product.inStock > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.inStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.inStock === 0}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                      product.inStock > 0
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.inStock > 0 ? 'Buy Now' : 'Out of Stock'}
                  </button>
                </div>
              </div>
  
              {/* Reviews Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <>
                    <div className="space-y-6">
                      {reviews.slice(0, 3).map((review, index) => (
                        <div key={index} className="bg-gray-50 p-5 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-900">{review.username}</span>
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                    {reviews.length > 3 && (
                      <button
                        onClick={handleSeeMoreReviews}
                        className="mt-6 w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                      >
                        View All Reviews ({reviews.length})
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  
        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-pop-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Login Required</h3>
              <p className="text-gray-600 mb-6">You need to be logged in to complete your purchase.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/login', { state: { redirectAfterLogin: '/place-order', product, quantity } })}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Continue to Login
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Cart Confirmation Toast */}
        {showCartConfirmation && (
          <div className="fixed bottom-6 right-6 animate-slide-up">
            <div className="bg-white shadow-xl rounded-lg px-6 py-3.5 flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 font-medium">Item added to cart!</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Update renderStars function with SVG stars
  const renderStars = (rating) => {
    const filledStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-5 h-5 ${index < filledStars ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };
  
  export default ProductPage;
