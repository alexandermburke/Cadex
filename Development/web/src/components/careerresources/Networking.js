'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

export default function NetworkingOpportunities() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const response = await fetch('/api/networkingopps');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (!currentUser) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center h-full transition-colors',
          isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-800'
        )}
      >
        <div
          className={clsx(
            'p-6 rounded-2xl shadow-xl text-center',
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          )}
        >
          <p className="mb-4 text-lg font-semibold">
            Please log in to access Networking Opportunities.
          </p>
          <button
            onClick={() => router.push('/login')}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300',
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-950 hover:bg-blue-800 text-white'
            )}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Framer Motion variants for the main container
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeInOut' }
    }
  };

  return (
    <div
      className={clsx(
        'relative flex h-screen transition-colors duration-500',
        isDarkMode ? 'text-white' : 'text-gray-800'
      )}
    >
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/lawtools/networking"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
              isDarkMode={isDarkMode}
            />
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col px-6 relative z-50 h-screen">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className={clsx(
              'text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden'
            )}
            aria-label={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isSidebarVisible ? (
                <motion.div
                  key="close-icon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaTimes size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="bars-icon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaBars size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <motion.div
          className={clsx(
            'flex-1 w-full rounded-2xl shadow-xl p-6',
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-gray-800'
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading && (
            <p className="text-sm animate-pulse">Loading networking events...</p>
          )}
          {fetchError && (
            <p className="text-sm text-red-500">Error: {fetchError}</p>
          )}

          {!isLoading && !fetchError && events.length === 0 && (
            <p className="text-sm">No events found for this week.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => window.open(event.link, '_blank')}
                className={clsx(
                  'rounded-lg p-4 shadow-md border cursor-pointer transform transition-transform hover:scale-105',
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-gray-50 border-gray-200'
                )}
              >
                <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                <p className="text-sm mb-1">
                  <strong>Date: </strong>
                  {event.date}
                </p>
                <p className="text-sm mb-2">
                  <strong>Location: </strong>
                  {event.location}
                </p>
                <p className="text-sm">{event.description}</p>
              </div>
            ))}
          </div>

          {/* Additional content for law students */}
          <div className="mt-8">
            <p className="text-sm mb-4">
              These opportunities are updated weekly to ensure you don&apos;t miss out on new events. 
              Whether you’re looking to meet established legal practitioners, grow your professional 
              circle, or discover mentorship opportunities, staying active in the networking scene 
              can significantly influence your legal career.
            </p>

            <h3 className="text-lg font-semibold mb-2">Tips for Law Students:</h3>
            <ul className="list-disc ml-5 text-sm mb-4">
              <li className="mb-2">
                <strong>Prepare an Elevator Pitch:</strong> Have a concise introduction ready—who you 
                are, what you’re studying, and your areas of interest.
              </li>
              <li className="mb-2">
                <strong>Ask Thoughtful Questions:</strong> Show genuine curiosity about other attendees’ 
                practice areas, career paths, and experiences in the legal field.
              </li>
              <li className="mb-2">
                <strong>Bring Business Cards (if appropriate):</strong> A simple card with your contact 
                information can help new contacts remember you and follow up.
              </li>
              <li className="mb-2">
                <strong>Follow Up Promptly:</strong> Connect on LinkedIn or send a brief email 
                within a day or two of meeting someone. A simple follow-up goes a long way in 
                building lasting professional relationships.
              </li>
            </ul>

            <p className="text-sm">
              Networking isn’t just about collecting business cards; it’s about fostering genuine 
              relationships that can help you explore the legal world and potentially find 
              mentorship or job opportunities. Check back next week to see what new events have 
              been added!
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
