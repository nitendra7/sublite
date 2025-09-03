import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../../utils/api';

export default function SettingList() {
  const [settings, setSettings] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get(`/settings`)
      .then(res => {
        const data = res.data;
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