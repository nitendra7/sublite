import React, { useState } from 'react';
import './Subscriptions.css';
import { FaMoon, FaSun } from 'react-icons/fa';

const Subscriptions = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const subscriptions = [
    {
      id: 1,
      name: 'Netflix Premium',
      type: 'Owned',
      status: 'active',
      price: 299,
      duration: '30 days',
      startDate: '2024-07-01',
      expiryDate: '2024-07-31',
      user: 'rahul@email.com'
    },
    {
      id: 2,
      name: 'Amazon Prime',
      type: 'Borrowed',
      status: 'completed',
      price: 149,
      duration: '15 days',
      startDate: '2024-06-10',
      expiryDate: '2024-06-25',
      user: 'megha@email.com'
    },
    {
      id: 3,
      name: 'Zee5 Premium',
      type: 'Borrowed',
      status: 'active',
      price: 120,
      duration: '10 days',
      startDate: '2024-07-05',
      expiryDate: '2024-07-15',
      user: 'nishant@email.com'
    },
    {
      id: 4,
      name: 'Adobe Creative Cloud',
      type: 'Owned',
      status: 'pending',
      price: 499,
      duration: '30 days',
      startDate: '2024-07-10',
      expiryDate: '2024-08-10',
      user: 'rohan@email.com'
    }
  ];

  return (
    <div className={`subscription-page ${darkMode ? 'dark' : ''}`}>
      <div className="dark-mode-icon" onClick={toggleDarkMode}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </div>

      <div className="header-card">
        <h1 className="main-heading">My Subscriptions</h1>
        <p className="sub-heading">Track your owned and borrowed services</p>
      </div>

      <div className="cards-section">
        <div className="subscriptions-container">
          {subscriptions.map(sub => (
            <div key={sub.id} className="subscription-card">
              <span className="card-type-tag">{sub.type}</span>
              <div className="service-name">{sub.name}</div>
              <div className="info"><strong>Status:</strong> <span className={`status ${sub.status}`}>{sub.status}</span></div>
              <div className="info"><strong>Price:</strong> ₹{sub.price}</div>
              <div className="info"><strong>Duration:</strong> {sub.duration}</div>
              <div className="info"><strong>Start Date:</strong> {sub.startDate}</div>
              <div className="info"><strong>Expiry Date:</strong> {sub.expiryDate}</div>
              <div className="info"><strong>{sub.type === 'Owned' ? 'Borrowed By' : 'Shared By'}:</strong> {sub.user}</div>

              <div className="card-actions">
                {sub.type === 'Borrowed' && sub.status === 'completed' && (
                  <button className="card-button renew-button">Renew</button>
                )}
                {/* View Details button hidden */}
                <button className="card-button view-details-button">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
