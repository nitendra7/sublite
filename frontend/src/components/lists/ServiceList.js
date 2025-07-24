import React, { useEffect, useState } from 'react';
import { API_BASE, apiFetch } from '../../utils/api';

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    apiFetch(`${API_BASE}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServices(data);
        else setError(data.error || 'Failed to fetch services');
      })
      .catch(() => setError('Failed to fetch services'));
  }, []);
  if (error) return <div className="alert alert-danger">{error}</div>;
  return (
    <div>
      <h3>Services</h3>
      <ul>
        {services.map(s => <li key={s._id}>{s.name}</li>)}
      </ul>
    </div>
  );
} 