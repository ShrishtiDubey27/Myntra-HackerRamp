// context/wishlistContext.jsx

import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { generateOutfitSuggestion } from "../utils/outfitAPI";

export const WishlistContext = createContext();

const WishlistContextProvider = (props) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to schedule notification with outfit suggestion
  const scheduleNotification = async (product) => {
    // Generate random time between 10 seconds and 1 minute (for testing)
    const minDelay = 10000; // 10 seconds
    const maxDelay = 60000; // 1 minute
    const randomDelay =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    console.log(
      `Scheduling notification for ${product.name} in ${
        randomDelay / 1000
      } seconds`
    );

    setTimeout(async () => {
      try {
        // Generate outfit suggestion using GenAI
        const suggestionResponse = await generateOutfitSuggestion(product);

        if (suggestionResponse.success) {
          // Get notification context from window (we'll add this to window in main.jsx)
          const addNotification = window.addNotification;

          if (addNotification) {
            addNotification({
              title: "🎨 Personal Stylist Ready!",
              message: `I see you added "${product.name}" to your wishlist! Here's a complete look I created for you:`,
              outfitSuggestion: suggestionResponse.outfitSuggestion,
              type: "outfit-suggestion",
              productName: product.name,
              detectedGender: suggestionResponse.detectedGender,
              genderSpecific: suggestionResponse.genderSpecific,
            });
          }
        }
      } catch (error) {
        console.error("Error generating outfit suggestion:", error);
        // Still send a basic notification even if AI fails
        const addNotification = window.addNotification;
        if (addNotification) {
          addNotification({
            title: "✨ New Wishlist Item!",
            message: `You added "${product.name}" to your wishlist! Check out our collection for styling inspiration.`,
            type: "wishlist-addition",
            productName: product.name,
          });
        }
      }
    }, randomDelay);
  };

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

    // Schedule notification with outfit suggestion
    scheduleNotification(product);
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
