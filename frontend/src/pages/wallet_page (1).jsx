import React, { useState } from "react";
import { BadgeIndianRupee, Clock } from "lucide-react";

const initialTransactions = [
  { id: 1, type: "Top-Up", amount: 100, date: "2025-07-10" },
  { id: 2, type: "Booking", amount: -59, date: "2025-07-11" },
  { id: 3, type: "Top-Up", amount: 200, date: "2025-07-12" },
];

export default function WalletPage() {
  const [balance, setBalance] = useState(241);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [transactions, setTransactions] = useState(initialTransactions);

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (!isNaN(amount) && amount > 0) {
      setBalance(balance + amount);
      setTransactions([
        { id: Date.now(), type: "Top-Up", amount, date: new Date().toISOString().slice(0, 10) },
        ...transactions,
      ]);
      setTopUpAmount("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 py-10 px-4 relative overflow-hidden animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-sky-700 flex items-center gap-2 drop-shadow animate-slide-in-down">
          <BadgeIndianRupee className="w-7 h-7" /> Wallet
        </h1>

        {/* Balance Section */}
        <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 transition-transform duration-500 hover:scale-105 animate-fade-in">
          <h2 className="text-xl font-semibold text-sky-700 mb-2">Current Balance</h2>
          <p className="text-3xl font-bold text-sky-900 tracking-wide">₹{balance}</p>
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
          {transactions.length > 0 ? (
            <ul className="space-y-3">
              {transactions.map((tx, idx) => (
                <li
                  key={tx.id}
                  className={`
                    flex justify-between items-center bg-gradient-to-r
                    ${tx.amount > 0
                      ? "from-green-50 to-green-100"
                      : "from-red-50 to-red-100"}
                    rounded-lg px-4 py-3 shadow-sm
                    transition-all duration-500
                    hover:scale-105
                    ${idx % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"}
                  `}
                  style={{ animationDelay: `${idx * 100 + 200}ms` }}
                >
                  <div>
                    <p className="text-sky-900 font-medium">{tx.type}</p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
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
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.7s ease both;
          }
          @keyframes slide-in-left {
            from { opacity: 0; transform: translateX(-40px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(40px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes slide-in-down {
            from { opacity: 0; transform: translateY(-40px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-slide-in-down {
            animation: slide-in-down 0.7s cubic-bezier(.4,0,.2,1) both;
          }
        `}
      </style>
    </div>
  );
}