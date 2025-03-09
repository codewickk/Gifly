import React from "react";

function Hero() {
  return (
    <div className="hero-container relative flex flex-col items-center text-center">
      {/* Neon Glowing Title */}
      <h1 className="neon-glow text-8xl font-extrabold text-white relative">
        Gifly
      </h1>

      {/* Description */}
      <p className="hero-text text-lg max-w-md mt-6 leading-relaxed">
        Tired of editing endless screenshots & recordings?  
        <span className="font-semibold"> Gifly </span>  
        captures stunning thumbnails & GIFs of your landing page—effortless & sleek!
      </p>

      {/* Bullet Points Section */}
      <ul className="mt-6 text-lg text-gray-300 space-y-2">
        <li className="flex items-center gap-2">
          <span className="text-yellow-400 text-2xl">⬤</span> {/* Custom Bullet Icon */}
          Just copy-paste the URL of your website
        </li>
        <li className="flex items-center gap-2">
          <span className="text-yellow-400 text-2xl">⬤</span> {/* Custom Bullet Icon */}
          Download the Thumbnail and GIF of your website
        </li>
      </ul>

      {/* Scroll Down Indicator */}
      <div 
        className="scroll-down absolute bottom-8 flex flex-col items-center cursor-pointer"
        onClick={() => document.getElementById("next-section").scrollIntoView({ behavior: "smooth" })}
      >
        <span className="text-gray-400 text-sm">Scroll Down</span>
        <span className="arrow-down mt-2 text-3xl animate-bounce">👇</span> {/* Updated to Yellow Glowing Pointing Down Emoji */}
      </div>
    </div>
  );
}

export default Hero;

