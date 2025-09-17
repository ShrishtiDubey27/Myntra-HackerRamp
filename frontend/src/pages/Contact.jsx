import React from "react";
import Title from "../components/Title";

const Contact = () => {
  const virtualTryOnImpacts = [
    {
      icon: "📈",
      title: "Increase Sales",
      description:
        "Virtual try-on increases conversion rates by 64%, as customers feel more confident purchasing products they can visualize on themselves.",
      stats: "64% higher conversion rate",
    },
    {
      icon: "📦",
      title: "Reduce Return Rates",
      description:
        "By allowing customers to see how products look before purchase, returns are reduced by up to 40%, saving costs and improving satisfaction.",
      stats: "40% reduction in returns",
    },
    {
      icon: "😊",
      title: "Enhanced User Satisfaction",
      description:
        "Customers report 85% higher satisfaction when they can try products virtually, leading to better reviews and brand loyalty.",
      stats: "85% satisfaction increase",
    },
    {
      icon: "⚡",
      title: "Improved User Experience",
      description:
        "Interactive features create engaging shopping experiences, increasing time spent on site by 150% and repeat purchases.",
      stats: "150% longer engagement",
    },
    {
      icon: "🎯",
      title: "Efficient Shopping",
      description:
        "Customers make purchase decisions 3x faster with virtual try-on, reducing browsing time while increasing purchase intent.",
      stats: "3x faster decisions",
    },
    {
      icon: "🛍️",
      title: "Convenient Experience",
      description:
        "Shop from anywhere, anytime with confidence. No need to visit physical stores or worry about sizing issues.",
      stats: "24/7 accessibility",
    },
  ];

  const aiFeatures = [
    {
      icon: "🤖",
      title: "Talk to AI",
      description:
        "Clueless about what to wear? Can't think of the right color to pair? Get all fashion tips at your fingertips with our intelligent AI stylist.",
      benefits: [
        "Instant Fashion Advice & Styling Tips",
        "Color Coordination Suggestions",
        "Outfit Recommendations for Any Occasion",
        "Personal Style Assessment",
        "Trend Insights & Fashion Guidance",
        "Size & Fit Recommendations",
      ],
    },
  ];

  return (
    <div>
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={"OUR"} text2={"GOAL"}></Title>
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 mt-4">
          Transforming the future of online shopping through innovative
          AI-powered features that enhance customer experience and drive
          business success.
        </p>
      </div>

      {/* Virtual Try-On Impact Section */}
      <div className="my-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Virtual Try-On Impact
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our virtual try-on technology revolutionizes online shopping by
            providing customers with confidence and businesses with measurable
            results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {virtualTryOnImpacts.map((impact, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{impact.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {impact.title}
              </h3>
              <p className="text-gray-600 mb-4">{impact.description}</p>
              <div className="bg-orange-50 rounded-lg p-3">
                <span className="text-orange-600 font-semibold">
                  {impact.stats}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TrendTalk Social Shopping Section */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 py-16 mb-16 rounded-lg mx-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            TrendTalk: Social Shopping Revolution
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            TrendTalk transforms the isolated online shopping experience into a
            vibrant social community where fashion enthusiasts connect, share,
            and shop together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Fashion Channels
            </h3>
            <p className="text-gray-600">
              Create and join channels based on style preferences, brands, or
              fashion categories. Build your fashion community!
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Share Experiences
            </h3>
            <p className="text-gray-600">
              Post outfit reviews, styling tips, and shopping hauls. Get real
              feedback from your fashion community.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Shop Together
            </h3>
            <p className="text-gray-600">
              Recreate the offline group shopping experience online. Make
              decisions together, get instant opinions!
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Increase Engagement
            </h3>
            <p className="text-gray-600">
              Users spend 3x more time on social shopping platforms, leading to
              higher satisfaction and sales.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Style Communities
            </h3>
            <p className="text-gray-600">
              Join communities for minimalist, streetwear, luxury, vintage, or
              any fashion style that matches your taste.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Trend Discovery
            </h3>
            <p className="text-gray-600">
              Discover emerging trends through community discussions and real
              user posts, not just algorithms.
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-16 mb-16 rounded-lg mx-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Personal AI Stylist
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Never feel confused about fashion again! Our AI stylist provides
            instant fashion advice, style tips, and outfit recommendations
            tailored just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
          {aiFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              <div className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Vision Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-16 mb-16 rounded-lg mx-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Our Vision for the Future</h2>
          <p className="text-gray-300 max-w-3xl mx-auto mb-8">
            We envision a world where online shopping is as intuitive and
            satisfying as in-person experiences, powered by AI that understands
            and anticipates customer needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">50M+</div>
              <div className="text-sm">Future Users</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">90%</div>
              <div className="text-sm">Satisfaction Target</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">Zero</div>
              <div className="text-sm">Return Disappointments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
