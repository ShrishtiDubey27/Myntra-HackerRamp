import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Verify from "./pages/Verify";
import ChatRoom from "./pages/ChatPage";
import Wishlist from "./pages/Wishlist";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import { ToastContainer } from "react-toastify";
import ChatAI from "./pages/ChatAI";
import { NotificationProvider } from "./context/NotificationContext";
import { useGlobalNotification } from "./hooks/useGlobalNotification";

import "react-toastify/dist/ReactToastify.css";

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);

    // Reset virtual try-on state when navigating away from Collection or Wishlist page
    if (pathname !== "/collection" && pathname !== "/wishlist") {
      sessionStorage.removeItem("activeModelId");
      // Trigger storage event to update all ProductItem components
      window.dispatchEvent(new Event("storage"));
    }
  }, [pathname]);
  return null;
};

// Component to initialize global notification hook
const NotificationInitializer = () => {
  useGlobalNotification();
  return null;
};

const App = () => {
  return (
    <NotificationProvider>
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer />
        <NotificationInitializer />
        <Navbar />
        <SearchBar />
        <ScrollToTop /> {/* ensures scroll top on route change */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/chat" element={<ChatRoom />} />
          <Route path="/chatAI" element={<ChatAI />} />
        </Routes>
        <Footer />
      </div>
    </NotificationProvider>
  );
};

export default App;
