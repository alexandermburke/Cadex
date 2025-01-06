'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Product() {
  const imgFile = '/demo.png';

  const scrollableRef = useRef(null);

  useEffect(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="relative w-full min-h-[80vh] bg-blue-950 drop-shadow-lg overflow-hidden flex items-center justify-center">
      <div className="flex flex-row w-3/4 max-w-3/4 bg-transparent rounded-lg">
          <div className="flex flex-col overflow-hidden rounded-lg bg-transparent w-11/12 sm:w-2/3 max-w-full">
            <div className="rounded-t-xl p-4 bg-white h-12 opacity-60 flex items-center gap-2 my-0">
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
            <div className="w-full h-full flex justify-start items-center rounded-lg overflow-y-auto">
              <Image
                src={imgFile}
                alt="Demo Screenshot"
                width={1920}
                height={1080} 
                objectFit="cover"
                className="rounded-lg shadow-xl w-full"
                unoptimized={true}
                quality={100}
              />
            </div>
          </div>
        
        <div className="flex-col bg-transparent flex justify-center items-start p-4 lg:p-6">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4">
            Experience Cadex <span className="goldGradient">free</span>
          </h3>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-6 leading-relaxed max-w-md">
            Cadex is your ultimate tool for legal education. From interactive simulations to powerful exam prep, discover how Cadex can enhance your journey.
          </p>
          <a
            href="https://demo.cadexlaw.com"
            className={`before:ease relative h-12 w-56 overflow-hidden rounded goldBackground text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 flex items-center justify-center`}
          >
            Try our Demo
          </a>
        </div>
      </div>
    </div>
  );
}
