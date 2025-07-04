import React from 'react';

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <div className="admin-cards">
        <div className="admin-card">Users</div>
        <div className="admin-card">Services</div>
        <div className="admin-card">Payments</div>
        <div className="admin-card">Reviews</div>
      </div>
    </div>
  );
}

export default Dashboard; 