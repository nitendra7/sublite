import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SupportTicketList() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/support-tickets`)
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) setTickets(data);
        else setError(data.error || 'Failed to fetch support tickets');
      })
      .catch(() => setError('Failed to fetch support tickets'));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2 className="mb-4">Support Tickets</h2>
      <div className="row g-4">
        {tickets.map(t => (
          <div key={t._id || t.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="card-title text-primary fw-bold mb-3">{t.subject}</h5>
                <div className="mb-2">
                  <span className="fw-semibold">Status:</span> <span className={`badge bg-${t.status === 'open' ? 'success' : 'secondary'} text-uppercase`}>{t.status}</span>
                </div>
                <div className="mb-2"><span className="fw-semibold">Created:</span> {formatDate(t.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 