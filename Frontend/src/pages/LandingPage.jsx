import React, { useEffect, useState } from "react";
import Hero from "../components/ui/hero";
import Display from "../components/ui/display";

function LandingPage() {
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setUserScrolled(false);
      } else {
        setUserScrolled(true);
      }
    };

    const handleMouseMove = (e) => {
      if (!userScrolled && e.clientY > window.innerHeight - 50) {
        setUserScrolled(true);
        document
          .getElementById("next-section")
          .scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [userScrolled]);

  return (
    <div className="relative bg-black min-h-screen">
      {/* Falling Doodle Rain Effect */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => {
          const randomDuration = Math.random() * 4 + 3;
          return (
            <span
              key={i}
              className="falling-doodle absolute"
              style={{
                left: `${Math.random() * 100}vw`,
                animation: `fall ${randomDuration}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                color: i % 2 === 0 ? "#00FFFF" : "#FF00FF",
              }}
            >
              {
                ["🦖", "🐬", "🐳", "🦈", "🐧", "🐼"][
                  Math.floor(Math.random() * 6)
                ]
              }
            </span>
          );
        })}
      </div>

      {/* Hero Section */}
      <Hero />

      {/* Display Section */}
      <Display />
      <footer className="w-full text-center py-4 text-gray-400 text-sm">
        Built by <span className="text-white font-semibold">Manas</span>{" "}
        with ❤️ using <span className="text-blue-400">React</span>,{" "}
        <span className="text-red-400">Express</span>, and{" "}
        <span className="text-yellow-400">Puppeteer</span>.
      </footer>
    </div>
  );
}

export default LandingPage;
