import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';

const ReviewPage = () => {
  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const reviews = [
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
  ];

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
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

        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex items-start gap-4">
              <img
                src={review.avatar}
                alt={review.clientName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{review.clientName}</h3>
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <StarRating rating={review.rating} />
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewPage;
