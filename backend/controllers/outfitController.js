import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate outfit suggestion for wishlist item
export const generateOutfitSuggestion = async (req, res) => {
  try {
    const {
      productName,
      productCategory,
      productDescription,
      productImage,
      userGender,
    } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Detect gender from product or use provided gender
    const detectGender = (name, category, description) => {
      const text = `${name} ${category} ${description}`.toLowerCase();

      // Women's keywords
      const womenKeywords = [
        "women",
        "ladies",
        "female",
        "girl",
        "dress",
        "blouse",
        "skirt",
        "heels",
        "bra",
        "lingerie",
        "handbag",
        "purse",
        "makeup",
        "earrings",
        "necklace",
        "bracelet",
      ];

      // Men's keywords
      const menKeywords = [
        "men",
        "male",
        "boy",
        "shirt",
        "pants",
        "tie",
        "suit",
        "beard",
        "cologne",
        "watch",
        "wallet",
        "belt",
      ];

      // Unisex keywords
      const unisexKeywords = [
        "unisex",
        "kids",
        "children",
        "baby",
        "sneakers",
        "jeans",
        "t-shirt",
        "hoodie",
        "cap",
        "hat",
        "sunglasses",
      ];

      const womenScore = womenKeywords.filter((keyword) =>
        text.includes(keyword)
      ).length;
      const menScore = menKeywords.filter((keyword) =>
        text.includes(keyword)
      ).length;
      const unisexScore = unisexKeywords.filter((keyword) =>
        text.includes(keyword)
      ).length;

      if (unisexScore > 0) return "unisex";
      if (womenScore > menScore) return "women";
      if (menScore > womenScore) return "men";
      return "unisex"; // default
    };

    const detectedGender =
      userGender ||
      detectGender(
        productName,
        productCategory || "",
        productDescription || ""
      );

    // Create gender-specific styling prompts
    let genderContext = "";
    if (detectedGender === "women") {
      genderContext = `You are styling for women. Focus on feminine fashion trends, color coordination, accessories like jewelry, handbags, scarves. Consider different occasions from casual to formal, work to weekend. Mention specific styling techniques like layering, color blocking, or creating silhouettes.`;
    } else if (detectedGender === "men") {
      genderContext = `You are styling for men. Focus on masculine fashion trends, sharp tailoring, accessories like watches, belts, ties. Consider different occasions from casual to formal, business to weekend. Mention specific styling techniques like smart-casual layering, color coordination, and fit.`;
    } else {
      genderContext = `You are creating a versatile, unisex styling approach. Focus on timeless pieces that work for anyone, emphasizing comfort and style. Consider layering techniques and accessories that complement any body type.`;
    }

    // Create a detailed prompt for outfit suggestion
    const prompt = `You are a professional fashion stylist. A customer has just added "${productName}" (category: ${
      productCategory || "fashion item"
    }) to their wishlist.

${genderContext}

Product details:
- Name: ${productName}
- Category: ${productCategory || "Not specified"}
- Description: ${productDescription || "Not provided"}
- Target: ${detectedGender === "unisex" ? "Anyone" : detectedGender}

As an expert stylist, create a complete outfit suggestion that includes this item. Your response should be:
1. Enthusiastic and personalized (like you're talking to a friend)
2. Include specific styling tips relevant to the target audience
3. Suggest complementary pieces (colors, styles, accessories) appropriate for the gender
4. Mention 2-3 different occasions where this outfit would work
5. Include seasonal considerations if relevant
6. Keep it inspiring but concise (max 200 words)

Start with something like "I see you've added [item] to your wishlist! Here's how I'd style it for the perfect ${
      detectedGender === "unisex" ? "" : detectedGender + "'s "
    }look..." and make it feel like a personal stylist recommendation.

End with: "Want more styling tips? Chat with me for personalized advice!"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const outfitSuggestion = response.text();

    return res.json({
      success: true,
      outfitSuggestion: outfitSuggestion.trim(),
      productName,
      detectedGender,
      genderSpecific: detectedGender !== "unisex",
    });
  } catch (error) {
    console.error("Error generating outfit suggestion:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate outfit suggestion",
      error: error.message,
    });
  }
};
