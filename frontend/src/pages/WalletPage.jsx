import { useState, useEffect, useCallback } from "react";
import { BadgeIndianRupee, Clock, Plus, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { useUser } from '../context/UserContext';
import Loading from '../components/ui/Loading';
import RefundPolicyModal from '../components/ui/RefundPolicyModal';

import api from '../utils/api';

export default function WalletPage() {
  const { user, token, fetchUserProfile, loading: userContextLoading, error: userContextError } = useUser();
  const balance = user?.walletBalance || 0;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Not authenticated.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/wallettransactions`);
      const data = res.data;
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
      const orderRes = await api.post(`/payments/create-order`, { amount });
      const orderData = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_here',
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SubLite Wallet Top-Up",
        description: "Add money to your wallet",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            try {
              await api.post(`/payments/verify`, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              await fetchUserProfile();
              await fetchTransactions();
              setTopUpAmount("");
              alert("Payment successful! Your wallet has been topped up.");
            } catch {
              throw new Error("Payment verification failed.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2bb6c4"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'debit':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      default:
        return <BadgeIndianRupee className="w-5 h-5 text-gray-500" />;
    }
  };

  if (userContextLoading) {
    return <Loading message="Loading wallet..." />;
  }

  if (userContextError) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-500 dark:text-red-400">
          <p>Error: {userContextError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-full animate-fade-in bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          My Wallet
        </h1>
        <p className="text-gray-500 dark:text-gray-300">
          Manage your wallet balance and view transaction history.
        </p>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Current Balance
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Available funds in your wallet
            </p>
          </div>
          <div className="w-16 h-16 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-2xl flex items-center justify-center">
            <BadgeIndianRupee className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <p className="text-4xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc] mb-2">
            ₹{balance.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Indian Rupees
          </p>
        </div>

        {/* Top Up Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Add Money to Wallet
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Enter amount (₹)"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2bb6c4] focus:border-transparent outline-none transition-all duration-200"
                min="1"
                step="0.01"
              />
            </div>
            <button
              onClick={handleTopUp}
              disabled={paymentProcessing || !topUpAmount || parseFloat(topUpAmount) <= 0}
              className="px-8 py-3 bg-[#2bb6c4] text-white rounded-xl font-semibold hover:bg-[#1ea1b0] dark:bg-[#1ea1b0] dark:hover:bg-[#2bb6c4] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Money
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <BadgeIndianRupee className="w-4 h-4" />
            <span>Secure payment powered by Razorpay</span>
            <button
              onClick={() => setShowRefundPolicy(true)}
              className="text-[#2bb6c4] dark:text-[#5ed1dc] hover:underline"
            >
              View refund policy
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Transaction History
          </h2>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        
        {loading ? (
          <Loading message="Loading transactions..." />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx, idx) => (
              <div
                key={tx._id}
                className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md animate-fade-in ${
                  tx.type === 'credit'
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {tx.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    tx.type === 'credit' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {tx.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BadgeIndianRupee className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your transaction history will appear here once you make your first transaction.
            </p>
          </div>
        )}
      </div>

      {/* Refund Policy Modal */}
      <RefundPolicyModal
        isOpen={showRefundPolicy}
        onClose={() => setShowRefundPolicy(false)}
      />
    </div>
  );
}
