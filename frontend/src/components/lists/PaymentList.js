import React, { useEffect, useState } from 'react';
import { API_BASE, apiFetch } from '../../App';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`${API_BASE}/api/payments`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPayments(data);
        else setError(data.error || 'Failed to fetch payments');
      })
      .catch(() => setError('Failed to fetch payments'));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

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