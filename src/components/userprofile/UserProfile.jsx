import React, { useEffect, useState } from 'react';
import ProfileDetails from './ProfileDetails';
import OrderHistoryTable from './OrderHistoryTable';
import ReviewModal from './ReviewModal';
import SuccessMessage from './SuccessMessage';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
          setMessage('Please log in to view your profile.');
          return;
        }

        console.log('Fetched user from localStorage:', storedUser);

        const response = await fetch(`${backendUrl}/user/${storedUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        setUser(data);
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
      setLoadingOrders(true); // Start loading
      const response = await fetch(`${backendUrl}/order/history/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }

      const data = await response.json();

      const ordersWithStatus = await Promise.all(
        data.orders.map(async (order) => {
          try {
            console.log('Processing order:', order);

            const statusResponse = await fetch(
              `${backendUrl}/order/status?orderId=${order.orderId}`
            );

            if (!statusResponse.ok) {
              throw new Error('Failed to fetch order status');
            }

            const statusData = await statusResponse.json();

            const statusColors = {
              Received: 'bg-blue-500 text-white',
              Packed: 'bg-yellow-500 text-white',
              'Ready to Ship': 'bg-orange-500 text-white',
              Delivered: 'bg-green-500 text-white',
              Cancelled: "bg-red-500 text-white",
            };

            const statusClass = statusColors[statusData.status] || 'bg-gray-500 text-white';

            if (!order.userId || !order.itemId || !order.orderId) {
              console.error('Missing userId, itemId, or orderId:', order);
            }

            const reviewResponse = await fetch(
              `${backendUrl}/items/review/status?userId=${userId}&itemId=${order.itemId}&orderId=${order.orderId}`
            );

            if (!reviewResponse.ok) {
              throw new Error('Failed to fetch review status');
            }

            const reviewData = await reviewResponse.json();
            const isReviewed = reviewData.isReviewed;

            return { ...order, status: statusData.status, statusClass, isReviewed };
          } catch (error) {
            console.error(`Error processing order ${order.orderId}:`, error);
            return { ...order, status: 'Unknown', statusClass: 'bg-gray-500 text-white', isReviewed: false };
          }
        })
      );

      setOrderHistory(ordersWithStatus);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'An error occurred while fetching order history.');
    } finally {
      setLoadingOrders(false); // Stop loading
    }
  };

  const handleProductClick = async (order) => {
    try {
      if (!order.itemId || !order.orderId) {
        throw new Error('Order does not have a valid itemId or orderId.');
      }

      const response = await fetch(`${backendUrl}/items/${order.itemId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const productDetails = await response.json();
      setSelectedProduct({ ...productDetails, orderId: order.orderId });
      setReview({ rating: 0, comment: '' }); // Reset the review state for a new product
    } catch (error) {
      console.error('Error handling product click:', error);
      alert(error.message || 'An unexpected error occurred.');
    }
  };

  const handleReviewSubmit = async () => {
    if (!review.rating || !review.comment.trim()) {
      alert('Please provide both a rating and a comment.');
      return;
    }

    if (!selectedProduct || !selectedProduct.id || !selectedProduct.orderId) {
      alert('Invalid product selected for review.');
      return;
    }

    if (!user || !user.id) {
      alert('User is not logged in.');
      return;
    }

    try {
      console.log('Submitting review:', {
        userId: user.id,
        itemId: selectedProduct.id,
        orderId: selectedProduct.orderId,
        rating: review.rating,
        comment: review.comment,
      });

      const response = await fetch(`${backendUrl}/items/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          itemId: selectedProduct.id,
          orderId: selectedProduct.orderId,
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
      setTimeout(() => setSuccessMessage(''), 3000);
      window.location.reload(); // Reload the page
      setSelectedProduct(null); // Close the modal
      setReview({ rating: 0, comment: '' }); // Reset the review form
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'An unexpected error occurred.');
    }
  };

  const toggleProfileDetails = () => {
    setShowProfileDetails((prev) => !prev);
  };

  if (message && !user) {
    return <p className="text-center mt-10">{message}</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <SuccessMessage message={successMessage} />
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Your Orders</h2>
      <OrderHistoryTable
        orderHistory={orderHistory}
        loadingOrders={loadingOrders}
        handleProductClick={handleProductClick}
        reviews={reviews}
      />
      {selectedProduct && (
        <ReviewModal
          selectedProduct={selectedProduct}
          review={review}
          setReview={setReview}
          handleReviewSubmit={handleReviewSubmit}
          closeModal={() => setSelectedProduct(null)}
        />
      )}
      <button
        onClick={toggleProfileDetails}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
      >
        {showProfileDetails ? 'Hide Profile Details' : 'Show Profile Details'}
      </button>
      {showProfileDetails && <ProfileDetails user={user} />}
    </div>
  );
};

export default UserProfile;
