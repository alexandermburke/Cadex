'use client';

import React, { useEffect, useRef } from 'react';

export default function Product() {
  const scrollableRef = useRef(null);

  useEffect(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="relative w-full min-h-[60vh] bg-blue-950 drop-shadow-lg overflow-hidden flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-transparent rounded-lg">
        {/* Video Section */}
        <div className="flex flex-col overflow-hidden rounded-lg bg-transparent w-full md:w-3/4 max-w-full">
          <div className="rounded-t-xl p-4 bg-white h-12 opacity-60 flex items-center gap-2 my-0">
            {[1, 2, 3].map((val, i) => (
              <div
                key={i}
                className="rounded-full aspect-square bg-indigo-300 w-3 sm:w-3.5"
              />
            ))}
            <p className="text-slate-500 pl-2 text-base sm:text-lg font-light">
              cadexlaw.com/dashboard
            </p>
          </div>
          <div
            ref={scrollableRef}
            className="w-full aspect-video flex justify-center items-center rounded-lg overflow-hidden"
          >
            <video
              src="https://cdn.photogenius.ai/ninjachat-demo.mp4"
              controls
              autoPlay
              loop
              muted
              className="rounded-lg shadow-xl w-full h-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Text Section */}
        <div className="flex-col bg-transparent flex justify-center items-start p-4 lg:p-6 w-full md:w-1/4">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4">
            Experience Cadex <span className="goldSolid">Free</span>
          </h3>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-6 leading-relaxed max-w-md">
            Cadex is your ultimate tool for legal studying.
          </p>
          <a
            href="http://cadexlaw.com/pricing"
            className="relative h-12 w-56 text-xl overflow-hidden rounded goldBackground text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 flex items-center justify-center"
          >
            Try Free for 7 Days
          </a>
        </div>
      </div>
    </div>
  );
}
