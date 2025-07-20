import React from "react";
import { Link } from "react-router-dom";

function SubliteLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#2bb6c4" />
      <path d="M14 28c0 2.5 2.5 4 6 4s6-1.5 6-4-2.5-3-6-3-6-1-6-4 2.5-4 6-4 6 1.5 6 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="2" fill="#fff"/>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <SubliteLogo />
          <span className="text-3xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-800 text-center">Welcome to Sublite</h1>
        <p className="text-gray-500 mb-8 text-center">
          Manage all your subscriptions in one place. Track, pay, and never miss a renewal again!
        </p>
        <div className="flex gap-4 mb-8">
          <Link
            to="/login"
            className="px-8 py-3 rounded-xl bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-bold text-lg shadow transition-all duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 rounded-xl bg-white border border-[#2bb6c4] text-[#2bb6c4] font-bold text-lg shadow hover:bg-[#e0f7fa] transition-all duration-200"
          >
            Sign Up
          </Link>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
          <div className="flex-1 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 shadow hover:scale-105 transition">
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">Track Subscriptions</h2>
            <p className="text-gray-600">View and manage all your active subscriptions in one dashboard.</p>
          </div>
          <div className="flex-1 bg-gradient-to-r from-sky-50 to-sky-100 rounded-xl p-6 shadow hover:scale-105 transition">
            <h2 className="text-xl font-semibold text-sky-700 mb-2">Easy Payments</h2>
            <p className="text-gray-600">Top up your wallet and pay for services securely and instantly.</p>
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
          <div className="flex-1 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 shadow hover:scale-105 transition">
            <h2 className="text-xl font-semibold text-pink-700 mb-2">Get Reminders</h2>
            <p className="text-gray-600">Never miss a renewal date with timely notifications and reminders.</p>
          </div>
          <div className="flex-1 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 shadow hover:scale-105 transition">
            <h2 className="text-xl font-semibold text-green-700 mb-2">Review & Support</h2>
            <p className="text-gray-600">Leave reviews and get support for any subscription-related issues.</p>
          </div>
        </div>
        <div className="mt-10 text-center text-gray-400 text-xs">
          &copy; {new Date().getFullYear()} Sublite. All rights reserved.
        </div>
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
        `}
      </style>
    </div>
  );
} 