import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL

const AllReviews = () => {
  const { productName, productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${backendUrl}/items/items/${productId}/reviews`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (error) {
        console.error('Error fetching all reviews:', error);
      }
    };

    fetchReviews();
  }, [productId]);

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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">All Reviews for {productName}</h2>
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <div key={index} className="border-b border-gray-300 pb-4 mb-4">
            {renderStars(review.rating)}
            <p className="text-gray-700">{review.comment}</p>
            <p className="text-sm text-gray-500">- {review.username}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No reviews available.</p>
      )}
      <div className="mt-6">
        <button
          onClick={() => navigate(`/product/${productName}/${productId}`)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Product
        </button>
      </div>
    </div>
  );
};

export default AllReviews;
