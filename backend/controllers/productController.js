// fucntion for add prodcut

import productModel from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    if (!req.files) {
      throw new Error("No images uploaded");
    }

    // Create an array to store the image files and their IDs
    const imageEntries = [];

    // Iterate over each possible image and its ID
    for (let i = 1; i <= 6; i++) {
      const imageKey = `image${i}`;
      const imageIdKey = `imageId${i}`;

      if (req.files[imageKey]) {
        imageEntries.push({
          file: req.files[imageKey][0],
          id: req.body[imageIdKey] || `model${i - 1}`, // fallback ID if not provided
        });
      }
    }

    if (imageEntries.length === 0) {
      throw new Error("At least one image is required");
    }

    // Upload images to cloudinary
    let images = await Promise.all(
      imageEntries.map(async (item) => {
        try {
          let result = await cloudinary.uploader.upload(item.file.path, {
            resource_type: "image",
          });
          return {
            url: result.secure_url,
            id: item.id,
          };
        } catch (err) {
          console.error("Cloudinary upload error:", err);
          throw new Error(`Failed to upload image: ${err.message}`);
        }
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestSeller: bestseller,
      sizes: JSON.parse(sizes),
      images: images,
      date: Date.now(),
    };

    console.log(productData);
    const product = new productModel(productData);

    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.error("Product addition error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Remove" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const { productID } = req.body;
    const product = await productModel.findById(productID);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct };
