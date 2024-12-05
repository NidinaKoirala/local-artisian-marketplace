import React, { useEffect, useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // For success messages
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [review, setReview] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
          setMessage('Please log in to view your profile.');
          return;
        }

        const response = await fetch(`${backendUrl}/user/${storedUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        setUser(data);

        // Fetch order history
        fetchOrderHistory(storedUser.id);
      } catch (error) {
        console.error(error);
        setMessage(error.message || 'An error occurred while fetching user details.');
      }
    };

    fetchUserDetails();
  }, []);

  const fetchOrderHistory = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/order/history/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }
  
      const data = await response.json();
  
      // Fetch status for each order and assign colors
      const ordersWithStatus = await Promise.all(
        data.orders.map(async (order) => {
          const statusResponse = await fetch(
            `${backendUrl}/order/status?orderId=${order.orderId}`
          );
          const statusData = await statusResponse.json();
  
          // Add color for each status
          const statusColors = {
            Received: 'bg-blue-500 text-white',
            Packed: 'bg-yellow-500 text-white',
            'Ready to Ship': 'bg-orange-500 text-white',
            Delivered: 'bg-green-500 text-white',
          };
  
          const statusClass = statusColors[statusData.status] || 'bg-gray-500 text-white';
  
          return { ...order, status: statusData.status, statusClass };
        })
      );
  
      setOrderHistory(ordersWithStatus);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'An error occurred while fetching order history.');
    }
  };
  

  const fetchProductDetails = async (itemId) => {
    try {
      const response = await fetch(`${backendUrl}/items/${itemId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const product = await response.json();
      return product;
    } catch (error) {
      console.error('Error fetching product details:', error);
      alert('Failed to fetch product details.');
    }
  };

  const handleProductClick = async (order) => {
    try {
      const productDetails = await fetchProductDetails(order.itemId);
      if (!productDetails) {
        alert('Invalid product data for review.');
        return;
      }
      setSelectedProduct(productDetails);
      setReview({ rating: 0, comment: '' });
    } catch (error) {
      console.error('Error handling product click:', error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!review.rating || !review.comment) {
      alert('Please provide both a rating and a comment.');
      return;
    }

    if (!selectedProduct || !selectedProduct.id) {
      alert('Invalid product selected for review.');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/items/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          itemId: selectedProduct.id,
          rating: review.rating,
          comment: review.comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      setReviews((prevReviews) => [
        ...prevReviews,
        { itemId: selectedProduct.id, comment: review.comment, rating: review.rating },
      ]);

      setSuccessMessage('Review submitted successfully!');
      setSelectedProduct(null);

      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'An unexpected error occurred.');
    }
  };

  const toggleProfileDetails = () => {
    setShowProfileDetails((prev) => !prev);
  };

  const renderStars = (rating) => {
    const filledStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const totalStars = 5;
    return (
      <div className="flex items-center mb-2">
        {[...Array(filledStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">&#9733;</span>
        ))}
        {halfStar && <span className="text-yellow-400">&#9734;</span>}
        {[...Array(totalStars - filledStars - (halfStar ? 1 : 0))].map((_, i) => (
          <span key={i} className="text-gray-300">&#9733;</span>
        ))}
      </div>
    );
  };

  if (message && !user) {
    return <p className="text-center mt-10">{message}</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Your Orders</h2>
      <div className="mb-8">
        {orderHistory.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Review</th>
              </tr>
            </thead>
            <tbody>
              {orderHistory.map((order) => (
                <tr
                  key={order.orderId}
                  className={`hover:bg-gray-50 ${
                    reviews.some((review) => review.itemId === order.itemId) ? 'bg-green-100' : ''
                  }`}
                >
                  <td className="border border-gray-300 px-4 py-2">{order.orderId}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(order.orderDate).toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.itemName}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">${order.itemPrice.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                   <button
                     onClick={() => handleProductClick(order)}
                     className={`px-3 py-1 rounded ${
                       order.status === 'Delivered'
                         ? 'bg-blue-600 text-white hover:bg-blue-500'
                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     }`}
                     disabled={order.status !== 'Delivered'}
                   >
                     Review
                   </button>
                 </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Write a Review for {selectedProduct.title}</h3>
            <textarea
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              placeholder="Write your review..."
              className="w-full p-2 border rounded"
            />
            <div className="flex items-center space-x-4 mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`text-2xl ${review.rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                  onClick={() => setReview({ ...review, rating: star })}
                >
                  &#9733;
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4 space-x-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Details */}
      <button
        onClick={toggleProfileDetails}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
      >
        {showProfileDetails ? 'Hide Profile Details' : 'Show Profile Details'}
      </button>

      {showProfileDetails && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Profile Details</h3>
          <p className="text-gray-500 mb-2"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p className="text-gray-500 mb-2"><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-500 mb-2"><strong>Username:</strong> {user.username}</p>
          <p className="text-gray-500 mb-2"><strong>Role:</strong> {user.role}</p>
          <p className="text-gray-500 mb-2"><strong>Phone:</strong> {user.phoneNumber || 'Not provided'}</p>
          <p className="text-gray-500"><strong>Address:</strong> {user.addressLine1}, {user.addressLine2 || ''}, {user.city}, {user.state}, {user.postalCode}, {user.country}</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
