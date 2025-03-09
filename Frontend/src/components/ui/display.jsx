import React, { useState, useEffect } from "react";
import DefaultImage from "../../assets/hero-section.png"; 
import DefaultGif from "../../assets/website-smooth-scroll.gif"; 

const Display = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [url, setUrl] = useState("");
  const [scrollSpeed, setScrollSpeed] = useState("medium");
  const [downloadAsZip, setDownloadAsZip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [previewImage, setPreviewImage] = useState(DefaultImage);
  const [previewGif, setPreviewGif] = useState(DefaultGif);
  const [showScrollWarning, setShowScrollWarning] = useState(true); 
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0); 

 
  const API_BASE_URL = "https://gifly-backend.onrender.com";


  const patienceQuotes = [
    "Rome wasn't built in a day.",
    "Patience is a virtue.",
    "Good things come to those who wait.",
    "Patience is bitter, but its fruit is sweet.",
    "The two most powerful warriors are patience and time.",
    "Genius is eternal patience.",
    "Patience is the companion of wisdom.",
    "Rivers know this: there is no hurry. We shall get there someday.",
    "Adopt the pace of nature: her secret is patience.",
    "Patience attracts happiness; it brings near that which is far.",
  ];


  useEffect(() => {
    let quoteInterval;
    
    if (isLoading) {
     
      quoteInterval = setInterval(() => {
        setCurrentQuoteIndex(prevIndex => 
          prevIndex === patienceQuotes.length - 1 ? 0 : prevIndex + 1
        );
      }, 3500); 
    }
    
    return () => {
      if (quoteInterval) clearInterval(quoteInterval);
    };
  }, [isLoading]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setCurrentQuoteIndex(0);
    
    try {
   
      const scrollStepMap = {
        slow: 5,
        medium: 10,
        fast: 20
      };
      
     
      const requestBody = {
        url: url,
        options: {
          scrollStep: scrollStepMap[scrollSpeed],
          downloadAsZip: downloadAsZip
        }
      };
      
      console.log("Submitting request with:", requestBody);
      
    
      const response = await fetch(`${API_BASE_URL}/generateTandGIF`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("API endpoint not found. Make sure the backend server is running on port 3000.");
        }
        
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
        } catch (parseError) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response. Status: " + response.status);
      }
      
      const data = await response.json();
      
   
      setSuccessMessage("Files generated successfully!");
      
     
      if (data.outputs?.heroImage) {
        setPreviewImage(`${API_BASE_URL}${data.outputs.heroImage}?t=${new Date().getTime()}`);
      }
      
      if (data.outputs?.scrollingGif) {
        setPreviewGif(`${API_BASE_URL}${data.outputs.scrollingGif}?t=${new Date().getTime()}`);
      }
      
      
      setFormVisible(false);
      
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleDownload = (fileType, fileName) => {
  
    const downloadUrl = `${API_BASE_URL}/download/${fileType}?zip=${downloadAsZip}`;
    
    console.log(`Initiating download from: ${downloadUrl}`);
    
 
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    
   
    document.body.appendChild(iframe);
    
    
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 5000); 
  };


  useEffect(() => {
    // This effect updates the download buttons when ZIP option changes
    if (previewImage !== DefaultImage && previewGif !== DefaultGif) {
      console.log(`ZIP download option is now: ${downloadAsZip ? 'enabled' : 'disabled'}`);
    }
  }, [downloadAsZip, previewImage, previewGif]);


  useEffect(() => {
    const handleGlobalErrors = (event) => {
      console.error('Global error caught:', event.error || event.message);
      if (isLoading) {
        setIsLoading(false);
        setError('An unexpected error occurred. Please try again.');
      }
    };

    window.addEventListener('error', handleGlobalErrors);
    window.addEventListener('unhandledrejection', handleGlobalErrors);

    return () => {
      window.removeEventListener('error', handleGlobalErrors);
      window.removeEventListener('unhandledrejection', handleGlobalErrors);
    };
  }, [isLoading]);

  
  useEffect(() => {
    if (isFormVisible) {
      setShowScrollWarning(true);
    }
  }, [isFormVisible]);


  const dismissScrollWarning = () => {
    setShowScrollWarning(false);
  };

  return (
    <div id="next-section" className="min-h-screen flex flex-col items-center justify-center bg-black px-8">
      
      {/* Heading with Yellow Glow Effect */}
      <h2 className="text-5xl font-extrabold mb-8 text-center tracking-wide relative text-yellow-400 
                     drop-shadow-[0_0_20px_rgba(255,255,100,0.8)]">
        See how your website will look in action!
      </h2>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        
        {/* Left Thumbnail Box with Aura */}
        <div className="relative group overflow-hidden rounded-xl bg-gray-900 shadow-lg transition-all duration-300 
                        hover:scale-105 hover:shadow-[0_5px_25px_rgba(255,255,255,0.3)] 
                        before:absolute before:inset-0 before:bg-gradient-to-br before:from-yellow-500 before:to-transparent 
                        before:opacity-20 before:blur-md">
          <img 
            src={previewImage} 
            alt="Website Thumbnail" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          <div className="absolute bottom-0 w-full bg-black/70 text-white text-center py-3 text-lg font-semibold">
            🖼️ This is how your website's thumbnail will look
          </div>
          
          {/* Download button */}
          {previewImage !== DefaultImage && (
            <button
              onClick={() => handleDownload('image', 'website-thumbnail.png')}
              className="absolute top-3 right-3 bg-yellow-400 text-black p-2 rounded-full shadow-lg hover:bg-yellow-300"
              title="Download Thumbnail"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
        </div>

        {/* Right GIF Box with Aura */}
        <div className="relative group overflow-hidden rounded-xl bg-gray-900 shadow-lg transition-all duration-300 
                        hover:scale-110 hover:shadow-[0_5px_25px_rgba(255,255,255,0.3)] 
                        before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500 before:to-transparent 
                        before:opacity-20 before:blur-md">
          <img 
            src={previewGif} 
            alt="Website Animation Preview" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
          />
          <div className="absolute bottom-0 w-full bg-black/70 text-white text-center py-3 text-lg font-semibold">
            🎥 This is how the GIF of your website will look
          </div>
          
          {/* Download button */}
          {previewGif !== DefaultGif && (
            <button
              onClick={() => handleDownload('gif', 'website-animation.gif')}
              className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-400"
              title="Download GIF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
        </div>

      </div>

      {/* "Try it yourself" Button */}
      <button 
        onClick={() => setFormVisible(true)} 
        className="mt-10 px-6 py-3 bg-yellow-400 text-black font-bold text-lg rounded-lg shadow-lg 
                   hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all duration-300 animate-pulse"
      >
        Try it yourself 🚀
      </button>

      {/* Popup Form */}
      {isFormVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
          <div className="bg-black border border-yellow-400 shadow-[0_0_15px_rgba(255,255,100,0.7)] p-6 rounded-xl w-96 text-white relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setFormVisible(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl"
            >
              ✖
            </button>

            {/* Form Title */}
            <h3 className="text-yellow-400 text-xl font-bold mb-4 text-center">
              Customize Your Capture ✨
            </h3>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
                ❌ {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-green-200 text-sm">
                ✅ {successMessage}
              </div>
            )}

            {/* Form Fields */}
            <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
              {/* Website URL */}
              <label className="text-sm font-semibold">🌍 Website URL:</label>
              <input 
                type="url" 
                placeholder="Paste your website link..."
                className="p-2 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />

              {/* Scroll Speed Selection */}
              <label className="text-sm font-semibold">⚡ GIF Scroll Speed:</label>
              <select 
                className="p-2 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(e.target.value)}
              >
                <option value="slow">🐢 Slow</option>
                <option value="medium">🚶‍♂️ Medium</option>
                <option value="fast">🚀 Fast</option>
              </select>

              {/* Download as ZIP Option */}
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="downloadZip" 
                  className="w-4 h-4 text-yellow-400 focus:ring-yellow-400"
                  checked={downloadAsZip}
                  onChange={(e) => setDownloadAsZip(e.target.checked)}
                />
                <label htmlFor="downloadZip" className="text-sm">Download as ZIP 📦</label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className={`mt-2 px-4 py-2 font-bold text-lg rounded-lg shadow-lg transition-all duration-300 w-full ${
                  isLoading 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-yellow-400 text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.8)]'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Generate ✨"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Endless Scrolling Warning Popup */}
      {isFormVisible && showScrollWarning && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          <div className="bg-black/70 fixed inset-0" onClick={dismissScrollWarning}></div>
          <div className="bg-red-900 border-2 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.5)] p-6 rounded-xl w-80 text-white relative z-[70]">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3">
              <div className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></div>
              <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
            </div>
            
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-red-200 text-lg font-bold">Important Warning</h3>
            </div>
            
            <p className="text-red-100 mb-4">
              Please make sure the website you're capturing <span className="font-bold underline">does not have endless scrolling</span>. 
              Sites with infinite scroll may cause issues with the GIF generation process.
            </p>
            
            <button 
              onClick={dismissScrollWarning}
              className="w-full py-2 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Loading Animation with Quotes */}
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-[70]">
          {/* Animated hourglass */}
          <div className="mb-8">
            <div className="relative w-20 h-32">
              {/* Top glass */}
              <div className="absolute top-0 left-0 w-20 h-16 border-4 border-yellow-400 border-b-0 rounded-t-full overflow-hidden">
                <div className="w-full h-full bg-yellow-400/20"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-full bg-yellow-400/30 blur-sm animate-pulse"></div>
              </div>
              
              {/* Middle connector */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full z-10"></div>
              
              {/* Bottom glass */}
              <div className="absolute bottom-0 left-0 w-20 h-16 border-4 border-yellow-400 border-t-0 rounded-b-full overflow-hidden">
                <div className="w-full h-full bg-yellow-400/5"></div>
                
                {/* Animated sand falling */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-yellow-400 animate-bounce opacity-80"></div>
                
                {/* Sand pile growing */}
                <div className="absolute bottom-0 left-0 w-full">
                  <div className="w-full h-4 bg-yellow-400 rounded-t-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quote display */}
          <div className="max-w-md px-8 py-6 bg-gray-900/80 rounded-xl border border-yellow-500/50 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
            <div className="flex flex-col items-center text-center">
              {/* Quote mark */}
              <span className="text-yellow-400 text-4xl mb-2">"</span>
              
              {/* Animated quote */}
              <p className="text-white font-serif text-xl mb-4 min-h-16 animate-fadeIn">
                {patienceQuotes[currentQuoteIndex]}
              </p>
              
              {/* Quote mark */}
              <span className="text-yellow-400 text-4xl">"</span>
            </div>
          </div>
          
          {/* Subtle indicator that processing is happening */}
          <div className="mt-12 flex items-center space-x-2">
            <div className="text-gray-400 italic">Processing your website</div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
  .animate-fadeIn {
    animation: fadeIn 3.5s ease-in-out;
  }
`;
document.head.appendChild(style);

export default Display;