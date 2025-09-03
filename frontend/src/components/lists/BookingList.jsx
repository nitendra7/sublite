import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/bookings`)
      .then(res => setBookings(res.data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2 className="mb-4">Bookings</h2>
      <div className="row g-4">
        {bookings.map(b => (
          <div key={b._id || b.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="card-title text-primary fw-bold mb-3">{b.bookingDetails?.serviceName}</h5>
                <div className="mb-2"><span className="fw-semibold">Client:</span> {b.clientId}</div>
                <div className="mb-2"><span className="fw-semibold">Rental Price:</span> {b.bookingDetails?.rentalPrice}</div>
                <div className="mb-2"><span className="fw-semibold">Start:</span> {formatDate(b.bookingDetails?.startDate)}</div>
                <div className="mb-2"><span className="fw-semibold">End:</span> {formatDate(b.bookingDetails?.endDate)}</div>
                <div className="mb-2">
                  <span className="fw-semibold">Payment Status:</span> <span className={`badge bg-${b.paymentDetails?.paymentStatus === 'completed' ? 'success' : 'secondary'} text-uppercase`}>{b.paymentDetails?.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingList; 