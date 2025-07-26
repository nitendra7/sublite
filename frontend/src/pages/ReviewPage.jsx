import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch, API_BASE } from '../utils/api';

const ReviewPage = () => {
  const { user, token } = useUser();
  const { darkMode } = useTheme();

  const [reviews, setReviews] = useState([]);
  const [reviewableBookings, setReviewableBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [modalType, setModalType] = useState('add');
  const [selectedBookingToReview, setSelectedBookingToReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews and reviewable bookings
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Please log in to view reviews');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch user's reviews
        const reviewsResponse = await apiFetch(`${API_BASE}/api/reviews/my/reviews`);
        if (!reviewsResponse.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const reviewsData = await reviewsResponse.json();

        // Fetch reviewable bookings (completed bookings that haven't been reviewed)
        const bookingsResponse = await apiFetch(`${API_BASE}/api/reviews/my/reviewable-bookings`);
        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch reviewable bookings');
        }
        const bookingsData = await bookingsResponse.json();

        setReviews(reviewsData);
        setReviewableBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Handler for marking a review as helpful
  const handleHelpful = async (reviewId) => {
    try {
      const response = await apiFetch(`${API_BASE}/api/reviews/${reviewId}/helpful`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const { helpfulCount } = await response.json();
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review._id === reviewId ? { ...review, helpfulCount } : review
          )
        );
      }
    } catch (err) {
      console.error('Error marking review as helpful:', err);
    }
  };

  // Handlers for Add/Edit/Delete
  const openAddModal = () => {
    setCurrentReview(null);
    setModalType('add');
    setSelectedBookingToReview('');
    setIsModalOpen(true);
  };

  const openEditModal = (review) => {
    setCurrentReview(review);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setCurrentReview(null);
    setSelectedBookingToReview('');
  };

  const handleSaveReview = async (reviewData) => {
    if (!token) {
      setError('Please log in to submit a review');
      return;
    }

    setSubmitting(true);

    try {
      if (modalType === 'add') {
        if (!selectedBookingToReview) {
          setError("Please select a service to review.");
          setSubmitting(false);
          return;
        }

        const response = await apiFetch(`${API_BASE}/api/reviews`, {
          method: 'POST',
          body: JSON.stringify({
            bookingId: selectedBookingToReview,
            rating: reviewData.rating,
            comment: reviewData.comment,
            serviceQuality: reviewData.serviceQuality,
            responseTime: reviewData.responseTime,
            overallExperience: reviewData.overallExperience,
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create review');
        }

        const newReview = await response.json();
        setReviews(prevReviews => [newReview, ...prevReviews]);
        
        // Remove the booking from reviewable bookings since it's now reviewed
        setReviewableBookings(prev => prev.filter(booking => booking._id !== selectedBookingToReview));

      } else if (modalType === 'edit' && currentReview) {
        const response = await apiFetch(`${API_BASE}/api/reviews/${currentReview._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            rating: reviewData.rating,
            comment: reviewData.comment,
            serviceQuality: reviewData.serviceQuality,
            responseTime: reviewData.responseTime,
            overallExperience: reviewData.overallExperience,
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update review');
        }

        const updatedReview = await response.json();
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review._id === currentReview._id ? updatedReview : review
          )
        );
      }

      closeReviewModal();
    } catch (err) {
      console.error('Error saving review:', err);
      setError(err.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <p className="text-xl font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">Loading Reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <p className="text-xl font-semibold text-red-500 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-screen animate-fade-in bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">User Reviews</h1>
        {reviewableBookings.length > 0 && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#2bb6c4] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1ea1b0] transition-colors shadow"
          >
            <PlusCircle size={20} /> Add Review
          </button>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-8">See what others are saying about services and providers.</p>

      {reviews.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>No reviews available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-between
                         transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Review Header: Service Name and Rating */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-[#2bb6c4] dark:text-[#5ed1dc] mb-2">
                  {review.serviceId?.serviceName || 'Service'}
                </h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < review.rating ? "#FFD700" : "none"}
                      stroke={i < review.rating ? "#FFD700" : "currentColor"}
                      className={`text-gray-400 ${i < review.rating ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-600'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">({review.rating}/5)</span>
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-gray-700 dark:text-gray-200 text-base mb-4 italic">"{review.comment}"</p>
              )}

              {/* Detailed Ratings */}
              <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>Service Quality:</strong> {review.serviceQuality}/5</p>
                <p><strong>Response Time:</strong> {review.responseTime}/5</p>
                <p><strong>Overall Experience:</strong> {review.overallExperience}/5</p>
              </div>

              {/* Reviewer and Provider Info */}
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Reviewed by: <span className="font-medium text-gray-800 dark:text-gray-200">{review.clientId?.name || 'User'}</span></p>
                <p>Provider: <span className="font-medium text-gray-800 dark:text-gray-200">{review.providerId?.name || 'Provider'}</span></p>
              </div>

              {/* Verified and Helpful Count */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  {review.isVerified && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold dark:bg-green-800 dark:text-green-100">
                      Verified
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                >
                  <ThumbsUp size={16} /> {review.helpfulCount} Helpful
                </button>
              </div>

              {/* Edit and Delete Buttons - Only show if current user is the author */}
              {user && review.clientId && review.clientId._id === user._id && (
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(review)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="Edit Review"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-[#2bb6c4] dark:text-[#5ed1dc]">
              {modalType === 'add' ? 'Add New Review' : 'Edit Review'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-800 dark:text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const reviewData = {
                rating: parseInt(formData.get('rating')),
                comment: formData.get('comment'),
                serviceQuality: parseInt(formData.get('serviceQuality')),
                responseTime: parseInt(formData.get('responseTime')),
                overallExperience: parseInt(formData.get('overallExperience')),
              };
              handleSaveReview(reviewData);
            }}>
              {/* Dropdown to select a completed booking to review */}
              {modalType === 'add' && (
                <div className="mb-4">
                  <label htmlFor="bookingToReview" className="block text-sm font-medium mb-1">Select Service to Review</label>
                  <select
                    id="bookingToReview"
                    name="bookingToReview"
                    value={selectedBookingToReview}
                    onChange={(e) => setSelectedBookingToReview(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">-- Select a completed service --</option>
                    {reviewableBookings.map(booking => {
                      const startDate = new Date(booking.bookingDetails?.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      });
                      const endDate = new Date(booking.bookingDetails?.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      });
                      return (
                        <option key={booking._id} value={booking._id}>
                          {booking.serviceId?.serviceName} (by {booking.providerId?.name}) - Used {startDate} to {endDate}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Service Name (Read-only for edit) */}
              {modalType === 'edit' && (
                <div className="mb-4">
                  <label htmlFor="serviceName" className="block text-sm font-medium mb-1">Service Name</label>
                  <input
                    type="text"
                    id="serviceName"
                    name="serviceName"
                    defaultValue={currentReview?.serviceId?.serviceName || ''}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    readOnly
                  />
                </div>
              )}

              {/* Rating */}
              <div className="mb-4">
                <label htmlFor="rating" className="block text-sm font-medium mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="1"
                  max="5"
                  defaultValue={currentReview?.rating || ''}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="3"
                  defaultValue={currentReview?.comment || ''}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                ></textarea>
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="serviceQuality" className="block text-sm font-medium mb-1">Service Quality (1-5)</label>
                  <input
                    type="number"
                    id="serviceQuality"
                    name="serviceQuality"
                    min="1"
                    max="5"
                    defaultValue={currentReview?.serviceQuality || ''}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="responseTime" className="block text-sm font-medium mb-1">Response Time (1-5)</label>
                  <input
                    type="number"
                    id="responseTime"
                    name="responseTime"
                    min="1"
                    max="5"
                    defaultValue={currentReview?.responseTime || ''}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="overallExperience" className="block text-sm font-medium mb-1">Overall Experience (1-5)</label>
                  <input
                    type="number"
                    id="overallExperience"
                    name="overallExperience"
                    min="1"
                    max="5"
                    defaultValue={currentReview?.overallExperience || ''}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#2bb6c4] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1ea1b0] transition-colors shadow disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (modalType === 'add' ? 'Add Review' : 'Save Changes')}
                </button>
              </div>
            </form>
            
            {/* Close button for modal */}
            <button
              onClick={closeReviewModal}
              disabled={submitting}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl disabled:opacity-50"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;