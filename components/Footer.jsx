"use client"
import React from 'react';
import Image from 'next/image';
import img1 from '../public/images/x.png';
import img2 from '../public/images/insta.png';
import img3 from '../public/images/f.png';
import logo from '../public/images/logo.jpg';

function Footer() {
  return (
    <div className="mb-6 pt-16 sm:pt-8 lg:pt-12">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between md:justify-around px-4 lg:px-20">
        
        <Image 
          src={logo} 
          alt="Sustainable Living Hub Logo" 
          width={160} 
          height={48} 
          className="h-12 w-40 sm:h-10 sm:w-36 lg:h-12 lg:w-40" 
        />
        
        <div className="flex flex-col sm:flex-row sm:gap-6 text-center sm:text-left">
          <button className="text-gray-600 hover:text-black font-medium">About Us</button>
          <button className="text-gray-600 hover:text-black font-medium">Contact Us</button>
          <button className="text-gray-600 hover:text-black font-medium">Privacy Policy</button>
          <button className="text-gray-600 hover:text-black font-medium">Terms of Service</button>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Image src={img1} alt="X logo" width={28} height={28} className="h-7 w-7" />
          <Image src={img2} alt="Instagram logo" width={32} height={32} className="h-8 w-8" />
          <Image src={img3} alt="Facebook logo" width={32} height={32} className="h-8 w-8" />
        </div>
      </div>
      
      <div className="pt-6 flex justify-center text-center">
        <p className="text-gray-600 text-sm sm:text-base">
          © 2024 Sustainable Living Hub. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Footer;
