"use client"
import React, { useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Image component
import img1 from '../public/images/x.png';
import img2 from '../public/images/insta.png';
import img3 from '../public/images/f.png';
import f1 from '../public/images/f1.jpg';
import f2 from '../public/images/f2.jpg';
import f3 from '../public/images/f3.jpg';
import f4 from '../public/images/f4.jpg';
import f5 from '../public/images/f5.jpg';
import f6 from '../public/images/f6.png';
import f7 from '../public/images/f7.jpeg';
import f8 from '../public/images/f8.jpeg';
import f9 from '../public/images/f9.jpeg';
import logo from '../public/images/logo.jpg';

function Footer() {
  const images = [f1, f2, f3, f4, f5, f6, f7, f8, f9]; // Array
  const containerRef = useRef(null);
  const imageRefs = useRef([]);
  const containerWidth = useRef(0); // Store container width
  const imageWidth = 218; // Image width + gap (200px + 25px)
  let animationFrameId = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    containerWidth.current = container.offsetWidth;

    const moveImages = () => {
      imageRefs.current.forEach((image) => {
        if (image) {
          let currentPosition = parseFloat(image.style.transform.replace('translateX(', '').replace('px)', '')) || 0;

          // Move each image to the left
          currentPosition -= 0.45; // Adjust speed of the scroll
          image.style.transform = `translateX(${currentPosition}px)`;

          // If the image has fully exited the left side, reset it to the right side with a buffer
          if (currentPosition <= -imageWidth) {
            image.style.transform = `translateX(${containerWidth.current + imageWidth}px)`; // Add buffer
          }
        }
      });

      // Keep the animation going
      animationFrameId.current = requestAnimationFrame(moveImages);
    };

    moveImages();

    // Cleanup function on unmount to cancel the animation
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  return (
    <div className="mb-6 pt-36 sm:pt-0">
      <div style={{ marginTop: '5rem', marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Moving image carousel */}
        <div
          ref={containerRef}
          className="carousel-container"
          style={{
            display: 'flex',
            marginTop: '1rem',
            marginBottom: '2rem',
            overflow: 'hidden',
            width: '100%',
            height: '200px', // Adjust height to allow space above and below the images
            position: 'relative',
          }}
        >
          {images.map((imageSrc, index) => (
            <div
              ref={(el) => (imageRefs.current[index] = el)}
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `translateX(${index * imageWidth}px)`, // Positioning images side-by-side
                position: 'absolute',
                top: '0px',
              }}
            >
              <Image
                src={imageSrc}
                alt={`Image ${index + 1}`} // Meaningful alt text
                width={200} // Specify the width
                height={150} // Specify the height
                style={{
                  borderRadius: '10px',
                  objectFit: 'cover', // Maintain aspect ratio
                }}
              />
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#333' }}>
                Image {index + 1}
              </p>
            </div>
          ))}
        </div>

        {/* Rest of your footer content */}
        <div className="flex text-sm flex-col items-center sm:flex-row sm:gap-7 md:justify-around gap-9">
          <Image src={logo} alt="Sustainable Living Hub Logo" width={160} height={48} className="md:h-12 md:w-40 w-40 h-12" />
          <div className="flex sm:flex-row sm:gap-7 justify-evenly gap-4">
            <button className="bg-none text-gray-600 hover:text-black font-bold">About Us</button>
            <button className="bg-none text-gray-600 hover:text-black font-bold">Contact Us</button>
            <button className="bg-none text-gray-600 hover:text-black font-bold">Privacy Policy</button>
            <button className="bg-none text-gray-600 hover:text-black font-bold">Terms of Service</button>
          </div>
          <div className="flex gap-5 justify-center">
            <Image src={img1} alt="X logo" width={28} height={28} className="h-7 w-7" />
            <Image src={img2} alt="Instagram logo" width={32} height={32} className="h-8 w-8" />
            <Image src={img3} alt="Facebook logo" width={32} height={32} className="h-8 w-8" />
          </div>
        </div>
        <div className="flex w-fit text-wrap justify-center text-center md:pl-32 pt-6 md:text-left">
          <p className="self-center ml-7 w-fit md:ml-0 text-gray-600 pt-3 md:text-left text-center">
            © 2021 Sustainable Living Hub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
