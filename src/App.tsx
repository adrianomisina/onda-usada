/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AdDetails from "./pages/AdDetails";
import PostAd from "./pages/PostAd";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import ResetPassword from "./pages/ResetPassword";
import NotificationListener from "./components/NotificationListener";
import { AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans">
          <Navbar />
          <NotificationListener />
          <AuthModal />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ad/:id" element={<AdDetails />} />
              <Route path="/post-ad" element={<PostAd />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
