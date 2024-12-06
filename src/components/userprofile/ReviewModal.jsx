const ReviewModal = ({ selectedProduct, review, setReview, handleReviewSubmit, closeModal }) => {
    if (!selectedProduct) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h3 className="text-xl font-semibold mb-4">
            Write a Review for {selectedProduct.title || selectedProduct.name || 'Product'}
          </h3>
          <textarea
            value={review.comment}
            onChange={(e) => setReview({ ...review, comment: e.target.value })}
            placeholder="Write your review..."
            className="w-full p-2 border rounded mb-4"
          />
          <div className="flex items-center space-x-4">
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
              onClick={closeModal}
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
    );
  };
  
  export default ReviewModal;
  