import React, { useState, useEffect, useCallback } from "react";
import { BadgeIndianRupee, Clock } from "lucide-react";
import { useUser } from '../context/UserContext';

// Your backend API base URL
const API_BASE = "https://sublite-wmu2.onrender.com";

export default function WalletPage() {
  const { user, token, fetchUserProfile, loading: userContextLoading, error: userContextError } = useUser();
  const balance = user?.walletBalance || 0;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Not authenticated.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallettransactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch transactions (Status: ${res.status})`);
      }
      const data = await res.json();
      setTransactions(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!userContextLoading) {
      fetchTransactions();
    }
  }, [fetchTransactions, userContextLoading]);

  const handleTopUp = async () => {
    // =================================================================
    // == DEBUGGING LINE ADDED HERE                                  ==
    // =================================================================
    console.log("Attempting to use Razorpay Key ID:", process.env.REACT_APP_RAZORPAY_KEY_ID);

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!token) {
      alert("You must be logged in to add money.");
      return;
    }

    setPaymentProcessing(true);

    try {
      const orderRes = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: amount })
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create payment order.");
      }

      const orderData = await orderRes.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SubLite Wallet Top-Up",
        description: "Add money to your wallet",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verificationRes = await fetch(`${API_BASE}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verificationData = await verificationRes.json();

            if (verificationRes.ok) {
              alert(verificationData.message);
              await fetchUserProfile();
              await fetchTransactions();
              setTopUpAmount("");
            } else {
              throw new Error(verificationData.message || "Payment verification failed.");
            }
          } catch (err) {
            alert(`An error occurred during payment verification: ${err.message}`);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phoneNumber || ""
        },
        theme: {
          color: "#2bb6c4"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });

    } catch (err) {
      alert(`An error occurred: ${err.message}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (userContextLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className="text-xl font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">Loading Wallet...</div>
        </div>
    );
  }

  if (userContextError) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              <div className="text-xl font-semibold text-red-500 dark:text-red-400">{userContextError}</div>
          </div>
      );
  }

  return (
    <div className="min-h-screen py-10 px-4 relative overflow-hidden animate-fade-in
                    bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100
                    dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 drop-shadow animate-slide-in-down
                       text-gray-800 dark:text-gray-100">
          <BadgeIndianRupee className="w-7 h-7 text-[#2bb6c4] dark:text-[#5ed1dc]" /> Wallet
        </h1>

        <div className="rounded-xl shadow-lg p-6 mb-8 transition-transform duration-500 hover:scale-105 animate-fade-in
                        bg-white dark:bg-gray-800 dark:border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Current Balance</h2>
          <p className="text-3xl font-bold tracking-wide text-[#2bb6c4] dark:text-[#5ed1dc]">₹{balance.toFixed(2)}</p>
        </div>

        <div className="rounded-xl shadow-lg p-6 mb-8 transition-transform duration-500 hover:scale-105 animate-fade-in
                        bg-white dark:bg-gray-800 dark:border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Top-Up Wallet</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="number"
              placeholder="Enter amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="w-40 rounded border p-2 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition-colors
                         border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              onClick={handleTopUp}
              disabled={paymentProcessing}
              className="bg-[#2bb6c4] text-white px-6 py-2 rounded shadow transition-all duration-300 font-semibold
                         hover:bg-[#1ea1b0] dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4]
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {paymentProcessing ? "Processing..." : "Add Money"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in
                        dark:border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" /> Transaction History
          </h2>
          {loading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading transactions...</p>
          ) : error ? (
            <p className="text-red-500 dark:text-red-400">{error}</p>
          ) : transactions.length > 0 ? (
            <ul className="space-y-3">
              {transactions.map((tx, idx) => (
                <li
                  key={tx._id}
                  className={`
                    flex justify-between items-center rounded-lg px-4 py-3 shadow-sm transition-all duration-500 hover:scale-105
                    ${tx.type === 'credit'
                      ? "bg-green-100 dark:bg-green-800/40 text-green-800 dark:text-green-200"
                      : "bg-red-100 dark:bg-red-800/40 text-red-800 dark:text-red-200"}
                    ${idx % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"}
                  `}
                  style={{ animationDelay: `${idx * 100 + 200}ms` }}
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{tx.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      tx.type === 'credit' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {tx.type === 'credit' ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">No transactions found.</p>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.7s ease both; }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-40px);} to { opacity: 1; transform: translateX(0);} }
        .animate-slide-in-left { animation: slide-in-left 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(40px);} to { opacity: 1; transform: translateX(0);} }
        .animate-slide-in-right { animation: slide-in-right 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes slide-in-down { from { opacity: 0; transform: translateY(-40px);} to { opacity: 1; transform: translateY(0);} }
        .animate-slide-in-down { animation: slide-in-down 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
}
