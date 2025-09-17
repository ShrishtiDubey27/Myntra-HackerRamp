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
            This project,{" "}
            <span className="font-semibold text-orange-600">ShopAura</span>, is
            developed for the
            <span className="font-semibold text-blue-600">
              {" "}
              Myntra HackerRamp
            </span>{" "}
            happening on
            <span className="font-semibold text-purple-600"> Unstop</span>.
            We've created an innovative e-commerce platform that showcases
            cutting-edge features like virtual try-on technology, AI-powered
            recommendations, and seamless user experience design.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            As participants in this prestigious hackathon, we're excited to
            demonstrate our technical skills and creative problem-solving
            abilities through this comprehensive shopping platform.
          </p>
        </div>
      </div>

      {/* College Info Section */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 py-12 mb-16 rounded-lg mx-4">
        <div className="text-center max-w-4xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Our Academic Journey
          </h3>
          <p className="text-gray-700 leading-relaxed">
            As proud students of the{" "}
            <span className="font-semibold text-orange-600">
              Indian Institute of Information Technology Lucknow
            </span>
            , we are part of the{" "}
            <span className="font-semibold">2023-2027 batch</span>, where we're
            pursuing our passion for technology and innovation. Our diverse
            academic backgrounds in Computer Science and Artificial Intelligence
            enable us to bring unique perspectives to every project we
            undertake.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            At IIIT Lucknow, we've honed our skills in cutting-edge
            technologies, machine learning, and software development, which
            we've applied to create ShopAura - a testament to our commitment to
            excellence and innovation in the digital space.
          </p>
        </div>
      </div>

      <div className="text-2xl py-4">
        <Title text1={"WHY"} text2={"CHOOSE US"}></Title>
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Innovation & Technology:</b>
          <p className="text-gray-600">
            We leverage cutting-edge AI and machine learning technologies to
            provide personalized shopping experiences. Our virtual try-on
            feature and intelligent recommendations set us apart in the
            e-commerce space.
          </p>
        </div>

        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Student Perspective:</b>
          <p className="text-gray-600">
            As students ourselves, we understand the needs of modern consumers.
            We've built ShopAura with fresh ideas, latest trends, and
            user-centric design principles that resonate with today's
            digital-savvy shoppers.
          </p>
        </div>

        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Academic Excellence:</b>
          <p className="text-gray-600">
            Our foundation at IIIT Lucknow ensures that every feature is built
            with precision, research-backed methodologies, and industry best
            practices. We bring academic rigor to practical solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
