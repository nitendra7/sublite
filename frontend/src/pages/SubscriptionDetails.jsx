import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function SubscriptionDetails() {
  const { state } = useLocation();
  const plan = state?.plan;
  const navigate = useNavigate();

  const [days, setDays] = useState(plan?.rentalDuration || 30);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");

  const price = plan?.rentalPrice || 0;
  const total = days * price;

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-xl text-red-600 font-semibold">No plan selected.</p>
          <Link to="/dashboard" className="text-blue-500 hover:underline mt-2 inline-block">
            ← Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    setBookingConfirmed(true);
  };

  const handlePayment = () => {
    setShowOtpInput(true);
  };

  const handleConfirm = () => {
    // Here you would verify OTP and finalize subscription
    alert("OTP Verified and Subscription Confirmed!");
    navigate('/dashboard/subscriptions'); // Redirect to subscriptions page after success
  };

  return (
    <div className="min-h-screen bg-[#f0faff] px-4 py-10 flex items-center justify-center animate-fade-in">
      <div className="max-w-xl w-full mx-auto bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-[#2bb6c4] mb-2">{plan.serviceName}</h1>
        <p className="text-gray-500 mb-6 border-b pb-4">{plan.description}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Select Duration (in days):</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#2bb6c4] outline-none transition"
              min={1}
              max={plan.rentalDuration}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              disabled={bookingConfirmed} // Disable after booking
            />
          </div>

          <div className="text-2xl font-bold text-gray-800">
            Total Amount: <span className="text-[#2bb6c4]">₹{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-8">
          {!bookingConfirmed ? (
            <button onClick={handleBooking} className="w-full bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold py-3 rounded-lg shadow-lg transition">
              Book Plan
            </button>
          ) : !showOtpInput ? (
            <div>
              <p className="text-center text-green-600 font-semibold mb-4">Plan booked! Proceed to payment.</p>
              <button onClick={handlePayment} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition">
                Pay with Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Enter OTP sent to your device:</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" />
              </div>
              <button onClick={handleConfirm} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition">
                Confirm Subscription
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 w-full text-sm text-gray-500 hover:underline"
        >
          ← Back to Plans
        </button>
      </div>
    </div>
  );
}
