import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/reviews`)
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) setReviews(data);
        else setError(data.error || 'Failed to fetch reviews');
      })
      .catch(() => setError('Failed to fetch reviews'));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2 className="mb-4">Reviews</h2>
      <div className="row g-4">
        {reviews.map(r => (
          <div key={r._id || r.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="card-title text-primary fw-bold mb-3">Review</h5>
                <div className="mb-2"><span className="fw-semibold">Reviewer:</span> {r.reviewerId || r.reviewer}</div>
                <div className="mb-2">
                  <span className="fw-semibold">Rating:</span> <span className="badge bg-warning text-dark">{r.rating}</span>
                </div>
                <div className="mb-2"><span className="fw-semibold">Comment:</span> {r.comment}</div>
                <div className="mb-2"><span className="fw-semibold">Date:</span> {formatDate(r.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 