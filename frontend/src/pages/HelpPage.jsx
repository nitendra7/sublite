import React, { useState } from 'react';
import { HelpCircle, Clock, Shield, AlertCircle, CheckCircle, CreditCard, Bell, Wallet, Star } from 'lucide-react';
import RefundPolicyModal from '../components/ui/RefundPolicyModal';

const HelpPage = () => {
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);

  const helpSections = [
    {
      title: "Booking & Payments",
      icon: <CreditCard className="w-6 h-6" />,
      items: [
        {
          question: "How do I book a service?",
          answer: "Browse available plans, select a service, choose your rental duration, and confirm the booking. Payment is deducted from your wallet balance."
        },
        {
          question: "What payment methods are accepted?",
          answer: "We accept wallet payments and Razorpay for adding money to your wallet. All service bookings are paid through your wallet balance."
        },
        {
          question: "Can I cancel a booking?",
          answer: "Bookings are automatically cancelled if the provider doesn't respond within 15 minutes. You'll receive a full refund to your wallet."
        }
      ]
    },
    {
      title: "Refunds & Cancellations",
      icon: <Shield className="w-6 h-6" />,
      items: [
        {
          question: "When do I get refunded?",
          answer: "You receive an automatic refund if the service provider doesn't respond with access details within 15 minutes of your booking."
        },
        {
          question: "How long do refunds take?",
          answer: "Refunds are processed immediately and credited to your wallet balance within seconds. No manual action required."
        },
        {
          question: "Where can I see my refunds?",
          answer: "All refunds appear in your wallet transaction history. You'll also receive a notification when a refund is processed."
        }
      ]
    },
    {
      title: "Notifications & Communication",
      icon: <Bell className="w-6 h-6" />,
      items: [
        {
          question: "How do I know if my booking is confirmed?",
          answer: "You'll receive a notification when the provider sends access details. Check your notifications page for updates."
        },
        {
          question: "What notifications will I receive?",
          answer: "You'll get notifications for new bookings, access details received, booking cancellations, refunds, and payment confirmations."
        }
      ]
    },
    {
      title: "Wallet & Transactions",
      icon: <Wallet className="w-6 h-6" />,
      items: [
        {
          question: "How do I add money to my wallet?",
          answer: "Go to the Wallet page and use the 'Add Money' feature. You can add funds via Razorpay payment gateway."
        },
        {
          question: "Can I withdraw money from my wallet?",
          answer: "Currently, wallet funds can be used for service bookings. Withdrawal features may be added in future updates."
        },
        {
          question: "How do I check my transaction history?",
          answer: "Visit the Wallet page to see all your transactions including payments, refunds, and wallet top-ups."
        }
      ]
    },
    {
      title: "Reviews & Ratings",
      icon: <Star className="w-6 h-6" />,
      items: [
        {
          question: "When can I review a service?",
          answer: "You can review a service after your booking is completed. Visit the Reviews page to leave your feedback."
        },
        {
          question: "How do ratings work?",
          answer: "Ratings help other users choose reliable services. You can rate services from 1-5 stars and leave detailed comments."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-10 px-4 relative overflow-hidden animate-fade-in
                    bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100
                    dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Help Center</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about booking services, payments, refunds, and more.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowRefundPolicy(true)}
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <p className="font-medium text-blue-800 dark:text-blue-200">Refund Policy</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Learn about our refund process</p>
              </div>
            </button>
            <a
              href="/dashboard/wallet"
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <p className="font-medium text-green-800 dark:text-green-200">Wallet & Transactions</p>
                <p className="text-sm text-green-600 dark:text-green-400">Manage your wallet balance</p>
              </div>
            </a>
          </div>
        </div>

        {/* Help Sections */}
        <div className="space-y-8">
          {helpSections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-semibold flex items-center gap-3 text-gray-800 dark:text-gray-200">
                  <span className="text-[#2bb6c4] dark:text-[#5ed1dc]">{section.icon}</span>
                  {section.title}
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{item.question}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-[#2bb6c4] to-[#1ea1b0] rounded-2xl shadow-lg p-8 mt-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-lg mb-6 opacity-90">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-white text-[#2bb6c4] rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Contact Support
            </button>
            <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#2bb6c4] transition-colors">
              Send Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Refund Policy Modal */}
      <RefundPolicyModal 
        isOpen={showRefundPolicy} 
        onClose={() => setShowRefundPolicy(false)} 
      />

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.7s ease both; }
      `}</style>
    </div>
  );
};

export default HelpPage; 