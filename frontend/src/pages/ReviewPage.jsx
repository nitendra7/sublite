import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, PlusCircle, Edit, Trash2, Loader2, MessageSquare } from 'lucide-react';
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
        const reviewsResponse = await apiFetch(`${API_BASE}/api/reviews/my/reviews`);
        if (!reviewsResponse.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const reviewsData = await reviewsResponse.json();

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
      alert('Please log in to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (modalType === 'add') {
        response = await apiFetch(`${API_BASE}/api/reviews`, {
          method: 'POST',
          body: JSON.stringify(reviewData)
        });
      } else {
        response = await apiFetch(`${API_BASE}/api/reviews/${currentReview._id}`, {
          method: 'PUT',
          body: JSON.stringify(reviewData)
        });
      }

      if (response.ok) {
        const savedReview = await response.json();
        
        if (modalType === 'add') {
          setReviews(prev => [savedReview, ...prev]);
          setReviewableBookings(prev => prev.filter(booking => booking._id !== selectedBookingToReview));
        } else {
          setReviews(prev => prev.map(review => 
            review._id === currentReview._id ? savedReview : review
          ));
        }
        
        closeReviewModal();
        alert(modalType === 'add' ? 'Review submitted successfully!' : 'Review updated successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save review');
      }
    } catch (err) {
      console.error('Error saving review:', err);
      alert(err.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        alert('Review deleted successfully!');
      } else {
        throw new Error('Failed to delete review');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      alert(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bb6c4] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-500 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Reviews & Ratings
            </h1>
            <p className="text-gray-500 dark:text-gray-300">
              See what others are saying about services and providers.
            </p>
          </div>
          {reviewableBookings.length > 0 && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#2bb6c4] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1ea1b0] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <PlusCircle size={20} /> Add Review
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {reviews.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Can Review</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">
                {reviewableBookings.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-xl flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to share your experience with a service!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Review Header */}
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
                      className={`${i < review.rating ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-600'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">({review.rating}/5)</span>
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-gray-700 dark:text-gray-200 text-base mb-4 italic leading-relaxed">
                  "{review.comment}"
                </p>
              )}

              {/* Detailed Ratings */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Service Quality:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{review.serviceQuality}/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{review.responseTime}/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Overall Experience:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{review.overallExperience}/5</span>
                </div>
              </div>

              {/* Reviewer and Provider Info */}
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Reviewed by: <span className="font-medium text-gray-800 dark:text-gray-200">{review.clientId?.name || 'User'}</span></p>
                <p>Provider: <span className="font-medium text-gray-800 dark:text-gray-200">{review.providerId?.name || 'Provider'}</span></p>
              </div>

              {/* Verified and Helpful Count */}
              <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-100 dark:border-gray-700">
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
                  <ThumbsUp size={16} /> {review.helpfulCount || 0}
                </button>
              </div>

              {/* Edit and Delete Buttons */}
              {user && review.clientId && review.clientId._id === user._id && (
                <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => openEditModal(review)}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                {modalType === 'add' ? 'Add Review' : 'Edit Review'}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const reviewData = {
                  bookingId: formData.get('bookingToReview'),
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
                    <label htmlFor="bookingToReview" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Service to Review</label>
                    <select
                      id="bookingToReview"
                      name="bookingToReview"
                      value={selectedBookingToReview}
                      onChange={(e) => setSelectedBookingToReview(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
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
                    <label htmlFor="serviceName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Service Name</label>
                    <input
                      type="text"
                      id="serviceName"
                      name="serviceName"
                      defaultValue={currentReview?.serviceId?.serviceName || ''}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
                      readOnly
                    />
                  </div>
                )}

                {/* Rating */}
                <div className="mb-4">
                  <label htmlFor="rating" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rating (1-5)</label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    min="1"
                    max="5"
                    defaultValue={currentReview?.rating || ''}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Comment</label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows="3"
                    defaultValue={currentReview?.comment || ''}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200 resize-none"
                  ></textarea>
                </div>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label htmlFor="serviceQuality" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Service Quality (1-5)</label>
                    <input
                      type="number"
                      id="serviceQuality"
                      name="serviceQuality"
                      min="1"
                      max="5"
                      defaultValue={currentReview?.serviceQuality || ''}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="responseTime" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Response Time (1-5)</label>
                    <input
                      type="number"
                      id="responseTime"
                      name="responseTime"
                      min="1"
                      max="5"
                      defaultValue={currentReview?.responseTime || ''}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="overallExperience" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Overall Experience (1-5)</label>
                    <input
                      type="number"
                      id="overallExperience"
                      name="overallExperience"
                      min="1"
                      max="5"
                      defaultValue={currentReview?.overallExperience || ''}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#2bb6c4] text-white py-3 rounded-xl font-semibold hover:bg-[#1ea1b0] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      modalType === 'add' ? 'Submit Review' : 'Update Review'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;