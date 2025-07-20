import React, { useEffect, useState } from "react";

const API_BASE = "https://sublite-wmu2.onrender.com";

function formatCurrency(amount) {
  return `₹${amount.toLocaleString()}`;
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/services`);
        const data = await res.json();
        setPlans(data);
      } catch {
        setPlans([]); // Set to empty array on error
      }
      setLoading(false);
    }
    fetchPlans();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 py-10 px-4 relative overflow-hidden animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#2bb6c4] mb-10 drop-shadow animate-slide-in-down">
          Available Plans
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <svg className="animate-spin h-10 w-10 text-[#2bb6c4]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#2bb6c4" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="#2bb6c4" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center text-gray-300 text-lg mt-20">No plans available right now.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={plan._id}
                className={`
                  bg-gradient-to-br from-slate-800 via-gray-900 to-blue-900
                  rounded-3xl shadow-2xl p-7 flex flex-col gap-4
                  text-white border border-[#2bb6c4]/30
                  hover:scale-[1.03] hover:shadow-blue-900/40 transition-all duration-500
                  animate-fade-in
                  ${idx % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"}
                `}
                style={{ animationDelay: `${idx * 100 + 200}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl font-bold">{plan.serviceName}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2bb6c4] text-white ml-auto">
                    {plan.serviceType}
                  </span>
                </div>
                <div className="text-gray-300 text-sm mb-2">{plan.description}</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {plan.features && plan.features.map((f, i) => (
                    <span key={i} className="bg-[#2bb6c4]/20 text-[#2bb6c4] px-2 py-0.5 rounded text-xs">{f}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 items-center mb-2">
                  <div>
                    <span className="block text-xs text-gray-400">Rental Price</span>
                    <span className="text-lg font-bold">{formatCurrency(plan.rentalPrice)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Duration</span>
                    <span className="font-semibold">{plan.rentalDuration} days</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Slots</span>
                    <span className="font-semibold">{plan.availableSlots - plan.currentUsers}/{plan.maxUsers}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Status</span>
                    <span className={`font-semibold ${plan.serviceStatus === "active" ? "text-green-400" : "text-red-400"}`}>
                      {plan.serviceStatus}
                    </span>
                  </div>
                </div>
                {plan.location && (
                  <div className="text-xs text-gray-400 mb-2">
                    {plan.location.city}, {plan.location.state}, {plan.location.country}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold shadow transition-all duration-200">
                    Book Now
                  </button>
                  <button className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#2bb6c4] font-bold shadow transition-all duration-200">
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