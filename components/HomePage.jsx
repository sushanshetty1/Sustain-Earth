"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function HomePage() {
  const [isSignedIn, setIsSignedIn] = useState(false); // State to track sign-in status
  const [isClient, setIsClient] = useState(false); // Flag to check if running on client-side
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Set to true once the component is mounted (client-side)
    
    if (typeof window !== 'undefined') {
      // Now we can safely access localStorage
      const user = localStorage.getItem('user');
      if (user) {
        setIsSignedIn(true); // If user is found in localStorage, mark as signed in
      }
    }
  }, []);

  const handleClick = () => {
    const randomPage = getRandomPage(); // Get a random page URL
    router.push(randomPage); // Navigate to the random page
  };

  const getRandomPage = () => {
    const pages = ["/FoodHub", "/MarketPlace/GreenMarket", "/Learn&Share/Learn"];
    const randomIndex = Math.floor(Math.random() * pages.length);
    return pages[randomIndex];
  };

  // Render nothing or a loading indicator if not on the client yet
  if (!isClient) {
    return null; // Or you can return a loading spinner
  }

  return (
    <header className="h-screen p-4">
      <div className="mb-48 items-center text-center flex flex-col justify-center mt-20">
        {/* Responsive box for title */}
        <div 
          style={{ 
            fontFamily: '"Source Serif 4", Georgia, serif',
            lineHeight: '1' 
          }}
        >
          <p className="w-80 sm:w-[450px] border-2 rounded-full font-bold flex items-center justify-center text-center bg-[#ffc8a2] border-[#ffc8a2] text-[13px] sm:text-[18px] py-2 sm:py-3">
            The Community Hub for Sustainable Living
          </p>
        </div>

        {/* Detailed text for larger screens */}
        <p 
          style={{ 
            fontFamily: '"Source Serif 4", Georgia, serif', 
            letterSpacing: '-0.5px', 
            lineHeight: '56px' 
          }} 
          className="mt-9 mb-9 text-[48px] font-normal hidden lg:block"
        >
          <span className="block">Join a global movement towards sustainable practices</span>
          <span className="block">collaborate, share, and contribute</span>
          <span>to make a lasting impact</span>
        </p>

        {/* Simplified text for smaller screens */}
        <p 
          style={{
            fontFamily: '"Source Serif 4", Georgia, serif', 
            fontWeight: 'bold'
          }} 
          className="mt-6 mb-6 text-[41px] font-semibold block lg:hidden"
        >
          Join the Global Movement for Sustainable Impact.
        </p>

        <p
          style={{ 
            fontFamily: '"Arial", "Verdana", sans-serif', 
            lineHeight: '36px' 
          }} 
          className="text-[20px] leading-8 font-normal"
        >
          Connect, collaborate, and share to create meaningful change for a sustainable future.
        </p>

        <button 
          onClick={handleClick} 
          style={{ fontFamily: '"Josefin Sans", sans-serif' }} 
          className="mt-9 px-2 py-2 font-bold text-white rounded-full h-14 transition duration-400 bg-black hover:bg-gray-700 w-36"
        >
          Explore
        </button>
      </div>
    </header>
  );
}

export default HomePage;
