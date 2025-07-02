import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://sublite-wmu2.onrender.com';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function SupportTicketList() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/support-tickets`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setTickets(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

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

export default SupportTicketList; 