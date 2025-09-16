import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/frontend_assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');

  // Virtual Try-On states
  const [tryOnMode, setTryOnMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [activatedTryOn, setActivatedTryOn] = useState(false); // catalog blackout
  const [loading, setLoading] = useState(false); // spinner

  // Filters
  const toggleCategory = (e) => {
    setCategory(prev => prev.includes(e.target.value) ? prev.filter(c => c !== e.target.value) : [...prev, e.target.value]);
  };
  const toggleSubCategory = (e) => {
    setSubCategory(prev => prev.includes(e.target.value) ? prev.filter(c => c !== e.target.value) : [...prev, e.target.value]);
  };

  const applyFilter = () => {
    let productsCopy = [...products];
    if (showSearch && search) productsCopy = productsCopy.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category.length) productsCopy = productsCopy.filter(p => category.includes(p.category));
    if (subCategory.length) productsCopy = productsCopy.filter(p => subCategory.includes(p.subCategory));
    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = [...filterProducts];
    switch (sortType) {
      case 'low-high': setFilterProducts(fpCopy.sort((a,b)=>a.price-b.price)); break;
      case 'high-low': setFilterProducts(fpCopy.sort((a,b)=>b.price-a.price)); break;
      default: applyFilter(); break;
    }
  };

  useEffect(() => applyFilter(), [category, subCategory, search, showSearch, products]);
  useEffect(() => sortProduct(), [sortType]);

  // Upload image
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setActivatedTryOn(false);
    }
  };

  const handleEnterTryOn = () => {
    if (!uploadedImage) return;
    // Start loading process
    setLoading(true);
    setUploadedImage(null); // remove photo immediately

    setTimeout(() => {
      setLoading(false);
      setActivatedTryOn(true); // blackout catalog
    }, 2000); // 2 seconds
  };

  return (
    <div className='pt-4'>

      {/* Toggle Switch */}
      <div className='flex justify-center mb-4'>
        <div className='flex flex-col items-center'>
          <div
            onClick={() => { setTryOnMode(!tryOnMode); setUploadedImage(null); setActivatedTryOn(false); }}
            className={`relative w-60 h-14 rounded-full cursor-pointer transition-colors duration-300 ${tryOnMode ? 'bg-orange-500' : 'bg-gray-300'}`}
          >
            {/* Sliding circle */}
            <div
              className={`absolute top-1 left-1 w-1/2 h-12 bg-white rounded-full shadow-md transform transition-transform duration-300 ${tryOnMode ? 'translate-x-full' : ''}`}
            ></div>

            {/* Text labels */}
            <div className='absolute inset-0 flex justify-between items-center px-6 font-semibold text-sm text-gray-700'>
              <span className='text-center w-1/2'>See Catalog</span>
              <span className='text-center w-1/2'>Virtual Try-On</span>
            </div>
          </div>

          {/* Upload button + Enter button */}
          {tryOnMode && !activatedTryOn && !loading && (
            <div className='mt-3 flex flex-col items-center gap-2'>
              <label className='px-6 py-3 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition'>
                Upload Your Picture
                <input type="file" accept="image/*" className='hidden' onChange={handleUpload} />
              </label>

              {uploadedImage && (
                <button
                  onClick={handleEnterTryOn}
                  className='px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition'
                >
                  Enter
                </button>
              )}
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className='mt-3 flex justify-center'>
              <div className='w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
            </div>
          )}
        </div>
      </div>

      {/* Show uploaded image */}
      {uploadedImage && !loading && (
        <div className='flex justify-center mb-6'>
          <img src={uploadedImage} alt='Uploaded' className='w-48 h-48 object-cover rounded-lg border-2 border-orange-500' />
        </div>
      )}

      <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 border-t'>
        {/* Filters */}
        <div className='min-w-60'>
          <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>
            FILTERS
            <img src={assets.dropdown_icon} className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} alt="" />
          </p>

          <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
              {['Men','Women','Kids'].map(cat => (
                <p key={cat} className='flex gap-2'>
                  <input className='w-3' type="checkbox" value={cat} onChange={toggleCategory} />{cat}
                </p>
              ))}
            </div>
          </div>

          <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium'>TYPE</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
              {['Topwear','Bottomwear','Winterwear'].map(sub => (
                <p key={sub} className='flex gap-2'>
                  <input className='w-3' type="checkbox" value={sub} onChange={toggleSubCategory} />{sub}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className='flex-1'>
          <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={'ALL'} text2={'COLLECTION'} />
            <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
            {filterProducts.map((item,index)=>(
              <ProductItem
                key={index}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
                className={tryOnMode && activatedTryOn ? 'filter grayscale opacity-50' : ''}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
};

export default Collection;
