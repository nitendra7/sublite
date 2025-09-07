import { useState, useEffect, useCallback } from "react";
import {
  BadgeIndianRupee,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  X,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import Loading from "../components/ui/Loading";
import RefundPolicyModal from "../components/ui/RefundPolicyModal";

import api from "../utils/api";

export default function WalletPage() {
  const {
    user,
    token,
    fetchUserProfile,
    loading: userContextLoading,
    error: userContextError,
  } = useUser();
  const balance = user?.walletBalance || 0;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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
      setTransactions(
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
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
    setShowAddMoneyModal(false);

    try {
      const orderRes = await api.post(`/payments/create-order`, { amount });
      const orderData = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key_here",
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
          color: "#2bb6c4",
        },
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "all") return true;
    return tx.type === activeTab;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case "debit":
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
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
      <div className="bg-[#1e2633] rounded-3xl shadow-sm p-6 mb-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-white">Wallet Balance</h2>
          </div>
        </div>

        <p className="text-5xl font-bold text-[#5ed1dc] mb-8">
          ₹{balance.toFixed(2)}
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setShowAddMoneyModal(true)}
            className="flex items-center justify-center gap-2 bg-[#2bb6c4] text-white py-3 px-6 rounded-full font-medium flex-1 hover:bg-[#1ea1b0]"
          >
            <BadgeIndianRupee className="w-5 h-5" />
            Add Money
          </button>

          <button className="flex items-center justify-center gap-2 bg-[#2a3343] text-white py-3 px-6 rounded-full font-medium flex-1 hover:bg-[#343e52]">
            <ArrowUpRight className="w-5 h-5" />
            Cash Out
          </button>
        </div>

        <div className="mt-4 text-xs text-center text-gray-400">
          Secure payment powered by Razorpay •
          <button
            onClick={() => setShowRefundPolicy(true)}
            className="text-[#5ed1dc] hover:underline ml-1"
          >
            View refund policy
          </button>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e2633] rounded-3xl p-6 border border-gray-700 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-medium text-white">Add Money</h3>
              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="bg-[#2a3343] rounded-full p-2 hover:bg-[#343e52]"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[10, 25, 50, 75, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className="bg-[#2a3343] py-3 px-4 rounded-full text-[#5ed1dc] font-medium hover:bg-[#343e52] transition-colors"
                >
                  ₹{amount}
                </button>
              ))}
              <button className="bg-[#2a3343] py-3 px-4 rounded-full text-[#5ed1dc] font-medium hover:bg-[#343e52] transition-colors">
                ...
              </button>
            </div>

            <div className="mb-4 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5ed1dc] text-lg font-medium">
                ₹
              </span>
              <input
                type="number"
                placeholder="Enter amount"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full pl-8 px-4 py-4 rounded-2xl border border-gray-700 bg-[#2a3343] focus:outline-none focus:border-[#2bb6c4] text-lg text-white"
                min="1"
                step="0.01"
              />
            </div>

            <button
              onClick={() => {
                handleTopUp();
                setShowAddMoneyModal(false);
              }}
              disabled={
                paymentProcessing ||
                !topUpAmount ||
                parseFloat(topUpAmount) <= 0
              }
              className="w-full flex items-center justify-center gap-2 bg-[#2bb6c4] text-white py-5 px-6 rounded-full font-medium text-lg hover:bg-[#1ea1b0]"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <BadgeIndianRupee className="w-5 h-5" />
                  Add Money
                </>
              )}
            </button>

            <div className="mt-4 text-sm text-center text-gray-400">
              Secure payment powered by Razorpay •
              <button
                onClick={() => {
                  setShowAddMoneyModal(false);
                  setShowRefundPolicy(true);
                }}
                className="text-[#5ed1dc] hover:underline ml-1"
              >
                View refund policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-[#1e2633] rounded-3xl shadow-sm p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white">
              Transaction History
            </h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          {/* Transaction filter tabs */}
          <div className="flex bg-[#2a3343] rounded-full p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === "all"
                  ? "bg-[#1e2633] text-[#5ed1dc] shadow-sm"
                  : "text-gray-300 hover:text-[#5ed1dc]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("credit")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === "credit"
                  ? "bg-[#1e2633] text-[#5ed1dc] shadow-sm"
                  : "text-gray-300 hover:text-[#5ed1dc]"
              }`}
            >
              Credits
            </button>
            <button
              onClick={() => setActiveTab("debit")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === "debit"
                  ? "bg-[#1e2633] text-red-400 shadow-sm"
                  : "text-gray-300 hover:text-[#5ed1dc]"
              }`}
            >
              Debits
            </button>
          </div>
        </div>

        {loading ? (
          <Loading message="Loading transactions..." />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((tx, idx) => (
              <div
                key={tx._id}
                className={`flex items-center justify-between p-4 rounded-2xl border border-gray-700 transition-all duration-300 hover:shadow-sm animate-fade-in ${
                  tx.type === "credit" ? "bg-[#2a3343]" : "bg-[#2d2a33]"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#1a202c] rounded-full flex items-center justify-center shadow-sm">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{tx.description}</p>
                    <p className="text-sm text-gray-400">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-lg ${
                      tx.type === "credit" ? "text-[#5ed1dc]" : "text-red-400"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{tx.type}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#2a3343] rounded-full flex items-center justify-center mx-auto mb-4">
              <BadgeIndianRupee className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {activeTab === "all"
                ? "No transactions yet"
                : activeTab === "credit"
                  ? "No credits yet"
                  : "No debits yet"}
            </h3>
            <p className="text-gray-400">
              {activeTab === "all"
                ? "Your transaction history will appear here once you make your first transaction."
                : `Your ${activeTab} history will appear here once you have ${activeTab === "credit" ? "received funds" : "spent funds"}.`}
            </p>
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="mt-4 px-6 py-2 bg-[#2a3343] text-[#5ed1dc] rounded-full hover:bg-[#343e52] transition-colors"
              >
                Show All Transactions
              </button>
            )}
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
