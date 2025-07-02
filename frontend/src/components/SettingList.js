import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://sublite-wmu2.onrender.com';

function SettingList() {
  const [settings, setSettings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setSettings(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2 className="mb-4">Settings</h2>
      <div className="row g-4">
        {settings.map(s => (
          <div key={s._id || s.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="card-title text-primary fw-bold mb-3">{s.key || s.name}</h5>
                <div className="mb-2"><span className="fw-semibold">Value:</span> {s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingList; 