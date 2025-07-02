import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://sublite-wmu2.onrender.com';

function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/services`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading services...</div>;
  if (error) return <div className="text-danger">Error: {error}</div>;

  return (
    <div>
      <h2 className="mb-4">Services</h2>
      <div className="row g-4">
        {services.map(s => (
          <div key={s._id || s.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="card-title text-primary fw-bold mb-3">{s.serviceName}</h5>
                <div className="mb-2"><span className="fw-semibold">Type:</span> {s.serviceType}</div>
                <div className="mb-2"><span className="fw-semibold">Provider:</span> {s.providerId}</div>
                <div className="mb-2"><span className="fw-semibold">Original Price:</span> {s.originalPrice}</div>
                <div className="mb-2"><span className="fw-semibold">Rental Price:</span> {s.rentalPrice}</div>
                <div className="mb-2">
                  <span className="fw-semibold">Status:</span> <span className={`badge bg-${s.serviceStatus === 'active' ? 'success' : s.serviceStatus === 'inactive' ? 'secondary' : 'warning'} text-uppercase`}>{s.serviceStatus}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceList; 