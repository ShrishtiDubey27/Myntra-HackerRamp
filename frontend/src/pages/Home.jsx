import React from "react";
import Hero from "../components/Hero";
import VirtualTryOn from "../components/VirtualTryOn";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";

const Home = () => {
  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8">
      {/* Each section wrapped with rounded shadow */}
      <div className="rounded-lg shadow-md overflow-hidden">
        <Hero />
      </div>

      <div className="rounded-lg shadow-md overflow-hidden">
        <VirtualTryOn />
      </div>

      <div className="rounded-lg shadow-md overflow-hidden">
        <LatestCollection />
      </div>

      <div className="rounded-lg shadow-md overflow-hidden">
        <BestSeller />
      </div>

      <div className="rounded-lg shadow-md overflow-hidden">
        <OurPolicy />
      </div>
    </div>
  );
};

export default Home;
