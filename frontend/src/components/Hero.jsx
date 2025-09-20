import React, { useState, useEffect } from "react";
import { assets } from "../assets/frontend_assets/assets";

const Hero = () => {
  const words = ["Arrivals", "Fashion", "Trends", "Styles"];
  const [displayedText, setDisplayedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Images matched with corresponding text words - better aspect ratios for hero height
  const bannerData = [
    {
      word: "Arrivals",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80",
    },
    {
      word: "Fashion",
      image:
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80",
    },
    {
      word: "Trends",
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80",
    },
    {
      word: "Styles",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600&q=80",
    },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Find the longest word to reserve space
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b));

  // Sync image with word changes - change image only when new word starts
  useEffect(() => {
    // Only change image when starting a new word (not deleting)
    if (!isDeleting && currentCharIndex === 0) {
      setCurrentImageIndex(currentWordIndex);
    }
  }, [currentWordIndex, isDeleting, currentCharIndex]);

  // Text typing effect - this will control both text and image changes
  useEffect(() => {
    const currentWord = words[currentWordIndex];

    if (isDeleting) {
      if (currentCharIndex > 0) {
        setTimeout(() => {
          setDisplayedText(currentWord.slice(0, currentCharIndex - 1));
          setCurrentCharIndex((prev) => prev - 1);
        }, 100);
      } else {
        setIsDeleting(false);
        // Move to next word and change image when new word starts
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    } else {
      if (currentCharIndex < currentWord.length) {
        setTimeout(() => {
          setDisplayedText(currentWord.slice(0, currentCharIndex + 1));
          setCurrentCharIndex((prev) => prev + 1);
        }, 150);
      } else {
        setTimeout(() => {
          setIsDeleting(true);
        }, 1000);
      }
    }
  }, [currentCharIndex, isDeleting, currentWordIndex, words]);

  return (
    <div className="flex flex-col sm:flex-row border border-gray-400 h-[280px] sm:h-[250px]">
      {/* Hero left side */}
      <div className="w-full sm:w-1/2 flex items-center justify-center py-4 sm:py-0">
        <div className="text-[#414141]">
          <div className="flex items-center gap-2">
            <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
            <p className="font-medium text-sm md:text-base">
              <span className="text-orange-600">OUR</span> BESTSELLERS
            </p>
          </div>

          <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">
            Latest{" "}
            <span
              className="text-orange-600 inline-block"
              style={{ minWidth: `${longestWord.length}ch` }}
            >
              {displayedText}
              <span className="animate-pulse">|</span>
            </span>
          </h1>

          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm md:text-base">
              <span className="text-orange-600">SHOP</span> NOW
            </p>
            <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
          </div>
        </div>
      </div>

      {/* Hero right side - Image carousel */}
      <div className="w-full sm:w-1/2 h-full relative overflow-hidden">
        <img
          className="w-full h-full object-cover object-center transition-opacity duration-1000"
          src={bannerData[currentImageIndex].image}
          alt={`${bannerData[currentImageIndex].word} banner`}
        />

        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {bannerData.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentImageIndex
                  ? "bg-orange-600"
                  : "bg-white bg-opacity-50"
              }`}
              onClick={() => {
                setCurrentWordIndex(index);
                setCurrentImageIndex(index);
                setDisplayedText("");
                setCurrentCharIndex(0);
                setIsDeleting(false);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
