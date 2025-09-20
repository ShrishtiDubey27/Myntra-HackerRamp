import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { WishlistContext } from "../context/WishlistContext";
import { Link } from "react-router-dom";

const ProductItem = ({
  id,
  image,
  images,
  name,
  price,
  enableVirtualTryOn = false,
}) => {
  const { currency, products } = useContext(ShopContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useContext(WishlistContext);
  const [activeModelId, setActiveModelId] = useState(
    sessionStorage.getItem("activeModelId")
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setActiveModelId(sessionStorage.getItem("activeModelId"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleWishlistClick = (e) => {
    e.preventDefault(); // Prevent navigation when clicking heart button
    e.stopPropagation();

    // Find the full product data
    const product = products.find((p) => p._id === id);
    if (!product) return;

    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(product);
    }
  };

  const getDisplayImage = () => {
    // Only apply virtual try-on logic if enableVirtualTryOn is true (Collection page)
    if (enableVirtualTryOn && images && activeModelId) {
      const modelImage = images.find((img) => img.id === activeModelId);
      if (modelImage) {
        return modelImage.url;
      }
    }

    // Always show product image for BestSeller and LatestCollection
    // Or when virtual try-on is not enabled
    if (images) {
      const productImage = images.find((img) => img.id === "product");
      if (productImage) {
        return productImage.url;
      }
      return images[0]?.url || "";
    }

    // Fallback to old image structure
    if (!image || !Array.isArray(image)) {
      console.warn("No valid image data for product:", name);
      return "";
    }

    return image[0];
  };

  return (
    <Link
      className="text-gray-700 cursor-pointer"
      to={`/product/${id}`}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <div className="overflow-hidden relative group">
        <img
          className="hover:scale-105 duration-300 hover:border-[10px] border-transparent hover:border-orange-600 w-full h-72 object-cover"
          src={getDisplayImage()}
          alt={name}
        />
        {/* Heart Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          {isInWishlist(id) ? (
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400 hover:text-red-500"
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
          )}
        </button>
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">
        {currency}
        {price}
      </p>
    </Link>
  );
};

export default ProductItem;
