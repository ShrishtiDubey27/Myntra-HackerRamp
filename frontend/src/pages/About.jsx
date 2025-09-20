import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";

const About = () => {
  const teamMembers = [
    {
      name: "Hema Mula Yuva",
      image: assets.hema,
      course: "Computer Science",
      batch: "2023-2027",
    },
    {
      name: "Shrishti Dubey",
      image: assets.shri,
      course: "Computer Science and Artificial Intelligence",
      batch: "2023-2027",
    },
    {
      name: "Sanchita Patel",
      image: assets.sanchu,
      course: "Computer Science",
      batch: "2023-2027",
    },
  ];

  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ABOUT"} text2={"US"}></Title>
      </div>

      {/* Team Section */}
      <div className="text-2xl text-center py-8 mt-10">
        <Title text1={"MEET"} text2={"THE POWERPUFF GIRLS"}></Title>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-16 px-4 justify-center">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 max-w-sm mx-auto lg:mx-0"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-orange-500">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {member.name}
            </h3>
            <p className="text-orange-500 font-semibold mb-1">
              {member.course}
            </p>
            <p className="text-gray-600 text-sm mb-2">Batch {member.batch}</p>
            <p className="text-gray-500 text-sm">
              Indian Institute of Information Technology Lucknow
            </p>
          </div>
        ))}
      </div>

      {/* Project Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-12 mb-16 rounded-lg mx-4">
        <div className="text-center max-w-4xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Project Information
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            <span className="font-semibold text-orange-600">ShopAura</span> is
            developed for the{" "}
            <span className="font-semibold text-blue-600">
              Myntra HackerRamp WeForShe Hackathon 2025
            </span>{" "}
            hosted on{" "}
            <span className="font-semibold text-purple-600">Unstop</span>. This
            e-commerce platform features Try Before You Buy technology,
            AI-powered fashion assistance, and social shopping capabilities.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            The project demonstrates our understanding of modern e-commerce
            challenges and showcases technical implementation of AI and social
            features in online shopping.
          </p>
        </div>
      </div>

      {/* College Info Section */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 py-12 mb-16 rounded-lg mx-4">
        <div className="text-center max-w-4xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Our Academic Background
          </h3>
          <p className="text-gray-700 leading-relaxed">
            We are students at{" "}
            <span className="font-semibold text-orange-600">
              Indian Institute of Information Technology Lucknow
            </span>
            , pursuing our B.Tech degrees in the{" "}
            <span className="font-semibold">2023-2027 batch</span>. Our academic
            focus in Computer Science and Artificial Intelligence provides the
            foundation for developing technology-driven solutions.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Through our coursework and projects at IIIT Lucknow, we have gained
            experience in web development, machine learning, and software
            engineering, which we have applied in building ShopAura.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
