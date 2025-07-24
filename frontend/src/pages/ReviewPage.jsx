import React, { useState, useEffect } from 'react';
import { Star, User, Edit2, Loader, Plus, ThumbsUp, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://sublite-wmu2.onrender.com';

const ReviewPage = () => {
  const { user, token } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);

  // Get current user name from context or localStorage
  const currentUser = user?.name || localStorage.getItem('userName') || 'Anonymous User';

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

  // Load reviews on component mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        // For now, using mock data. Replace with actual API call
        const mockReviews = [
          {
            _id: '1',
            clientName: 'John Doe',
            avatar: 'https://via.placeholder.com/40',
            rating: 5,
            comment: 'Excellent service! Very professional and timely.',
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            _id: '2',
            clientName: 'Jane Smith',
            avatar: 'https://via.placeholder.com/40',
            rating: 4,
            comment: 'Good quality work, would recommend.',
            createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
          }
        ];
        setReviews(mockReviews);
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Add new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      // Create new review object
      const newReview = {
        _id: Date.now().toString(),
        clientName: currentUser,
        avatar: user?.avatar || 'https://via.placeholder.com/40',
        rating: newRating,
        comment: newComment,
        createdAt: new Date().toISOString()
      };
      
      // Add to reviews list
      setReviews([newReview, ...reviews]);
      setNewComment('');
      setNewRating(5);
      
      // TODO: Replace with actual API call
      // await fetch(`${API_BASE}/api/reviews`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     rating: newRating,
      //     comment: newComment
      //   })
      // });
    } catch (err) {
      setError('Failed to add review');
      console.error('Error adding review:', err);
    } finally {
      setSubmitting(false);
    }
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Loading reviews...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition"
          >
            Retry
          </button>
        </div>
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
            disabled={submitting || !newComment.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Review
              </>
            )}
          </button>
        </form>

        {/* Reviews */}
        {reviews.length === 0 ? (
          <div className="bg-white/80 backdrop-blur rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No reviews yet. Be the first to leave a review!</p>
          </div>
        ) : (
          reviews.map((review, idx) => (
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
          ))
        )}
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
