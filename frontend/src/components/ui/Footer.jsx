
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 mt-auto shadow-lg">
      <div className="container mx-auto px-4 py-2 md:py-8">
        <div className="grid grid-cols-3 gap-4 md:gap-8 px-2 sm:px-4 overflow-x-auto">

          {/* Navigation Links */}
          <div className="space-y-2 md:space-y-4">
            <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">Product</h3>
            <div className="space-y-1">
              <a href="#services" className="block text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors">Services</a>
              <a href="#pricing" className="block text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors">Pricing</a>
              <a href="#how-it-works" className="block text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors">How It Works</a>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-2 md:space-y-4">
            <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">Support</h3>
            <div className="space-y-1">
              <a href="#" className="block text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors">Help Center</a>
              <a
                href="mailto:support@sublite.app?subject=Support Request"
                className="block text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors"
              >
                Submit Support Ticket
              </a>
              <a
                href="mailto:sublite.app@gmail.com?subject=Support Request"
                className="block text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-[#2bb6c4] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 md:space-y-4">
            <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">Connect</h3>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                <span className="block font-medium">Email:</span>
                <a
                  href="mailto:sublite.app@gmail.com"
                  className="text-[#2bb6c4] hover:text-[#1ea1b0] transition-colors text-xs"
                >
                  sublite.app@gmail.com
                </a>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                <span className="block font-medium">Support:</span>
                <span>24/7 Available</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-4 pt-4 md:mt-8 md:pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              &copy; {currentYear} Sublite. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs">
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
