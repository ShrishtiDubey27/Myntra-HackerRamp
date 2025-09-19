import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const WishlistContext = createContext();

const WishlistContextProvider = (props) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        setWishlistItems(parsedWishlist);
      } catch (error) {
        console.error("Error loading wishlist from localStorage:", error);
        setWishlistItems([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    const isAlreadyInWishlist = wishlistItems.some(
      (item) => item._id === product._id
    );

    if (isAlreadyInWishlist) {
      toast.info("Item is already in wishlist");
      return;
    }

    setWishlistItems((prev) => [...prev, product]);
    toast.success("Added to wishlist");
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    toast.success("Removed from wishlist");
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
    toast.success("Wishlist cleared");
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {props.children}
    </WishlistContext.Provider>
  );
};

export default WishlistContextProvider;