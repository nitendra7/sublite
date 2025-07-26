import React from 'react';
import { X, Clock, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const RefundPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Refund Policy</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Your Money is Protected</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  We ensure you get your money back if services aren't delivered as promised. All refunds are processed automatically.
                </p>
              </div>
            </div>
          </div>

          {/* When Refunds Happen */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              When You Get Refunded
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">Provider Timeout (15 minutes)</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    If the service provider doesn't respond with access details within 15 minutes of your booking, 
                    your booking is automatically cancelled and you receive a full refund.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Process */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              How Refunds Work
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 dark:text-green-400 text-sm font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Automatic Processing</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Refunds are processed automatically when conditions are met. No manual action required.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 dark:text-green-400 text-sm font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Instant Credit</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Money is immediately credited back to your wallet balance within seconds.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 dark:text-green-400 text-sm font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Notification</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You'll receive a notification confirming your refund has been processed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 dark:text-green-400 text-sm font-semibold">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Transaction Record</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All refunds appear in your transaction history for complete transparency.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Important Notes</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span>Refunds are only processed for bookings that haven't received access details.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span>Once you receive access details, the booking is considered active and no refunds are given.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span>Refunded amounts can be used for future bookings or withdrawn from your wallet.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span>If you experience technical issues, contact our support team for assistance.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#2bb6c4] text-white rounded-lg hover:bg-[#1ea1b0] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyModal; 