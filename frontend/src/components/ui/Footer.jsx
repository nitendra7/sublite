const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-t from-gray-900 via-gray-800 to-gray-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white py-8 text-center border-t border-gray-300 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <p className="text-sm mb-2 text-gray-200 dark:text-gray-300">
          &copy; {currentYear} Sublite. All rights reserved.
        </p>
        <div className="mt-4 text-center text-gray-300 dark:text-gray-400">
          Contact us: <span className="text-[#2bb6c4] dark:text-[#5ed1dc] font-semibold">sublite.app@gmail.com</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
