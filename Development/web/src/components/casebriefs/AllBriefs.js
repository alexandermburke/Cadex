'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// Firebase
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Auth
import { useAuth } from '@/context/AuthContext';

export default function AllBriefs() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();

  // Dark mode
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Large DB of case briefs
  const [allCaseBriefs, setAllCaseBriefs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [selectedBrief, setSelectedBrief] = useState(null);
  const [chatGptSummary, setChatGptSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data
  useEffect(() => {
    if (currentUser) {
      fetchAllBriefs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchAllBriefs = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const qRef = query(
        collection(db, 'allCaseBriefs'),
        orderBy('year', 'desc') // Example ordering
      );
      const querySnapshot = await getDocs(qRef);
      const loaded = [];
      querySnapshot.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() }));
      setAllCaseBriefs(loaded);
    } catch (err) {
      console.error('Error fetching all briefs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // If not logged in
  if (!currentUser) {
    return (
      <div
        className={`flex items-center justify-center h-screen transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white'
            : 'bg-gradient-to-br from-gray-100 to-white text-gray-800'
        }`}
      >
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
          <p className="mb-4 text-lg font-semibold">
            Please log in to access the full database of case briefs.
          </p>
          <button
            onClick={() => router.push('/login')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-950 hover:bg-blue-800 text-white'
            }`}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Filter
  const filteredBriefs = allCaseBriefs.filter((brief) => {
    const s = searchTerm.toLowerCase();
    return (
      brief.title.toLowerCase().includes(s) ||
      brief.court?.toLowerCase().includes(s) ||
      (brief.content && brief.content.toLowerCase().includes(s)) ||
      (brief.year && String(brief.year).includes(s))
    );
  });

  const openBrief = (brief) => {
    setSelectedBrief(brief);
    setChatGptSummary('');
  };

  const closeBrief = () => {
    setSelectedBrief(null);
    setChatGptSummary('');
  };

  const handleSummarize = async () => {
    if (!selectedBrief?.content) return;
    setIsSummaryLoading(true);
    setChatGptSummary('');

    try {
      const response = await fetch('/api/chatgpt-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedBrief.content }),
      });
      if (!response.ok) throw new Error('Failed to summarize with ChatGPT');

      const { summary } = await response.json();
      setChatGptSummary(summary);
    } catch (err) {
      console.error('Error calling ChatGPT Summarize API:', err);
      alert('Unable to summarize this case right now.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  return (
    <div
      className={`relative flex h-screen transition-colors duration-500 ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white'
          : 'bg-gradient-to-br from-gray-100 to-white text-gray-800'
      }`}
    >
      {/* Sidebar + overlay */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/lawtools/allbriefs"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
              isDarkMode={isDarkMode}
            />
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col px-6 py-4 overflow-auto">
        {/* Top area */}
        <div className="flex items-center justify-between mb-6">
          {/* Toggle button (Mobile) */}
          <button
            onClick={toggleSidebar}
            className="text-white p-2 rounded transition-colors hover:bg-white hover:bg-opacity-20 focus:outline-none md:hidden"
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

          {/* Search bar */}
          <div className="flex items-center bg-white/20 dark:bg-white/10 rounded-full px-3 py-2">
            <FaSearch className="text-white/70 mr-2" />
            <input
              type="text"
              placeholder="Search Case Briefs..."
              className="bg-transparent placeholder-white/70 focus:outline-none text-sm text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Cross navigation */}
          <div className="flex gap-3">
            <Link
              href="/lawtools/casesummaries"
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
            >
              Case Summaries
            </Link>
            <Link
              href="/lawtools/caseanalysis"
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
            >
              Case Analysis
            </Link>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 w-full max-w-5xl mx-auto rounded-2xl shadow-xl p-6 backdrop-blur-md bg-white/30 dark:bg-slate-700/30 overflow-auto">
          {isLoading ? (
            <div className="w-full h-1 bg-blue-500 animate-pulse" />
          ) : filteredBriefs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
              {filteredBriefs.map((brief) => (
                <div
                  key={brief.id}
                  onClick={() => openBrief(brief)}
                  className="p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold line-clamp-1 dark:text-white">
                      {brief.title}
                    </h3>
                    <span className="text-xs py-1 px-2 rounded-full bg-blue-900 text-white dark:bg-blue-200 dark:text-blue-900">
                      {brief.court || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Year: {brief.year || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                    {brief.content?.slice(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/80 text-sm">
              {searchTerm
                ? 'No matching briefs found.'
                : 'No briefs available at the moment.'}
            </p>
          )}
        </div>
      </main>

      {/* Brief Modal */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            className="relative w-11/12 max-w-3xl p-6 rounded-2xl shadow-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-2">{selectedBrief.title}</h2>
            <p className="text-sm mb-4 text-gray-500 dark:text-gray-400">
              Court: {selectedBrief.court || 'Unknown'} | Year: {selectedBrief.year || 'N/A'}
            </p>
            <div className="max-h-64 overflow-auto border-b border-gray-300 pb-3 mb-4">
              <p className="leading-relaxed whitespace-pre-wrap text-sm">
                {selectedBrief.content}
              </p>
            </div>

            {/* Summarize */}
            <div className="mb-4">
              <button
                onClick={handleSummarize}
                className={`inline-block px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-950 hover:bg-blue-800 text-white'
                }`}
              >
                {isSummaryLoading ? 'Summarizing...' : 'Ask ChatGPT for Summary'}
              </button>
              {chatGptSummary && (
                <div className="mt-4 p-3 rounded-md bg-white dark:bg-slate-700 border border-blue-200 dark:border-blue-600">
                  <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-300">
                    AI-Generated Summary
                  </h3>
                  <p className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-100">
                    {chatGptSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Close */}
            <div className="text-right">
              <button
                onClick={closeBrief}
                className={`inline-block px-5 py-2 rounded-md font-semibold text-sm transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-950 hover:bg-blue-800 text-white'
                }`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
