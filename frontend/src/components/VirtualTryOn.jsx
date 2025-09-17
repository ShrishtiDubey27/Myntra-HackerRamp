import React from "react";
import {
  AiOutlineExperiment,
  AiOutlineRobot,
  AiOutlineLineChart,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import Title from "./Title";

const features = [
  {
    id: 1,
    title: "Virtual Try-On",
    description:
      "See how products look on you before buying with AI-powered virtual try-on.",
    icon: <AiOutlineExperiment className="text-5xl text-orange-500" />,
    link: "/wishlist?from=virtual-tryon", // Virtual AI
  },
  {
    id: 2,
    title: "Talk to AI",
    description:
      "Get instant assistance and recommendations from our smart AI assistant.",
    icon: <AiOutlineRobot className="text-5xl text-orange-500" />,
    link: "/chatAI", // ChatBot
  },
  {
    id: 3,
    title: "TrendTalk",
    description:
      "Stay updated with the latest fashion trends and insights curated for you.",
    icon: <AiOutlineLineChart className="text-5xl text-orange-500" />,
    link: "/chat", // TrendTalk
  },
];

const VirtualTryOn = () => {
  const navigate = useNavigate();

  return (
    <div className="my-10">
      {/* Section Title */}
      <div className="text-center py-8 text-3xl">
        <Title text1={"OUR"} text2={" FEATURES"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Explore the exciting features that make your shopping experience
          smarter and more interactive. Try products virtually, get AI
          recommendations, and stay ahead of the trends.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            onClick={() => navigate(feature.link)}
            className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            {feature.icon}
            <h3 className="font-semibold text-xl mt-4">{feature.title}</h3>
            <p className="text-gray-600 mt-2 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualTryOn;
