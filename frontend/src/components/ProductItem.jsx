import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({
  id,
  image,
  images,
  name,
  price,
  enableVirtualTryOn = false,
}) => {
  const { currency } = useContext(ShopContext);
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
      <div className="overflow-hidden">
        <img
          className="hover:scale-105 duration-300 hover:border-[10px] border-transparent hover:border-orange-600"
          src={getDisplayImage()}
          alt={name}
        />
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
