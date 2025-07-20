import React, { useState, useEffect } from "react";
import { BadgeIndianRupee, Clock } from "lucide-react";
import { useUser } from '../context/UserContext';

const API_BASE = "https://sublite-wmu2.onrender.com";

export default function WalletPage() {
  // Get user data, token, and refetch function from the global context
  const { user, token, fetchUserProfile, loading: userContextLoading, error: userContextError } = useUser();

  // The user's balance is now derived directly from the user object in the context
  const balance = user?.walletBalance || 0;

  // State for managing transactions, loading, and errors specific to this page
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("");

  // Reusable function to fetch the user's transaction history
  const fetchTransactions = async () => {
    if (!token) {
        setLoading(false);
        setError("Not authenticated.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallet-transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch transactions (Status: ${res.status})`);
      }
      const data = await res.json();
      setTransactions(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); // Show newest first
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions when the component mounts or when the token becomes available
  useEffect(() => {
    if (!userContextLoading) { // Only fetch when the user context is ready
        fetchTransactions();
    }
  }, [token, userContextLoading]);

  // Handler for the "Add Money" button
  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0 || !token) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/wallet-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // The body structure is based on your `walletTransaction.js` model
        body: JSON.stringify({ amount: amount, type: 'credit', description: 'Wallet Top-Up' })
      });

      if (res.ok) {
        setTopUpAmount(""); // Clear the input field
        await fetchUserProfile(); // Refresh user data to get the new walletBalance
        await fetchTransactions(); // Refresh the transaction list
      } else {
        const errorData = await res.json();
        alert(`Top-up failed: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      alert(`An error occurred during top-up: ${err.message}`);
    }
  };

  // Show a loading state if the main user context is still loading
  if (userContextLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl font-semibold text-[#2bb6c4]">Loading Wallet...</div>
        </div>
    );
  }

  // Show an error if the user context failed to load (e.g., not logged in)
  if (userContextError) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <div className="text-xl font-semibold text-red-500">{userContextError}</div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 py-10 px-4 relative overflow-hidden animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-sky-700 flex items-center gap-2 drop-shadow animate-slide-in-down">
          <BadgeIndianRupee className="w-7 h-7" /> Wallet
        </h1>

        {/* Balance Section */}
        <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 transition-transform duration-500 hover:scale-105 animate-fade-in">
          <h2 className="text-xl font-semibold text-sky-700 mb-2">Current Balance</h2>
          <p className="text-3xl font-bold text-sky-900 tracking-wide">₹{balance.toFixed(2)}</p>
        </div>

        {/* Top-Up Section */}
        <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 transition-transform duration-500 hover:scale-105 animate-fade-in">
          <h2 className="text-xl font-semibold text-sky-700 mb-2">Top-Up Wallet</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="number"
              placeholder="Enter amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="w-40 rounded border border-sky-300 p-2 focus:ring-2 focus:ring-sky-400 transition"
            />
            <button
              onClick={handleTopUp}
              className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white px-6 py-2 rounded shadow transition-all duration-300 font-semibold"
            >
              Add Money
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white/90 rounded-xl shadow-lg p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-sky-700 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Transaction History
          </h2>
          {loading ? (
            <p>Loading transactions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : transactions.length > 0 ? (
            <ul className="space-y-3">
              {transactions.map((tx, idx) => (
                <li
                  key={tx._id} // Use the database ID for the key
                  className={`
                    flex justify-between items-center bg-gradient-to-r
                    ${tx.type === 'credit'
                      ? "from-green-50 to-green-100"
                      : "from-red-50 to-red-100"}
                    rounded-lg px-4 py-3 shadow-sm transition-all duration-500 hover:scale-105
                    ${idx % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"}
                  `}
                  style={{ animationDelay: `${idx * 100 + 200}ms` }}
                >
                  <div>
                    <p className="text-sky-900 font-medium">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      tx.type === 'credit' ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === 'credit' ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No transactions found.</p>
          )}
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.7s ease both; }
          @keyframes slide-in-left { from { opacity: 0; transform: translateX(-40px);} to { opacity: 1; transform: translateX(0);} }
          .animate-slide-in-left { animation: slide-in-left 0.7s cubic-bezier(.4,0,.2,1) both; }
          @keyframes slide-in-right { from { opacity: 0; transform: translateX(40px);} to { opacity: 1; transform: translateX(0);} }
          .animate-slide-in-right { animation: slide-in-right 0.7s cubic-bezier(.4,0,.2,1) both; }
          @keyframes slide-in-down { from { opacity: 0; transform: translateY(-40px);} to { opacity: 1; transform: translateY(0);} }
          .animate-slide-in-down { animation: slide-in-down 0.7s cubic-bezier(.4,0,.2,1) both; }
        `}
      </style>
    </div>
  );
}