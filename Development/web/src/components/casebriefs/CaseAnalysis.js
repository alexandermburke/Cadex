'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// Auth
import { useAuth } from '@/context/AuthContext';

export default function CaseAnalysis() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();

  // Determine dark mode
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Analysis states
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisDetails, setAnalysisDetails] = useState('');
  const [analysisList, setAnalysisList] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Add a new analysis to local state
  const handleAddAnalysis = () => {
    if (!analysisTitle.trim() || !analysisDetails.trim()) return;
    if (!currentUser) {
      alert('You must be logged in to save your analysis.');
      return;
    }

    const newAnalysis = {
      title: analysisTitle.trim(),
      details: analysisDetails.trim(),
      timestamp: Date.now(),
    };
    setAnalysisList([...analysisList, newAnalysis]);
    setAnalysisTitle('');
    setAnalysisDetails('');
  };

  // Open analysis modal
  const openAnalysis = (analysis) => {
    setSelectedAnalysis(analysis);
  };

  // Close analysis modal
  const closeAnalysis = () => {
    setSelectedAnalysis(null);
  };

  // Redirect if not logged in
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
            Please log in to access Case Analysis.
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

  return (
    <div
      className={`relative flex h-screen transition-colors duration-500 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}
    >
      {/* SIDEBAR & MOBILE OVERLAY */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/casebriefs/analysis"
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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col px-6 relative z-50 h-screen">
        {/* Mobile toggle button (appears only on smaller screens) */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden"
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

        {/* MAIN WRAPPER: replicate the style of other pages */}
        <div
          className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto ${
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-gray-800'
          } flex flex-col`}
        >
          {/* HEADER / LINKS */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Case Brief Analysis</h1>

            {/* Optional cross-links to other tools */}
            <div className="flex gap-3">
              <Link
                href="/casebriefs/allbriefs"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                All Briefs
              </Link>
              <Link
                href="/casebriefs/summaries"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Case Summaries
              </Link>
            </div>
          </div>

          {/* CONTENT BODY */}
          <div className="flex flex-col md:flex-row gap-8 flex-1">
            {/* LEFT COLUMN: Add Analysis */}
            <div className="md:w-1/2">
              <div
                className={`rounded-xl p-6 mb-6 ${
                  isDarkMode
                    ? 'bg-slate-800 border border-slate-700 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">Add a New Analysis</h2>
                <input
                  type="text"
                  className={`w-full mb-3 p-3 rounded-md shadow-sm text-sm focus:outline-none ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  placeholder="Analysis Title"
                  value={analysisTitle}
                  onChange={(e) => setAnalysisTitle(e.target.value)}
                />
                <textarea
                  rows="5"
                  className={`w-full mb-3 p-3 rounded-md shadow-sm text-sm focus:outline-none ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  placeholder="Analysis Details"
                  value={analysisDetails}
                  onChange={(e) => setAnalysisDetails(e.target.value)}
                />
                <button
                  onClick={handleAddAnalysis}
                  className={`px-4 py-2 mt-2 rounded-md text-sm font-semibold tracking-wide transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-950 hover:bg-blue-800 text-white'
                  }`}
                >
                  Submit Analysis
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: List of Analyses */}
            <div className="md:w-1/2">
              <div
                className={`rounded-xl p-6 h-full ${
                  isDarkMode
                    ? 'bg-slate-800 border border-slate-700 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">Your Saved Analyses</h2>
                {analysisList.length > 0 ? (
                  <div className="space-y-4 overflow-auto max-h-[400px] pr-2">
                    {analysisList.map((analysis, idx) => (
                      <div
                        key={idx}
                        onClick={() => openAnalysis(analysis)}
                        className={`p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${
                          isDarkMode
                            ? 'bg-slate-700 text-white border border-slate-600'
                            : 'bg-white text-gray-800 border border-gray-300'
                        }`}
                      >
                        <h3 className="text-md font-semibold mb-1 line-clamp-1">
                          {analysis.title}
                        </h3>
                        <p className="text-sm line-clamp-2">
                          {analysis.details}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    No analyses added yet. Create your first analysis above!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL for Selected Analysis */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            className={`relative w-11/12 max-w-2xl p-6 rounded-2xl shadow-2xl ${
              isDarkMode
                ? 'bg-slate-800 text-white'
                : 'bg-white text-gray-800'
            }`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4 line-clamp-2">
              {selectedAnalysis.title}
            </h2>
            <p className="mb-6 leading-relaxed whitespace-pre-wrap text-sm">
              {selectedAnalysis.details}
            </p>
            <div className="text-right">
              <button
                onClick={closeAnalysis}
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
