import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 mt-auto shadow-lg">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logos/logo.png" alt="Sublite" className="w-8 h-8" />
              <span className="font-bold text-lg text-[#2bb6c4]">Sublite</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Premium subscription management made simple. Pay only for what you use.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Product</h3>
            <div className="space-y-2">
              <a href="#services" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors">Services</a>
              <a href="#pricing" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors">Pricing</a>
              <a href="#how-it-works" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors">How It Works</a>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Support</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors">Help Center</a>
              <a
                href="mailto:support@sublite.app?subject=Support Request"
                className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors"
              >
                Submit Support Ticket
              </a>
              <a
                href="mailto:sublite.app@gmail.com?subject=Support Request"
                className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Connect</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="block font-medium">Email:</span>
                <a
                  href="mailto:sublite.app@gmail.com"
                  className="text-[#2bb6c4] hover:text-[#1ea1b0] transition-colors"
                >
                  sublite.app@gmail.com
                </a>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="block font-medium">Support:</span>
                <span>24/7 Available</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} Sublite. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#2bb6c4] transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#2bb6c4] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
