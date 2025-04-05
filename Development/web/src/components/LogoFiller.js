'use client';

import React from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function LogoFiller() {
  const { userDataObj } = useAuth() || {};
  const isDarkMode = userDataObj?.darkMode || false;

  return (
    <div
      className={`grid place-items-center flex-1 text-center ${
        isDarkMode ? 'text-gray-300' : 'text-slate-300'
      }`}
    >
      <div className="flex flex-col items-center gap-2 font-medium">
        {/* Header Image */}
        <div
          className="relative mx-auto my-auto"
          style={{ width: 'min(75px, 45vw)', height: 'min(75px, 45vw)' }}
        >
          <Image
            src="/header.avif"
            alt="CadexLaw Logo"
            layout="fill"
            objectFit="cover"
            className="rounded-full"
            unoptimized={true}
            quality={'100'}
          />
        </div>
        {/* Italian Tri-Color Flag */}
        <div className="flex items-center justify-center mt-2">
        <div className="flex rounded-full overflow-hidden">
            <span className="block w-6 h-1 bg-red-600 transform -skew-x-12"></span>
            <span className="block w-6 h-1 bg-white transform -skew-x-12"></span>
            <span className="block w-6 h-1 bg-blue-900 transform -skew-x-12"></span>
          </div>
        </div>
        {/* Slogan */}
        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-500'} ${poppins.className}`}>
        Empowering your legal journey with precision and clarity.
        </p>
      </div>
    </div>
  );
}
