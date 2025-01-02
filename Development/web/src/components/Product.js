'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Product() {
  // Replace '/demo.png' with the actual path to your PNG file
  const imgFile = '/demo.png';

  // Reference to the scrollable container
  const scrollableRef = useRef(null);

  useEffect(() => {
    // Ensure the container scrolls to the top on render
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-blue-950 drop-shadow-lg overflow-hidden">
      {/* Header Container */}
      <div className="text-center mb-4 my-6">
        <h3 className="text-6xl sm:text-6xl font-semibold text-white mb-10">
          Try our Demo for free
        </h3>
      </div>

      {/* Outer container */}
      <div className="flex flex-col dropShadow overflow-hidden rounded-lg mx-auto bg-transparent w-11/12 sm:w-3/4 max-w-full">
        {/* Header / Toolbar area */}
        <div className="rounded-t-xl p-4 bg-white h-full opacity-60 flex items-center gap-2 my-0">
          {[1, 2, 3].map((val, i) => (
            <div
              key={i}
              className="rounded-full aspect-square bg-indigo-300 w-3 sm:w-3.5"
            />
          ))}
          <p className="text-slate-500 pl-2 text-base sm:text-lg font-light">
            demo.cadexlaw.com
          </p>
        </div>

        {/* Main preview section */}
        <div
          ref={scrollableRef} // Attach reference for scrolling
          className="
            relative
            w-full
            h-3/4
            max-h-[80vh]
            bg-blue-950
            rounded-md
            drop-shadow-xl
            flex
            justify-center
            items-start
            overflow-hidden
            overflow-y-scroll
          "
        >
          {/* Optimized Image */}
          <a href="https://demo.cadexlaw.com" target="_blank" rel="noopener noreferrer">
            <Image
              src={imgFile}
              alt="Demo Preview"
              layout="responsive" // Makes the image responsive
              width={1920} // Provide the image's natural width
              height={1080} // Provide the image's natural height
              objectFit="contain" // Ensures the image scales proportionally
              priority // Ensures the image is loaded early for better LCP
              className="rounded-md cursor-pointer transform scale-102" // Adds a pointer cursor for interactivity
              unoptimized={true}
              quality={100}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
