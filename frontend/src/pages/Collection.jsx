import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");

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

  return (
    <div className="pt-4 pb-8">
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
                enableVirtualTryOn={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
