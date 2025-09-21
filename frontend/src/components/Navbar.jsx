import React, { useContext, useState } from "react";
import { assets } from "../assets/frontend_assets/assets";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { WishlistContext } from "../context/WishlistContext";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    backendUrl,
  } = useContext(ShopContext);
  const { getWishlistCount } = useContext(WishlistContext);

  // Check if current page is collection page
  const isCollectionPage = location.pathname === "/collection";

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  const handleChatClick = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    // Navigate directly to chat page
    navigate("/chat");
  };

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to={"/"}>
        <img src={assets.logo} className="w-36" alt="" />
      </Link>
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700 ">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4  border-none h-[1.5px] bg-orange-500 hidden"></hr>
        </NavLink>

        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4  border-none h-[1.5px] bg-orange-500 hidden"></hr>
        </NavLink>

        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4  border-none h-[1.5px] bg-orange-500 hidden"></hr>
        </NavLink>

        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>OUR GOAL</p>
          <hr className="w-2/4  border-none h-[1.5px] bg-orange-500 hidden"></hr>
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <img
            onClick={handleChatClick}
            src={assets.chat_icon}
            className="w-5 cursor-pointer hover:scale-110 transition-transform"
            alt="TrendTalks - Direct Messages"
            title="TrendTalks - Direct Messages"
          />
          <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            TrendTalks
          </div>
        </div>

        {isCollectionPage && (
          <img
            onClick={() => setShowSearch(true)}
            src={assets.search_icon}
            className="w-5 cursor-pointer"
            alt=""
          />
        )}

        {/* Notification Dropdown */}
        <NotificationDropdown />

        <Link to="/wishlist" className="relative">
          <svg
            className="w-6 h-6 cursor-pointer text-gray-700 hover:text-red-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {getWishlistCount() > 0 && (
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-red-500 text-white aspect-square rounded-full text-[8px]">
              {getWishlistCount()}
            </p>
          )}
        </Link>

        <div className="group relative">
          <img
            onClick={() => (token ? null : navigate("/login"))}
            src={assets.profile_icon}
            className="w-5 cursor-pointer"
            alt=""
          />
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded shadow-lg border border-gray-200">
                {/* <p className='cursor-pointer hover:text-black'>My Profile</p> */}
                <p
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer hover:text-black"
                >
                  Orders
                </p>
                <p onClick={logout} className="cursor-pointer hover:text-black">
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>

        <Link to="/cart" className="relative">
          <img
            src={assets.cart_icon}
            className="w-5  min-w-5 cursor-pointer"
            alt=""
          />
          <p className="absolute right-[-5px] bottom-[-5px]  w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        <img
          onClick={() => {
            setVisible(true);
          }}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt=""
        />
      </div>

      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3"
          >
            <img
              src={assets.dropdown_icon}
              className="h-4 rotate-180 cursor-pointer"
              alt=""
            />
            <p className="cursor-pointer">Back</p>
          </div>

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/about"
          >
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/contact"
          >
            OUR GOAL
          </NavLink>
          <div
            onClick={() => {
              handleChatClick();
              setVisible(false);
            }}
            className="py-2 pl-6 border cursor-pointer hover:bg-gray-50"
          >
            TRENDTALKS
          </div>
        </div>
      </div>

      {/* Chat Profile Setup Modal - No longer needed */}
    </div>
  );
};

export default Navbar;
