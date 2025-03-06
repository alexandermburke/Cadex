'use client';

import React from 'react';

export default function Product() {
  return (
    <div className="relative w-full min-h-[60vh] bg-blue-950 drop-shadow-lg overflow-hidden flex items-center justify-center p-4">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6">
          Welcome to CadexLaw
        </h1>
        <p className="text-xl sm:text-2xl text-gray-200 mb-8">
          Where innovation meets excellence. Discover a world of endless possibilities.
        </p>
        <a
          href="http://cadexlaw.com/pricing"
          className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded shadow-lg transition transform hover:scale-105"
        >
          Discover More
        </a>
      </div>
    </div>
  );
}
