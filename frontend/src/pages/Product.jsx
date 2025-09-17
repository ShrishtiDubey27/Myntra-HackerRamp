import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [activeModelId, setActiveModelId] = useState(
    sessionStorage.getItem("activeModelId")
  );

  // Listen for storage changes to update when virtual try-on state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newActiveModelId = sessionStorage.getItem("activeModelId");
      setActiveModelId(newActiveModelId);

      // Update the displayed image when virtual try-on state changes
      if (productData && productData.images) {
        let newImage;
        if (newActiveModelId) {
          const modelImage = productData.images.find(
            (img) => img.id === newActiveModelId
          );
          newImage = modelImage
            ? modelImage.url
            : productData.images.find((img) => img.id === "product")?.url;
        } else {
          newImage =
            productData.images.find((img) => img.id === "product")?.url ||
            productData.images[0]?.url;
        }
        setImage(newImage);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [productData]);

  const fetchProductData = async () => {
    if (!products) return;

    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);

      // Handle both new and old image structure
      if (product.images) {
        let defaultImage;
        if (activeModelId) {
          // If virtual try-on is active, show the matched model image
          const modelImage = product.images.find(
            (img) => img.id === activeModelId
          );
          defaultImage = modelImage
            ? modelImage.url
            : product.images.find((img) => img.id === "product")?.url;
        } else {
          // Show product image by default
          defaultImage =
            product.images.find((img) => img.id === "product")?.url ||
            product.images[0]?.url;
        }
        setImage(defaultImage);
      } else if (product.image) {
        setImage(product.image[0]);
      }
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products, activeModelId]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/*----------------- Product data-------------------- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* -----------------Product Images----------------- */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.images
              ? productData.images
                  .filter((item) => {
                    if (activeModelId) {
                      // If virtual try-on is active, show only product and matched model
                      return item.id === "product" || item.id === activeModelId;
                    } else {
                      // Show only product image by default
                      return item.id === "product";
                    }
                  })
                  .map((item, index) => (
                    <div key={index} className="relative">
                      <img
                        onClick={() => setImage(item.url)}
                        src={item.url}
                        className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                        alt={item.id}
                      />
                      {/* Add label for model image */}
                      {item.id !== "product" && activeModelId && (
                        <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs text-center py-1">
                          Try-On Image
                        </div>
                      )}
                    </div>
                  ))
              : productData.image
              ? productData.image
                  .slice(0, 1)
                  .map((item, index) => (
                    <img
                      onClick={() => setImage(item)}
                      src={item}
                      key={index}
                      className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                      alt=""
                    />
                  ))
              : null}
          </div>

          <div className="w-full sm:w-[80%] relative">
            <img src={image} className="w-full h-auto" alt="" />
            {/* Add label to main image if it's showing a model image */}
            {activeModelId &&
              productData.images &&
              (() => {
                const currentImage = productData.images.find(
                  (img) => img.url === image
                );
                return currentImage && currentImage.id !== "product" ? (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                    Try-On Image
                  </div>
                ) : null;
              })()}
          </div>
        </div>

        {/* -----------------Product info -----------------*/}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>

          {/* Show current view mode */}
          {activeModelId && (
            <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded-md">
              <p className="text-sm text-orange-700">
                🔄 Virtual Try-On Active - Viewing:{" "}
                {activeModelId.toUpperCase()}
              </p>
            </div>
          )}

          <div className=" flex items-center gap-1 mt-2">
            <img src={assets.star_icon} className="w-3 5" />
            <img src={assets.star_icon} className="w-3 5" />
            <img src={assets.star_icon} className="w-3 5" />
            <img src={assets.star_icon} className="w-3 5" />
            <img src={assets.star_dull_icon} className="w-3 5" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>

          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* -----------description and review section */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews (122)</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            An e-commerce website is an online platform that facilitates the
            buying and selling of products or services over the internet. It
            serves as a virtual marketplace where businesses and individuals can
            showcase their products, interact with customers, and conduct
            transactions without the need for a physical presence. E-commerce
            websites have gained immense popularity due to their convenience,
            accessibility, and the global reach they offer.
          </p>
          <p>
            E-commerce websites typically display products or services along
            with detailed descriptions, images, prices, and any available
            variations (e.g., sizes, colors). Each product usually has its own
            dedicated page with relevant information.
          </p>
        </div>
      </div>

      {/* -------------dispaly related products------------------- */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
