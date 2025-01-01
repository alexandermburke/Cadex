// components/CoolLayout.js

'use client';

import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';

export default function CoolLayout({ children }) {
 
  const { currentUser, userDataObj } = useAuth();
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
      className={`flex flex-col flex-1 w-full transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-b from-blue-950 to-slate-950'
          : 'bg-gray-50'
      }`}
    >
      <Header />
      {children}
      <Footer />
    </div>
  );
}
