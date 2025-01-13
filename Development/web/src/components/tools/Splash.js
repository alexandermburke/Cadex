'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';
import { FaTimes, FaBars } from 'react-icons/fa';

/* Generate snowflake metadata */
const generateSnowflakes = (count) => {
  const snowflakes = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 10 + 5; // 5px - 15px
    snowflakes.push({
      id: i,
      left: Math.random() * 100,  // left position (%)
      delay: Math.random() * 5,   // random delay
      duration: Math.random() * 5 + 5, // 5s - 10s
      size,
      opacity: Math.random() * 0.5 + 0.4, // 0.4 - 0.9
      blur: Math.random() * 2 + 1, // 1px - 3px blur
    });
  }
  return snowflakes;
};

const snowflakeData = generateSnowflakes(50);

export default function Splash() {
  const { currentUser } = useAuth();
  const router = useRouter();

  // Sidebar state
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // If user not logged in, show login prompt
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-gray-700">
        <div className="text-center p-6 bg-white rounded shadow-md">
          <p className="text-gray-700 mb-4">
            Please{' '}
            <a href="/login" className="text-blue-900 underline">
              log in
            </a>{' '}
            to use the Dashboard.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Framer Motion variants for hero text
  const headlineVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const paragraphVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.3, duration: 0.8 } },
  };

  return (
    <div className="relative flex h-screen text-white">
      {/* Swirling AI-like background layer */}
      <div className="animatedBackground" />

      {/* Snowflake particle layer */}
      <div className="snowflake-container">
        {snowflakeData.map((flake) => (
          <span
            key={flake.id}
            className="snowflake"
            style={{
              left: `${flake.left}%`,
              fontSize: `${flake.size}px`,
              animation: `snowfall ${flake.duration}s linear ${flake.delay}s infinite`,
              opacity: flake.opacity,
              filter: `blur(${flake.blur}px)`,
            }}
          >
            ❄
          </span>
        ))}
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink=""
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
              isAiTutor={false} // or true if needed
            />
            {/* Overlay for mobile */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-auto relative z-50">
        {/* Mobile toggle (small screens) */}
        <div className="absolute top-4 left-4 md:hidden">
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            {isSidebarVisible ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Hero / splash content */}
        <motion.div
          className="max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl font-bold mb-6 drop-shadow-lg"
            variants={headlineVariants}
          >
            Welcome to Your Dashboard,{' '}
            <span>
              {currentUser?.displayName || 'User'}
            </span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-100 mb-8"
            variants={paragraphVariants}
          >
            Explore a variety of law study aids and resources to help you
            succeed. Pick from the options in the sidebar to start your work.
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
