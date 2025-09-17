import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { toast } from "react-toastify";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");

  // Virtual Try-On states
  const [tryOnMode, setTryOnMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [activatedTryOn, setActivatedTryOn] = useState(false); // catalog blackout
  const [loading, setLoading] = useState(false); // spinner

  // Filters
  const toggleCategory = (e) => {
    setCategory((prev) =>
      prev.includes(e.target.value)
        ? prev.filter((c) => c !== e.target.value)
        : [...prev, e.target.value]
    );
  };
  const toggleSubCategory = (e) => {
    setSubCategory((prev) =>
      prev.includes(e.target.value)
        ? prev.filter((c) => c !== e.target.value)
        : [...prev, e.target.value]
    );
  };

  const applyFilter = () => {
    let productsCopy = [...products];
    if (showSearch && search)
      productsCopy = productsCopy.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    if (category.length)
      productsCopy = productsCopy.filter((p) => category.includes(p.category));
    if (subCategory.length)
      productsCopy = productsCopy.filter((p) =>
        subCategory.includes(p.subCategory)
      );
    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = [...filterProducts];
    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(
    () => applyFilter(),
    [category, subCategory, search, showSearch, products]
  );
  useEffect(() => sortProduct(), [sortType]);

  // Reset virtual try-on state on component mount (page load)
  useEffect(() => {
    // Clear any existing virtual try-on state when page loads
    sessionStorage.removeItem("activeModelId");
    setTryOnMode(false);
    setUploadedImage(null);
    setActivatedTryOn(false);

    // Cleanup function to reset state when leaving the page
    return () => {
      sessionStorage.removeItem("activeModelId");
    };
  }, []);

  // Upload image
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Extract file name without extension
      const fileName = file.name.split(".")[0].toLowerCase();

      // Always accept the image and show it
      setUploadedImage({
        url: URL.createObjectURL(file),
        modelId: fileName,
        isValidModel: fileName.match(/^model[1-5]$/), // Check if it's a valid model ID
      });
      setActivatedTryOn(false);
    }
  };

  const handleEnterTryOn = () => {
    if (!uploadedImage) return;

    // Store the model ID and validity before clearing the image
    const modelId = uploadedImage.modelId;
    const isValidModel = uploadedImage.isValidModel;

    // Remove the uploaded image immediately and start loading
    setUploadedImage(null);
    setLoading(true);

    // Check if the uploaded image has a valid model ID
    if (!isValidModel) {
      // Show error after 2 seconds for invalid model ID
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
      // Store the model ID to use for image swapping
      sessionStorage.setItem("activeModelId", modelId);
      // Force component re-render to update images with a small delay
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
    // Force component re-render to reset images
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="pt-4 pb-8">
      {/* Toggle Switch Container */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center w-full max-w-lg px-4">
          {/* Toggle Switch */}
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
            {/* Sliding circle */}
            <div
              className={`absolute top-1 left-1 w-28 h-12 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                tryOnMode ? "translate-x-28" : ""
              }`}
            >
              <span className="font-semibold text-xs text-gray-700">
                {tryOnMode ? "Virtual Try-On" : "See Catalog"}
              </span>
            </div>

            {/* Background text labels */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <span
                className={`font-semibold text-xs transition-opacity duration-300 ${
                  !tryOnMode ? "opacity-0" : "opacity-70 text-white"
                }`}
              >
                See Catalog
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

      <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 border-t">
        {/* Filters */}
        <div className="min-w-60">
          <p
            onClick={() => setShowFilter(!showFilter)}
            className="my-2 text-xl flex items-center cursor-pointer gap-2"
          >
            FILTERS
            <img
              src={assets.dropdown_icon}
              className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
              alt=""
            />
          </p>

          <div
            className={`border border-gray-300 pl-5 py-3 mt-6 ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-sm font-medium">CATEGORIES</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {["Men", "Women", "Kids"].map((cat) => (
                <p key={cat} className="flex gap-2">
                  <input
                    className="w-3"
                    type="checkbox"
                    value={cat}
                    onChange={toggleCategory}
                  />
                  {cat}
                </p>
              ))}
            </div>
          </div>

          <div
            className={`border border-gray-300 pl-5 py-3 my-5 ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-sm font-medium">TYPE</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {["Topwear", "Bottomwear", "Winterwear"].map((sub) => (
                <p key={sub} className="flex gap-2">
                  <input
                    className="w-3"
                    type="checkbox"
                    value={sub}
                    onChange={toggleSubCategory}
                  />
                  {sub}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="flex-1">
          <div className="flex justify-between text-base sm:text-2xl mb-4">
            <Title text1={"ALL"} text2={"COLLECTION"} />
            <select
              onChange={(e) => setSortType(e.target.value)}
              className="border-2 border-gray-300 text-sm px-2"
            >
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {filterProducts.map((item, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default Collection;
