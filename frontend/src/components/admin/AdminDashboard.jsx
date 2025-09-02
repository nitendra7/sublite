import React, { useEffect, useState } from "react";
import apiFetch, { API_BASE } from "../../utils/api";
import SectionHeader from "./SectionHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    bookingsCount: 0,
    revenueTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Placeholder for future enhancement:
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`${API_BASE}/api/admin/stats`);
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Future: fetchRecentUsers(), fetchRecentBookings()
  }, []);

  return (
    <div className="p-6">
      <SectionHeader title="Admin Dashboard" />
      {loading ? (
        <div>Loading dashboard...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-700 text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stats.usersCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-700 text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stats.bookingsCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-700 text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{`₹${stats.revenueTotal}`}</div>
              </CardContent>
            </Card>
          </div>

          {/* Placeholders for future: Recent Users & Bookings */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg mb-2">Recent Users</h3>
              <PlaceholderList type="user" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Recent Bookings</h3>
              <PlaceholderList type="booking" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};


// Placeholder for future actual lists
function PlaceholderList({ type }) {
  return (
    <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
      {`No recent ${type}s loaded yet.`}
    </div>
  );
}

export default AdminDashboard;