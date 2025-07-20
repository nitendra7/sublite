import React, { useEffect, useState } from "react";
import { useUser } from '../context/UserContext';
import { useNavigate } from "react-router-dom";

const API_BASE = "https://sublite-wmu2.onrender.com";

function formatCurrency(amount) {
  return `₹${amount.toLocaleString()}`;
}

export default function AvailablePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useUser() || {};
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/services`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          if (logout) logout();
          throw new Error('Authentication failed. Please log in again.');
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch plans: ${res.statusText}`);
        }

        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError(err.message || 'An unexpected error occurred.');
        setPlans([]);
      }
      setLoading(false);
    }
    fetchPlans();
  }, [logout]);

  const handleBookNow = (planId) => {
    navigate(`/subscription/${planId}`);
  };

  return (
    <div className="min-h-screen bg-[#f0faff] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#2bb6c4] mb-10 animate-slide-in-down">
          Available Plans
        </h1>

        {error ? (
          <div className="text-center text-red-500 text-lg mt-20">{error}</div>
        ) : loading ? (
          <div className="flex justify-center items-center h-60">
            <svg className="animate-spin h-10 w-10 text-[#2bb6c4]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#2bb6c4" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="#2bb6c4" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-20">No plans available right now.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <div
                key={plan._id}
                className={`bg-white rounded-2xl shadow-lg border border-[#2bb6c4]/30
                  p-6 flex flex-col gap-4
                  hover:scale-[1.02] hover:shadow-md transition-all duration-300
                  animate-fade-in
                  ${idx % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"}`}
                style={{ animationDelay: `${idx * 100 + 200}ms` }}
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-800">{plan.serviceName}</h2>
                  <span className="ml-auto px-3 py-1 text-xs font-semibold rounded-full bg-[#2bb6c4] text-white">
                    {plan.serviceType}
                  </span>
                </div>

                <p className="text-gray-600 text-sm">{plan.description}</p>

                <div className="flex flex-wrap gap-2">
                  {plan.features?.map((f, i) => (
                    <span key={i} className="bg-[#2bb6c4]/10 text-[#2bb6c4] px-2 py-0.5 rounded text-xs">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700">
                  <div>
                    <div className="text-xs text-gray-500">Rental Price</div>
                    <div className="font-bold">{formatCurrency(plan.rentalPrice)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-medium">{plan.rentalDuration} days</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Slots</div>
                    <div className="font-medium">
                      {plan.availableSlots - plan.currentUsers}/{plan.maxUsers}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className={`font-semibold ${plan.serviceStatus === "active" ? "text-green-500" : "text-red-500"}`}>
                      {plan.serviceStatus}
                    </div>
                  </div>
                </div>

                {plan.location && (
                  <div className="text-xs text-gray-500">
                    {plan.location.city}, {plan.location.state}, {plan.location.country}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    className="flex-1 py-2 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold transition-all"
                    onClick={() => handleBookNow(plan._id)}
                  >
                    Book Now
                  </button>
                  <button className="flex-1 py-2 rounded-xl bg-[#2bb6c4]/10 hover:bg-[#2bb6c4]/20 text-[#2bb6c4] font-semibold transition-all">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease both;
          }
          @keyframes slide-in-left {
            from { opacity: 0; transform: translateX(-30px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.6s ease-out both;
          }
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(30px);}
            to { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.6s ease-out both;
          }
          @keyframes slide-in-down {
            from { opacity: 0; transform: translateY(-20px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-slide-in-down {
            animation: slide-in-down 0.6s ease-out both;
          }
        `}
      </style>
    </div>
  );
}
