"use client"
import React from 'react';
import Image from 'next/image';
import img1 from '../public/images/x.png';
import img2 from '../public/images/insta.png';
import img3 from '../public/images/f.png';
import logo from '../public/images/logo.jpg';
import Link from 'next/link';
function Footer() {
  return (
    <div className="mb-6 pt-16 sm:pt-8 lg:pt-12">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between md:justify-around px-4 lg:px-20">
        <Link href="/">
        <Image 
          src={logo} 
          alt="Sustainable Living Hub Logo" 
          width={160} 
          height={48} 
          className="h-12 w-40 sm:h-10 sm:w-36 lg:h-12 lg:w-40" 
        />
        </Link>
        <div className="flex flex-col sm:flex-row sm:gap-6 text-center sm:text-left">
          <Link href="/About"><button className="text-gray-600 hover:text-black font-medium">About Us</button></Link>
          <Link href="/Contact"><button className="text-gray-600 hover:text-black font-medium">Contact Us</button></Link>
          <Link href="/PrivacyPolicy"> <button className="text-gray-600 hover:text-black font-medium">Privacy Policy</button></Link>
          <button className="text-gray-600 hover:text-black font-medium">Terms of Service</button>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link href="https://x.com/">
                  <div className="h-7 w-7"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 50 50">
        <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z"></path>
        </svg></div></Link>
        <Link href="https://www.instagram.com/">
                  <div className="h-8 w-8"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 64 64">
        <path d="M 21.580078 7 C 13.541078 7 7 13.544938 7 21.585938 L 7 42.417969 C 7 50.457969 13.544938 57 21.585938 57 L 42.417969 57 C 50.457969 57 57 50.455062 57 42.414062 L 57 21.580078 C 57 13.541078 50.455062 7 42.414062 7 L 21.580078 7 z M 47 15 C 48.104 15 49 15.896 49 17 C 49 18.104 48.104 19 47 19 C 45.896 19 45 18.104 45 17 C 45 15.896 45.896 15 47 15 z M 32 19 C 39.17 19 45 24.83 45 32 C 45 39.17 39.169 45 32 45 C 24.83 45 19 39.169 19 32 C 19 24.831 24.83 19 32 19 z M 32 23 C 27.029 23 23 27.029 23 32 C 23 36.971 27.029 41 32 41 C 36.971 41 41 36.971 41 32 C 41 27.029 36.971 23 32 23 z"></path>
        </svg></div></Link>
        <Link href="https://www.github.com/">
                  <div className="h-8 w-8"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 64 64">
        <path d="M32 6C17.641 6 6 17.641 6 32c0 12.277 8.512 22.56 19.955 25.286-.592-.141-1.179-.299-1.755-.479V50.85c0 0-.975.325-2.275.325-3.637 0-5.148-3.245-5.525-4.875-.229-.993-.827-1.934-1.469-2.509-.767-.684-1.126-.686-1.131-.92-.01-.491.658-.471.975-.471 1.625 0 2.857 1.729 3.429 2.623 1.417 2.207 2.938 2.577 3.721 2.577.975 0 1.817-.146 2.397-.426.268-1.888 1.108-3.57 2.478-4.774-6.097-1.219-10.4-4.716-10.4-10.4 0-2.928 1.175-5.619 3.133-7.792C19.333 23.641 19 22.494 19 20.625c0-1.235.086-2.751.65-4.225 0 0 3.708.026 7.205 3.338C28.469 19.268 30.196 19 32 19s3.531.268 5.145.738c3.497-3.312 7.205-3.338 7.205-3.338.567 1.474.65 2.99.65 4.225 0 2.015-.268 3.19-.432 3.697C46.466 26.475 47.6 29.124 47.6 32c0 5.684-4.303 9.181-10.4 10.4 1.628 1.43 2.6 3.513 2.6 5.85v8.557c-.576.181-1.162.338-1.755.479C49.488 54.56 58 44.277 58 32 58 17.641 46.359 6 32 6zM33.813 57.93C33.214 57.972 32.61 58 32 58 32.61 58 33.213 57.971 33.813 57.93zM37.786 57.346c-1.164.265-2.357.451-3.575.554C35.429 57.797 36.622 57.61 37.786 57.346zM32 58c-.61 0-1.214-.028-1.813-.07C30.787 57.971 31.39 58 32 58zM29.788 57.9c-1.217-.103-2.411-.289-3.574-.554C27.378 57.61 28.571 57.797 29.788 57.9z"></path>
        </svg></div></Link>
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
