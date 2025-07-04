import React, { useEffect, useState } from 'react';
import { API_BASE, apiFetch } from '../App';

export default function SettingList() {
  const [settings, setSettings] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    apiFetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSettings(data);
        else setError(data.error || 'Failed to fetch settings');
      })
      .catch(() => setError('Failed to fetch settings'));
  }, []);
  if (error) return <div className="alert alert-danger">{error}</div>;
  return (
    <div>
      <h3>Settings</h3>
      <ul>
        {settings.map(s => <li key={s._id}>{s.key}: {s.value}</li>)}
      </ul>
    </div>
  );
} 