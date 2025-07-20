import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your pages
import AuthPages from "./pages/auth_pages";
import SignupPage from "./pages/signup_page";
import ProfilePage from "./pages/ProfilePage";
import ReviewPage from "./pages/review_page";
import Subscriptions from "./pages/Subscriptions";
import WalletPage from "./pages/wallet_page"; // renamed

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPages />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reviews" element={<ReviewPage />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Routes>
    </Router>
  );
};

export default App;