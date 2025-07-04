import React, { useEffect, useState } from 'react';
import { API_BASE, apiFetch } from '../App';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    apiFetch(`${API_BASE}/api/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
        else setError(data.error || 'Failed to fetch categories');
      })
      .catch(() => setError('Failed to fetch categories'));
  }, []);
  if (error) return <div className="alert alert-danger">{error}</div>;
  return (
    <div>
      <h3>Categories</h3>
      <ul>
        {categories.map(c => <li key={c._id}>{c.name}</li>)}
      </ul>
    </div>
  );
} 