"use client";
import React, { useState } from 'react';

function HomePage() {
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(null);

  const handlePredefinedAmountClick = (amount, index) => {
    setSelectedAmount(amount);
    setCustomAmount(''); 
    setSelectedButtonIndex(index); 
  };

  const handleCustomAmountChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedButtonIndex(null);
    }
  };

  const handleContinueClick = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    window.location.href = `/FoodHub/Payment?amount=${finalAmount}`; 
  };

  return (
    <div className="h-screen bg-[#f9f6f4] w-screen flex flex-col items-center"> 
      <div className="flex pt-28 flex-row w-[80%] h-96 mt-8">
        <div className="flex-1 w-1/2 text-center content-center text-3xl">
          <p 
            style={{ 
              fontFamily: '"Source Serif 4", Georgia, serif', 
              letterSpacing: '-0.5px', 
              lineHeight: '56px' 
            }} 
            className='pt-10 text-gray-800' 
          >
            “Every gift counts. Join us in creating change, One donation at a time.”
          </p>
        </div>
        <div className="flex-1 flex h-full w-1/2 justify-center items-center">
          <div className="border-2 border-gray-300 p-6 w-[55%] h-full rounded-lg text-center bg-white shadow-md"> 
            <div className="grid grid-cols-3 pb-4 gap-2">
              {[10, 25, 50, 100, 500, 1000].map((amount, index) => (
                <button
                  key={amount}
                  className={`border py-2 rounded text-lg ${
                    selectedButtonIndex === index ? 'bg-green-400 text-white' : 'hover:bg-green-400 hover:text-white border-gray-300' 
                  }`}
                  onClick={() => handlePredefinedAmountClick(parseFloat(amount), index)}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Enter Custom Amount"
              className="border border-gray-300 w-full py-2 px-4 rounded text-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
              value={customAmount}
              onChange={handleCustomAmountChange}
              step={50}
            />
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 mt-4 rounded text-lg font-medium transition duration-200" 
              onClick={handleContinueClick}
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;