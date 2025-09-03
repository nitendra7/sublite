import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/notifications`)
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) setNotifications(data);
        else setError(data.error || 'Failed to fetch notifications');
      })
      .catch(() => setError('Failed to fetch notifications'));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2 className="mb-4">Notifications</h2>
      <div className="row g-4">
        {notifications.map(n => (
          <div key={n._id || n.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="card-title text-primary fw-bold mb-3">Notification</h5>
                <div className="mb-2"><span className="fw-semibold">Message:</span> {n.message}</div>
                <div className="mb-2">
                  <span className="fw-semibold">Type:</span> <span className="badge bg-info text-dark">{n.type}</span>
                </div>
                <div className="mb-2"><span className="fw-semibold">Date:</span> {formatDate(n.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 