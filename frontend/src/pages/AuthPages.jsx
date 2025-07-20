import React, { useState } from "react";

export default function AuthPage({ isLogin = true, onSubmit = () => {} }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!isLogin && !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!isLogin && formData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-blue-100 dark:border-gray-700"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-[#00B7C2] dark:text-[#00B7C2]">
          {isLogin ? "Login to Sublite" : "Create your Sublite Account"}
        </h2>

        {!isLogin && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B7C2]"
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B7C2]"
            required
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B7C2]"
            required
          />
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="showPassword"
              className="mr-2"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword" className="text-sm text-gray-600 dark:text-gray-300">
              Show Password
            </label>
          </div>
        </div>

        {isLogin && (
          <div className="flex justify-between items-center mb-4">
            <a href="#" className="text-sm text-[#00B7C2] hover:underline">
              Forgot Password?
            </a>
            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
              New user? Sign up
            </a>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#00B7C2] hover:bg-[#009fa9] text-white py-2 rounded-xl font-semibold shadow-lg transition duration-300"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

// Example usage for testing:
// import AuthPage from './AuthPage';
// <AuthPage isLogin={true} onSubmit={(data) => console.log("Login", data)} />
// <AuthPage isLogin={false} onSubmit={(data) => console.log("Signup", data)} />
