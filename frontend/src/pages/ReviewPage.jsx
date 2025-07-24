
import React, { useState } from 'react';
import { Star, User, Edit2 } from 'lucide-react';

const ReviewPage = () => {
  // Simulate current user name (replace with real user logic if available)
  const currentUser = 'You';

  const [reviews, setReviews] = useState([
    {
      _id: '1',
      clientName: 'Rahul Mehta',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      comment: 'Got instant access! Enjoyed 4K content without any issue.',
      createdAt: '2025-07-10T10:30:00Z'
    },
    {
      _id: '2',
      clientName: 'Priya Singh',
      avatar: '/api/placeholder/40/40',
      rating: 4,
      comment: 'Great experience. Fast delivery and worked well!',
      createdAt: '2025-07-08T14:00:00Z'
    },
    {
      _id: '3',
      clientName: 'Amit Rawat',
      avatar: '/api/placeholder/40/40',
      rating: 3,
      comment: 'The link worked but access was a bit delayed.',
      createdAt: '2025-07-06T09:00:00Z'
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);

  const StarRating = ({ rating, onChange, editable }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={editable ? "button" : undefined}
          onClick={editable ? () => onChange(star) : undefined}
          className="focus:outline-none"
        >
          <Star
            className={`w-5 h-5 transition-colors duration-300 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Add new comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setReviews([
      {
        _id: Date.now().toString(),
        clientName: currentUser,
        avatar: '/api/placeholder/40/40',
        rating: newRating,
        comment: newComment,
        createdAt: new Date().toISOString()
      },
      ...reviews
    ]);
    setNewComment('');
    setNewRating(5);
  };

  // Start editing (only allow if review is by current user)
  const handleEdit = (review) => {
    if (review.clientName !== currentUser) return;
    setEditingId(review._id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  // Save edit
  const handleSaveEdit = (id) => {
    setReviews(reviews.map(r =>
      r._id === id ? { ...r, comment: editComment, rating: editRating } : r
    ));
    setEditingId(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="min-h-screen py-10 px-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-100" />
      <div className="max-w-3xl mx-auto">
        {/* Seller Card */}
        <div className="bg-white/80 backdrop-blur rounded-lg shadow-xl p-6 mb-8 transition-transform duration-500 animate-fade-in hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TechAccessPro</h1>
              <p className="text-sm text-gray-600">Top Rated Seller on Sublite</p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(averageRating)} />
                <span className="text-sm text-gray-600">
                  {averageRating} ({reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Comment Form */}
        <form
          onSubmit={handleAddComment}
          className="bg-white/80 backdrop-blur rounded-lg shadow p-6 mb-8 animate-fade-in"
        >
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Add Your Review</h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-gray-700">Your Rating:</span>
            <StarRating rating={newRating} onChange={setNewRating} editable />
          </div>
          <textarea
            className="w-full rounded border border-gray-300 p-2 mb-3 focus:ring-2 focus:ring-indigo-300 transition"
            rows={3}
            placeholder="Write your comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition"
          >
            Add Review
          </button>
        </form>

        {/* Reviews */}
        {reviews.map((review, idx) => (
          <div
            key={review._id}
            className={`
              bg-white/80 backdrop-blur rounded-lg shadow-md p-6 mb-6
              transition-all duration-500
              hover:scale-105 hover:shadow-xl
              animate-fade-in
              ${idx % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'}
            `}
            style={{ animationDelay: `${idx * 120 + 200}ms` }}
          >
            <div className="flex items-start gap-4">
              <img
                src={review.avatar}
                alt={review.clientName}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-300"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{review.clientName}</h3>
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                {editingId === review._id ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={editRating} onChange={setEditRating} editable />
                    </div>
                    <textarea
                      className="w-full rounded border border-gray-300 p-2 mb-2 focus:ring-2 focus:ring-indigo-300 transition"
                      rows={2}
                      value={editComment}
                      onChange={e => setEditComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                        onClick={() => handleSaveEdit(review._id)}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded transition"
                        onClick={handleCancelEdit}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <StarRating rating={review.rating} />
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                    {review.clientName === currentUser && (
                      <button
                        className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 mt-2 text-sm transition"
                        onClick={() => handleEdit(review)}
                        type="button"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Custom Animations */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.7s ease both;
          }
          @keyframes slide-in-left {
            from { opacity: 0; transform: translateX(-40px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(40px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes gradient {
            0%,100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 8s ease-in-out infinite;
          }
        `}
      </style>
=======
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext'; // Import useUser to get current user's ID
import { useTheme } from '../context/ThemeContext';

// Mock data for reviews (replace with actual API fetch later)
const mockReviews = [
  {
    _id: 'rev1',
    bookingId: 'book1',
    clientId: { _id: 'user1', name: 'Alice Johnson' }, // Mock client ID
    providerId: { _id: 'provider1', name: 'Bob Smith' }, // Mock provider ID
    serviceId: { _id: 'serv1', name: 'Netflix Premium Shared' },
    rating: 5,
    comment: 'Excellent service! Very smooth process and reliable access. Highly recommend!',
    serviceQuality: 5,
    responseTime: 5,
    overallExperience: 5,
    isVerified: true,
    helpfulCount: 12,
    createdAt: '2024-07-15T10:00:00Z',
  },
  {
    _id: 'rev2',
    bookingId: 'book2',
    clientId: { _id: 'user3', name: 'Charlie Brown' },
    providerId: { _id: 'provider2', name: 'Diana Prince' },
    serviceId: { _id: 'serv2', name: 'Spotify Family Slot' },
    rating: 4,
    comment: 'Good experience overall. A minor delay in getting credentials, but resolved quickly.',
    serviceQuality: 4,
    responseTime: 3,
    overallExperience: 4,
    isVerified: true,
    helpfulCount: 5,
    createdAt: '2024-07-12T14:30:00Z',
  },
  {
    _id: 'rev3',
    bookingId: 'book3',
    clientId: { _id: 'user5', name: 'Eve Adams' },
    providerId: { _id: 'provider3', name: 'Frank White' },
    serviceId: { _id: 'serv3', name: 'Xbox Game Pass (3 Days)' },
    rating: 5,
    comment: 'Instant access, perfect for a weekend gaming session. Saved a lot!',
    serviceQuality: 5,
    responseTime: 5,
    overallExperience: 5,
    isVerified: false, // Not yet verified
    helpfulCount: 20,
    createdAt: '2024-07-10T08:00:00Z',
  },
  {
    _id: 'rev4',
    bookingId: 'book4',
    clientId: { _id: 'user7', name: 'Grace Hopper' },
    providerId: { _id: 'provider4', name: 'Hal 9000' },
    serviceId: { _id: 'serv4', name: 'JioHotstar Premium' },
    rating: 3,
    comment: 'Decent service, but video quality was inconsistent at times. Good value for money though.',
    serviceQuality: 3,
    responseTime: 4,
    overallExperience: 3,
    isVerified: true,
    helpfulCount: 3,
    createdAt: '2024-07-08T11:45:00Z',
  },
];

// Mock data for subscriptions that are "completed" and can be reviewed by the current user.
// In a real app, this would come from the user's completed bookings/subscriptions.
const mockReviewableSubscriptions = [
  {
    bookingId: 'book_comp_1',
    serviceId: { _id: 'serv5', name: 'New Streaming Service' },
    providerId: { _id: 'provider5', name: 'StreamCo' },
    status: 'completed',
    canReview: true, // Flag to indicate it's ready for review
  },
  {
    bookingId: 'book_comp_2',
    serviceId: { _id: 'serv6', name: 'Gaming Pass Pro' },
    providerId: { _id: 'provider6', name: 'GameHub' },
    status: 'completed',
    canReview: true,
  },
  {
    bookingId: 'book_comp_3',
    serviceId: { _id: 'serv1', name: 'Netflix Premium Shared' }, // Example of reviewing an existing service
    providerId: { _id: 'provider1', name: 'Bob Smith' },
    status: 'completed',
    canReview: true,
  },
];


const ReviewPage = () => {
  const { user, token } = useUser(); // Get current logged-in user details
  const { darkMode } = useTheme();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [currentReview, setCurrentReview] = useState(null); // State for review being edited/added
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedSubscriptionToReview, setSelectedSubscriptionToReview] = useState(''); // State for selected subscription in add modal

  // Function to simulate fetching reviews (replace with actual API fetch later)
  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handler for marking a review as helpful
  const handleHelpful = (reviewId) => {
    // In a real app, you'd send an API request to increment helpfulCount on the backend
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review._id === reviewId ? { ...review, helpfulCount: review.helpfulCount + 1 } : review
      )
    );
  };

  // Handlers for Add/Edit/Delete
  const openAddModal = () => {
    setCurrentReview(null); // Clear previous review data
    setModalType('add');
    setSelectedSubscriptionToReview(''); // Reset selected subscription
    setIsModalOpen(true);
  };

  const openEditModal = (review) => {
    setCurrentReview(review); // Set review data for editing
    setModalType('edit');
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setCurrentReview(null); // Clear current review data
    setSelectedSubscriptionToReview(''); // Clear selected subscription
  };

  const handleSaveReview = (reviewData) => {
    if (modalType === 'add') {
      const selectedSub = mockReviewableSubscriptions.find(sub => sub.bookingId === selectedSubscriptionToReview);
      if (!selectedSub) {
        alert("Please select a service to review.");
        return;
      }

      const newReview = {
        ...reviewData,
        _id: `rev${reviews.length + 1}`, // Generate a unique mock ID
        bookingId: selectedSub.bookingId, // Use bookingId from selected subscription
        clientId: user ? { _id: user._id, name: user.name || 'Current User' } : { _id: 'mockClient', name: 'Mock Client' }, // Use actual user or mock
        serviceId: selectedSub.serviceId, // Use serviceId from selected subscription
        providerId: selectedSub.providerId, // Use providerId from selected subscription
        createdAt: new Date().toISOString(),
        isVerified: false, // New reviews are not verified by default
        helpfulCount: 0,
      };
      setReviews(prevReviews => [...prevReviews, newReview]);
    } else if (modalType === 'edit' && currentReview) {
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === currentReview._id ? { ...review, ...reviewData } : review
        )
      );
    }
    closeReviewModal();
    // In a real app, you'd send API requests here (POST for add, PUT for edit)
  };

  const handleDeleteReview = (reviewId) => {
    // Confirmation dialog before deleting a review.
    if (window.confirm("Are you sure you want to delete this review?")) { // Using window.confirm for simplicity, replace with custom modal if needed
      setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
      // In a real app, you'd send a DELETE API request here
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
    // Main page container with adaptable background and text colors.
    <div className="p-6 md:p-10 min-h-screen animate-fade-in bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-6">
        {/* Page title */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">User Reviews</h1>
        {/* Add Review Button - Conditionally displayed if there are reviewable subscriptions */}
        {mockReviewableSubscriptions.length > 0 && (
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
                <h3 className="text-xl font-semibold text-[#2bb6c4] dark:text-[#5ed1dc] mb-2">{review.serviceId.name}</h3>
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
                <p>Reviewed by: <span className="font-medium text-gray-800 dark:text-gray-200">{review.clientId.name}</span></p>
                <p>Provider: <span className="font-medium text-gray-800 dark:text-gray-200">{review.providerId.name}</span></p>
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
              {/* Edit and Delete Buttons - Conditionally rendered */}
              {user && review.clientId && review.clientId._id === user._id && ( // Only show if current user is the author
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
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const reviewData = {
                // For mock, serviceId is just a name. In real app, it would be an ID.
                serviceId: { name: formData.get('serviceName') },
                rating: parseInt(formData.get('rating')),
                comment: formData.get('comment'),
                serviceQuality: parseInt(formData.get('serviceQuality')),
                responseTime: parseInt(formData.get('responseTime')),
                overallExperience: parseInt(formData.get('overallExperience')),
              };
              handleSaveReview(reviewData);
            }}>
              {/* Dropdown to select a completed subscription to review */}
              {modalType === 'add' && (
                <div className="mb-4">
                  <label htmlFor="subscriptionToReview" className="block text-sm font-medium mb-1">Select Service to Review</label>
                  <select
                    id="subscriptionToReview"
                    name="subscriptionToReview"
                    value={selectedSubscriptionToReview}
                    onChange={(e) => setSelectedSubscriptionToReview(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">-- Select a completed service --</option>
                    {mockReviewableSubscriptions.map(sub => (
                      <option key={sub.bookingId} value={sub.bookingId}>
                        {sub.serviceId.name} (by {sub.providerId.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service Name (Read-only for edit, derived from selection for add) */}
              {modalType === 'edit' && (
                <div className="mb-4">
                  <label htmlFor="serviceName" className="block text-sm font-medium mb-1">Service Name</label>
                  <input
                    type="text"
                    id="serviceName"
                    name="serviceName"
                    defaultValue={currentReview?.serviceId?.name || ''}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    readOnly // Make it read-only for edit mode
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
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2bb6c4] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1ea1b0] transition-colors shadow"
                >
                  {modalType === 'add' ? 'Add Review' : 'Save Changes'}
                </button>
              </div>
            </form>
            {/* Close button for modal */}
            <button
              onClick={closeReviewModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
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

