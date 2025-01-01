'use client';

import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '100', '200', '300', '500', '600', '700'],
});

export default function LogoFiller() {
   const pathname = usePathname();
   const { currentUser, logout, userDataObj } = useAuth();
   const isDemoUser = currentUser?.uid === 'demo-user-uid';
   const [isDarkMode, setIsDarkMode] = useState(false);
    
      useEffect(() => {
        if (isDemoUser) {
          const storedDarkMode = localStorage.getItem('demoDarkMode');
          setIsDarkMode(storedDarkMode === 'true');
        } else {
          setIsDarkMode(userDataObj?.darkMode || false);
        }
      }, [isDemoUser, userDataObj?.darkMode]);
      useEffect(() => {
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, [isDarkMode]);
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
            width={16}
            height={16}
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
