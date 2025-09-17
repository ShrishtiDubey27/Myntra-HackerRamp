import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { assets } from "../assets/frontend_assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { toast } from "react-toastify";

const Wishlist = () => {
  const { wishlistItems, clearWishlist } = useContext(WishlistContext);
  const location = useLocation();

  // Check if user came from Virtual Try-On feature
  const fromVirtualTryOn =
    new URLSearchParams(location.search).get("from") === "virtual-tryon";

  // Virtual Try-On states (moved from Collection.jsx)
  const [tryOnMode, setTryOnMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [activatedTryOn, setActivatedTryOn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset virtual try-on state on component mount
  useEffect(() => {
    sessionStorage.removeItem("activeModelId");
    setTryOnMode(false);
    setUploadedImage(null);
    setActivatedTryOn(false);

    return () => {
      sessionStorage.removeItem("activeModelId");
    };
  }, []);

  // Upload image
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name.split(".")[0].toLowerCase();

      setUploadedImage({
        url: URL.createObjectURL(file),
        modelId: fileName,
        isValidModel: fileName.match(/^model[1-5]$/),
      });
      setActivatedTryOn(false);
    }
  };

  const handleEnterTryOn = () => {
    if (!uploadedImage) return;

    const modelId = uploadedImage.modelId;
    const isValidModel = uploadedImage.isValidModel;

    setUploadedImage(null);
    setLoading(true);

    if (!isValidModel) {
      setTimeout(() => {
        setLoading(false);
        toast.error("Error Loading. Please try again later.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 2000);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setActivatedTryOn(true);
      sessionStorage.setItem("activeModelId", modelId);
      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);
    }, 2000);
  };

  const resetTryOnMode = () => {
    setTryOnMode(false);
    setUploadedImage(null);
    setActivatedTryOn(false);
    sessionStorage.removeItem("activeModelId");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="pt-4 pb-8">
      <div className="flex justify-between items-center mb-6">
        <Title text1={"MY"} text2={"WISHLIST"} />
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">{fromVirtualTryOn ? "👗" : "💔"}</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            {fromVirtualTryOn
              ? "Virtual Try-On Awaits!"
              : "Your Wishlist is Empty"}
          </h2>
          <p className="text-gray-500 mb-6">
            {fromVirtualTryOn
              ? "To use Virtual Try-On, add some items to your wishlist first! Browse our collection and click the heart icon on products you'd like to try on."
              : "Add items to your wishlist by clicking the heart icon on products you love!"}
          </p>
          <a
            href="/collection"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300"
          >
            {fromVirtualTryOn
              ? "Browse & Add to Wishlist"
              : "Browse Collections"}
          </a>
        </div>
      ) : (
        <>
          {/* Virtual Try-On Toggle - Only shown when wishlist has items */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center w-full max-w-lg px-4">
              <div
                onClick={() => {
                  if (tryOnMode) {
                    resetTryOnMode();
                  } else {
                    setTryOnMode(true);
                  }
                }}
                className={`relative w-60 h-14 rounded-full cursor-pointer transition-colors duration-300 shadow-lg ${
                  tryOnMode ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-28 h-12 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                    tryOnMode ? "translate-x-28" : ""
                  }`}
                >
                  <span className="font-semibold text-xs text-gray-700">
                    {tryOnMode ? "Virtual Try-On" : "See Wishlist"}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                  <span
                    className={`font-semibold text-xs transition-opacity duration-300 ${
                      !tryOnMode ? "opacity-0" : "opacity-70 text-white"
                    }`}
                  >
                    See Wishlist
                  </span>
                  <span
                    className={`font-semibold text-xs transition-opacity duration-300 ${
                      tryOnMode ? "opacity-0" : "opacity-70 text-gray-700"
                    }`}
                  >
                    Virtual Try-On
                  </span>
                </div>
              </div>

              {/* Upload section */}
              {tryOnMode && !activatedTryOn && !loading && (
                <div className="mt-6 flex flex-col items-center gap-4 w-full">
                  <label className="px-8 py-3 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-all duration-300 text-center font-medium shadow-md min-w-52">
                    📸 Upload Your Picture
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUpload}
                    />
                  </label>

                  {uploadedImage && (
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={uploadedImage.url}
                        alt="Uploaded"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-orange-500 shadow-md"
                      />
                      <button
                        onClick={handleEnterTryOn}
                        className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 text-center font-medium shadow-md min-w-52"
                      >
                        🚀 Enter Try-On Mode
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Loading spinner */}
              {loading && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600">
                    Activating Virtual Try-On...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {wishlistItems.map((item, index) => (
              <ProductItem
                key={index}
                id={item._id}
                image={item.image}
                images={item.images}
                name={item.name}
                price={item.price}
                enableVirtualTryOn={true}
                className={
                  tryOnMode && activatedTryOn
                    ? "filter grayscale opacity-50"
                    : ""
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
