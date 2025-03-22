'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar';
import { FaTimes, FaBars } from 'react-icons/fa';

const generateSnowflakes = (count) => {
  const snowflakes = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 10 + 5;
    snowflakes.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 5 + 5,
      size,
      opacity: Math.random() * 0.5 + 0.4,
      blur: Math.random() * 2 + 1,
    });
  }
  return snowflakes;
};

const snowflakeData = generateSnowflakes(50);

export default function Splash() {
  const { currentUser, userDataObj } = useAuth();
  const router = useRouter();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

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

  const headlineVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const recentActivity = userDataObj?.recentActivity || [];

  const formatDate = (isoString) => {
    if (!isoString) return null;
    const d = new Date(isoString);

    const dateStr = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const timeStr = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { dateStr, timeStr };
  };

  return (
    <div className="relative flex h-screen text-white">
      {/* Snowflake container remains on the outer container */}
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
              isAiTutor={false}
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

      {/* Main content area with updated container size/position */}
      <main className="flex-1 flex flex-col px-6 relative z-200 h-screen">
        <div className="relative flex-1 w-full bg-transparent rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto flex flex-col items-center">
          {/* Animated background applied only to this inner div */}
          <div className="animatedBackground absolute inset-0" />
          {/* Updated container now centers its content */}
          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="absolute top-4 left-4 md:hidden">
              <button
                onClick={toggleSidebar}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                {isSidebarVisible ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>

            {/* Hero */}
            <motion.div
              className="max-w-4xl text-center"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
            >
              <motion.h1
                className="text-4xl sm:text-5xl font-bold mb-6 drop-shadow-lg mt-20"
                variants={headlineVariants}
              >
                Welcome to Your Dashboard,{' '}
                <span>{currentUser?.displayName || 'User'}</span>
              </motion.h1>
            </motion.div>

            {/* Recent Activity Section */}
            {recentActivity.length > 0 && (
              <motion.div
                className="w-full max-w-2xl mt-8"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
              >
                <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4 text-center">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {recentActivity.map((activity, idx) => {
                      const { dateStr, timeStr } = formatDate(activity.date) || {};
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-md bg-gray-900 bg-opacity-20 hover:bg-opacity-30 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div>
                              {activity.type === 'brief' ? (
                                <div className="font-semibold text-sm mb-1">
                                  Viewed a case brief:
                                  <span className="ml-1 italic">
                                    {activity.name}
                                  </span>
                                </div>
                              ) : (
                                <div className="font-semibold text-sm mb-1">
                                  Some other activity:
                                  <span className="ml-1 italic">
                                    {activity.name}
                                  </span>
                                </div>
                              )}
                            </div>
                            {dateStr && timeStr && (
                              <div className="text-xs text-gray-200 mt-2 sm:mt-0 sm:ml-2 flex-shrink-0">
                                <div>{dateStr}</div>
                                <div>{timeStr}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
