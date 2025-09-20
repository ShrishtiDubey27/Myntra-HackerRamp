import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || `http://localhost:${process.env.VITE_BACKEND_PORT}`;

// Generate outfit suggestion for a product
export const generateOutfitSuggestion = async (productData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/outfit/generate-suggestion`,
      {
        productName: productData.name,
        productCategory: productData.category,
        productDescription: productData.description,
        productImage: productData.image?.[0] || productData.image,
        userGender: productData.gender, // Optional: can be set from user profile
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating outfit suggestion:", error);
    throw error;
  }
};
