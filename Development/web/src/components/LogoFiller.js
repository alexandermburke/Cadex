'use client';

import React from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
// Import your AuthContext or theme context
import { useAuth } from '@/context/AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function LogoFiller() {
  // Grab your dark mode setting from Auth or theme context
  const { userDataObj } = useAuth() || {};
  const isDarkMode = userDataObj?.darkMode || false;

  return (
    <div
      className={`
        grid place-items-center flex-1 text-center 
        ${isDarkMode ? 'text-gray-300' : 'text-slate-300'}
      `}
    >
      <div className="flex flex-col items-center gap-2 font-medium">
        {/* Header Image */}
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 mx-auto my-auto">
          <Image
            src="/header.avif"
            alt="CadexLaw Logo"
            width={144}
            height={144}
            className="w-12 h-12 sm:mr-4 mb-4"
            unoptimized={true}
          />
        </div>
        {/* Text Content */}
        <h4
          className={
            'text-xl px-3 sm:text-2xl goldGradient font-medium sm:px-4 ' +
            poppins.className
          }
        >
          CadexLaw
        </h4>
        <p
          className={
            isDarkMode
              ? 'text-gray-200'
              : 'text-blue-950'
          }
        >
          Elevate your legal studies
          <br />
          Dive into interactive case simulations to enhance your skills
        </p>
      </div>
    </div>
  );
}
