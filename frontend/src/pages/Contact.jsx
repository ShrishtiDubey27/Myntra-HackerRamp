import React from "react";
import Title from "../components/Title";

const Contact = () => {
  const tryBeforeYouBuyImpacts = [
    {
      icon: "📈",
      title: "Enhanced Purchase Confidence",
      description:
        "Try Before You Buy helps customers make informed decisions by previewing products beforehand, leading to improved conversion rates.",
      stats: "Better decision-making",
    },
    {
      icon: "📦",
      title: "Reduced Return Rates",
      description:
        "When customers can visualize products before purchasing, it helps set accurate expectations and reduces unnecessary returns.",
      stats: "Lower return incidents",
    },
    {
      icon: "😊",
      title: "Improved Shopping Experience",
      description:
        "Interactive features provide a more engaging and personalized shopping journey for modern consumers.",
      stats: "Enhanced user engagement",
    },
    {
      icon: "⚡",
      title: "Streamlined Shopping Process",
      description:
        "Try Before You Buy eliminates guesswork, allowing customers to browse and select products more efficiently.",
      stats: "Faster product selection",
    },
    {
      icon: "🎯",
      title: "Informed Decision Making",
      description:
        "Clear visual feedback helps customers understand how products will look and fit, reducing purchase hesitation.",
      stats: "Clearer product visualization",
    },
    {
      icon: "🛍️",
      title: "Convenient Access",
      description:
        "Shop from anywhere with the convenience of trying products virtually without visiting physical stores.",
      stats: "Flexible shopping options",
    },
  ];

  const aiFeatures = [
    {
      icon: "🤖",
      title: "AI Fashion Assistant",
      description:
        "Get personalized styling advice and fashion recommendations through our AI-powered assistant that understands your preferences and style needs.",
      benefits: [
        "Personalized outfit suggestions",
        "Color coordination advice",
        "Style guidance for occasions",
        "Fashion trend insights",
        "Size and fit recommendations",
        "Personal styling tips",
      ],
    },
  ];

  return (
    <div>
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={"OUR"} text2={"MISSION"}></Title>
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 mt-4">
          Building innovative e-commerce solutions that bridge the gap between
          online and offline shopping through AI-powered features and
          community-driven experiences.
        </p>
      </div>

      {/* Try Before You Buy Impact Section */}
      <div className="my-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Try Before You Buy Technology
          </h2>
          <p className="text-gray-600 mb-6">
            Our Try Before You Buy feature helps customers visualize products
            before purchasing, leading to better decision-making and increased
            satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {tryBeforeYouBuyImpacts.map((impact, index) => (
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

      {/* TrendTalks Social Shopping Section */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 py-16 mb-16 rounded-lg mx-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            TrendTalks: Shop with Friends & Family
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            TrendTalks brings the fun of shopping with friends and family
            online. Chat directly, create polls, and get opinions from people
            you trust before making fashion decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Direct Messages
            </h3>
            <p className="text-gray-600">
              Chat directly with friends and family about outfit choices. Share
              photos, get instant feedback, and make decisions together.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">�</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Fashion Polls
            </h3>
            <p className="text-gray-600">
              Create polls asking "Which outfit should I wear?" or "Blue or red
              dress?" Let your friends vote and help you decide.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Group Channels
            </h3>
            <p className="text-gray-600">
              Create channels with your closest friends, family, or shopping
              buddies to discuss outfits and share fashion finds together.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Get Trusted Opinions
            </h3>
            <p className="text-gray-600">
              Get honest feedback from people who know your style. No more
              shopping alone - your support system is always there.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Collaborative Shopping
            </h3>
            <p className="text-gray-600">
              Share your cart, ask for second opinions, and shop together
              virtually. Perfect for picking outfits for special occasions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Instant Decisions
            </h3>
            <p className="text-gray-600">
              No more endless browsing and second-guessing. Get quick feedback
              from your circle and make confident purchase decisions.
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-16 mb-16 rounded-lg mx-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            AI-Powered Fashion Assistant
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our AI fashion assistant provides personalized styling advice and
            recommendations to help you make confident fashion choices.
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
          <h2 className="text-2xl font-bold mb-4">Our Development Vision</h2>
          <p className="text-gray-300 max-w-3xl mx-auto mb-8">
            We aim to create an e-commerce platform that combines the
            convenience of online shopping with the personalized experience of
            in-store assistance through AI and community features.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">Smart</div>
              <div className="text-sm">AI Integration</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">Social</div>
              <div className="text-sm">Community Features</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">Seamless</div>
              <div className="text-sm">User Experience</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
