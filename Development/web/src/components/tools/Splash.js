'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';
import { FaTimes, FaBars } from 'react-icons/fa';

export default function Splash() {
  const { currentUser } = useAuth();
  const router = useRouter();

  // Sidebar state
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // If user is not logged in, show a login prompt
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

  // Animations for splash content
  const headlineVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const paragraphVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.3, duration: 0.8 } },
  };

  return (
    <>
      {/* Keyframes and class for the animated gradient */}
      <style jsx>{`
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animated-gradient {
          background: linear-gradient(
            120deg,
            #7e22ce,
            #8b5cf6,
            #1e3a8a
          );
          background-size: 300% 300%;
          animation: gradientAnimation 10s ease infinite;
        }
      `}</style>

      <div className="flex h-screen animated-gradient rounded shadow-md z-[150] text-white">
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
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-auto relative">
          {/* Mobile toggle (small screens) */}
          <div className="absolute top-4 left-4 md:hidden">
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              {isSidebarVisible ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Splash hero content */}
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
              Welcome to Your Dashboard, <span>User</span>
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-gray-100 mb-8"
              variants={paragraphVariants}
            >
              Explore a variety of LLM-powered law study aids and resources to help you
              succeed. Pick from the options in the sidebar to start your journey.
            </motion.p>
          </motion.div>
        </main>
      </div>
    </>
  );
}