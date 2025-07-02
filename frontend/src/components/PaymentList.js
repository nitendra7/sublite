import React, { useEffect, useState } from 'react';
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://sublite-wmu2.onrender.com';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/payments`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setPayments(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2 className="mb-4">Payments</h2>
      <div className="row g-4">
        {payments.map(p => (
          <div key={p._id || p.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="card-title text-primary fw-bold mb-3">Payment</h5>
                <div className="mb-2"><span className="fw-semibold">Amount:</span> {p.amount}</div>
                <div className="mb-2"><span className="fw-semibold">Method:</span> {p.paymentMethod}</div>
                <div className="mb-2">
                  <span className="fw-semibold">Status:</span> <span className={`badge bg-${p.paymentStatus === 'completed' ? 'success' : 'secondary'} text-uppercase`}>{p.paymentStatus}</span>
                </div>
                <div className="mb-2"><span className="fw-semibold">Date:</span> {formatDate(p.paidAt || p.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentList; 