import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-800 text-white py-8 text-center dark:bg-gray-900 dark:text-gray-300">
      <div className="container mx-auto px-4">
        <p className="text-sm mb-2">
          &copy; {currentYear} Sublite. All rights reserved.
        </p>
        <div className="mt-4 text-center text-gray-300 dark:text-gray-400">
          Contact us: <span className="text-[#2bb6c4] dark:text-[#5ed1dc]">Sublite123@gmail.com</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
