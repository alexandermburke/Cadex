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
        <div
          className="relative mx-auto my-auto"
          style={{ width: 'min(44px, 25vw)', height: 'min(44px, 25vw)' }}
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
