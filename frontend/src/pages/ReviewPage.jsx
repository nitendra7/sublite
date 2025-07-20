import React, { useState, useEffect } from 'react';
import { Star, User, Edit2 } from 'lucide-react';
import { useUser } from '../context/UserContext'; // Correct path from src/pages to src/context

const ReviewPage = () => {
  const { user, loading: userContextLoading, error: userContextError } = useUser();
  const currentUser = user?.name || user?.username || 'Guest'; // Use user's name or username from context
  const currentUserId = user?._id; // Get user ID for identifying own reviews

  const [reviews, setReviews] = useState([
    // Existing mock data - this should eventually be fetched from backend
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

  // You would typically fetch reviews from your API here
  // useEffect(() => {
  //   const fetchReviews = async () => {
  //     if (!userContextLoading && !userContextError) {
  //       try {
  //         const res = await fetch(`${API_BASE}/api/reviews`); // Replace with your reviews API
  //         const data = await res.json();
  //         setReviews(data);
  //       } catch (error) {
  //         console.error("Failed to fetch reviews:", error);
  //       }
  //     }
  //   };
  //   fetchReviews();
  // }, [userContextLoading, userContextError]);


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
    if (!currentUserId) { // Ensure user is logged in to add a review
      alert("You must be logged in to add a review.");
      return;
    }

    const newReview = {
      _id: Date.now().toString(), // In a real app, this would be from backend
      clientName: currentUser, // Use current user's name from context
      // avatar: user?.image || '/api/placeholder/40/40', // Use user's image if available
      avatar: '/api/placeholder/40/40',
      rating: newRating,
      comment: newComment,
      createdAt: new Date().toISOString()
      // You'd send this to your backend via API call
    };

    setReviews([
      newReview,
      ...reviews
    ]);
    setNewComment('');
    setNewRating(5);
  };

  // Start editing (only allow if review is by current user)
  const handleEdit = (review) => {
    // In a real app, you might check review.userId === currentUserId
    if (review.clientName !== currentUser) return;
    setEditingId(review._id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  // Save edit
  const handleSaveEdit = (id) => {
    // You'd send this update to your backend via API call
    setReviews(reviews.map(r =>
      r._id === id ? { ...r, comment: editComment, rating: editRating } : r
    ));
    setEditingId(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  if (userContextLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl font-semibold text-[#2bb6c4]">Loading user data for reviews...</div>
        </div>
    );
  }

  // Display error if user context failed to load or no user
  if (userContextError || !currentUserId) {
    return (
      <div className="min-h-screen py-10 px-4 relative overflow-hidden flex items-center justify-center">
         <div className="text-xl font-semibold text-red-500">Please log in to add or view personal reviews.</div>
      </div>
    );
  }

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
    </div>
  );
};

export default ReviewPage;