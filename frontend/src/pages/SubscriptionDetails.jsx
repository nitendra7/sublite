import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SubscriptionDetails() {
  const { state } = useLocation();
  const plan = state?.plan;
  const navigate = useNavigate();

  const [days, setDays] = useState(plan?.rentalDuration || 1);
  const [paymentDone, setPaymentDone] = useState(false);
  const [otp, setOtp] = useState("");

  const price = plan?.rentalPrice || 0;
  const total = days * price;

  if (!plan) {
    return <div className="text-center mt-10 text-red-600">No plan selected.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f0faff] px-4 py-10">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#2bb6c4] mb-4">{plan.serviceName}</h1>
        <p className="text-gray-600 mb-2">{plan.description}</p>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Select Duration (in days):</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            min={1}
            max={plan.rentalDuration}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>

        <div className="mb-4 text-gray-800 font-semibold">
          Total Amount: ₹{total.toLocaleString()}
        </div>

        {!paymentDone ? (
          <button
            onClick={() => setPaymentDone(true)}
            className="w-full bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold py-2 rounded"
          >
            Pay with Wallet
          </button>
        ) : (
          <>
            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-1">Enter OTP:</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              onClick={() => alert("OTP Verified and Subscription Confirmed!")}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
            >
              Confirm Subscription
            </button>
          </>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mt-6 w-full text-sm text-gray-500 underline"
        >
          ← Back to Plans
        </button>
      </div>
    </div>
  );
}
