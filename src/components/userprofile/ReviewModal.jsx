import React, { useEffect, useState } from 'react';
import ProfileDetails from './ProfileDetails';
import OrderHistoryTable from './OrderHistoryTable';
import ReviewModal from './ReviewModal';
import SuccessMessage from './SuccessMessage';
import EditReviewModal from './EditReviewModal';
import EditProfileForm from './EditProfileForm';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [showSection, setShowSection] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState({ orders: false, reviews: false });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
          setMessage('Please log in to view your profile.');
          return;
        }

        const [userRes, ordersRes, reviewsRes, countsRes] = await Promise.all([
          fetch(`${backendUrl}/profile/user/${storedUser.id}`),
          fetch(`${backendUrl}/profile/order/history/${storedUser.id}`),
          fetch(`${backendUrl}/profile/reviews/user/${storedUser.id}`),
          fetch(`${backendUrl}/profile/order/status-counts/${storedUser.id}`)
        ]);

        const userData = await userRes.json();
        const ordersData = await ordersRes.json();
        const reviewsData = await reviewsRes.json();
        const countsData = await countsRes.json();

        setUser(userData);
        setOrderHistory(ordersData.orders);
        setReviews(reviewsData.reviews);
        setStatusCounts(countsData);
      } catch (error) {
        console.error(error);
        setMessage(error.message || 'An error occurred while fetching data.');
      }
    };

    fetchUserDetails();
  }, []);

  const handleUpdateProfile = async (updatedFields) => {
    try {
      console.log('Received update info:', updatedFields);
  
      const response = await fetch(`${backendUrl}/profile/user/${user.id}`, {
        method: 'PATCH', // Changed from PUT to PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile update failed');
      }
      
      const result = await response.json();
      setUser({ ...user, ...updatedFields });
      setSuccessMessage(result.message || 'Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage(error.message);
    }
  };
  const handleReviewSubmit = async () => {
    try {
      if (!selectedProduct || !user) {
        throw new Error('Missing product or user information');
      }
  
      const response = await fetch(`${backendUrl}/profile/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          itemId: selectedProduct.itemId,
          orderId: selectedProduct.id,
          rating: review.rating,
          comment: review.comment || ''
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Review submission failed');
      }
  
      // Update the local state to reflect the new review
      const updatedOrderHistory = orderHistory.map(order => 
        order.id === selectedProduct.id ? { ...order, isReviewed: 1 } : order
      );
      setOrderHistory(updatedOrderHistory);
  
      // Add the new review to the reviews list
      const newReview = {
        id: Date.now(), // temporary id, you might want to fetch the actual id from the server
        userId: user.id,
        itemId: selectedProduct.itemId,
        itemTitle: selectedProduct.itemTitle,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date().toISOString()
      };
      setReviews([...reviews, newReview]);
  
      setSuccessMessage(data.message || 'Review submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedProduct(null);
      setReview({ rating: 0, comment: '' });
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };
  const handleReviewUpdate = async (reviewId, updatedReview) => {
    try {
      const response = await fetch(`${backendUrl}/profile/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReview)
      });

      if (!response.ok) throw new Error('Review update failed');
      
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, ...updatedReview } : r
      ));
      setSuccessMessage('Review updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedReview(null);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      const response = await fetch(`${backendUrl}/profile/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Review deletion failed');
      
      setReviews(reviews.filter(r => r.id !== reviewId));
      setSuccessMessage('Review deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const renderSection = () => {
    switch (showSection) {
      case 'profile':
        return <EditProfileForm user={user} onUpdate={handleUpdateProfile} />;
      case 'orders':
        return <OrderHistoryTable 
          orderHistory={orderHistory} 
          handleProductClick={setSelectedProduct} 
          loadingOrders={loading.orders} 
        />;
      case 'reviews':
        return (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Your Reviews</h3>
            {reviews.map(review => (
              <div key={review.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{review.itemTitle}</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xl 
                          ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedReview(review)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleReviewDelete(review.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <DashboardCard 
              title="Total Orders" 
              value={orderHistory.length} 
              bgColor="bg-blue-100"
            />
            <DashboardCard 
              title="Delivered" 
              value={statusCounts.Delivered || 0} 
              bgColor="bg-green-100"
            />
            <DashboardCard 
              title="Pending" 
              value={(statusCounts.Received || 0) + (statusCounts.Packed || 0)} 
              bgColor="bg-yellow-100"
            />
            <DashboardCard 
              title="Cancelled" 
              value={statusCounts.Cancelled || 0} 
              bgColor="bg-red-100"
            />
            
            <div className="col-span-full mt-6">
              <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
              <div className="space-y-4">
                {orderHistory.slice(0, 5).map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{order.itemTitle}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SuccessMessage message={successMessage} />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowSection('dashboard')}
            className={`px-6 py-3 rounded-full ${showSection === 'dashboard' 
              ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setShowSection('profile')}
            className={`px-6 py-3 rounded-full ${showSection === 'profile' 
              ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setShowSection('orders')}
            className={`px-6 py-3 rounded-full ${showSection === 'orders' 
              ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Order History
          </button>
          <button
            onClick={() => setShowSection('reviews')}
            className={`px-6 py-3 rounded-full ${showSection === 'reviews' 
              ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
          >
            My Reviews
          </button>
        </div>

        {renderSection()}
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ReviewModal
          selectedProduct={selectedProduct}
          review={review}
          setReview={setReview}
          handleReviewSubmit={handleReviewSubmit}
          closeModal={() => setSelectedProduct(null)}
        />
      )}

      {selectedReview && (
        <EditReviewModal
          review={selectedReview}
          onUpdate={handleReviewUpdate}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
};

const DashboardCard = ({ title, value, bgColor }) => (
  <div className={`${bgColor} p-6 rounded-xl shadow-sm`}>
    <h3 className="text-gray-500 text-sm mb-2">{title}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

const getStatusClass = (status) => {
  const classes = {
    Delivered: 'bg-green-100 text-green-800',
    Received: 'bg-blue-100 text-blue-800',
    Packed: 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

export default UserProfile;