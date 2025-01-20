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

  // Analysis states
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisDetails, setAnalysisDetails] = useState('');
  const [analysisList, setAnalysisList] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

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

  const openAnalysis = (analysis) => {
    setSelectedAnalysis(analysis);
  };

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
          <p className="mb-4 text-lg font-semibold">Please log in to access Case Analysis.</p>
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
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white'
          : 'bg-gradient-to-br from-gray-100 to-white text-gray-800'
      }`}
    >
      {/* Sidebar + Mobile Overlay */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/lawtools/caseanalysis"
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

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center md:items-start px-6 py-4 overflow-auto">
        {/* Top row */}
        <div className="w-full flex items-center justify-between mb-6">
          {/* Toggle button */}
          <button
            onClick={toggleSidebar}
            className="text-white dark:text-white p-2 rounded transition-colors hover:bg-white hover:bg-opacity-20 focus:outline-none md:hidden"
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

          {/* Cross-links */}
          <div className="flex gap-3">
            <Link
              href="/lawtools/casesummaries"
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
            >
              Case Summaries
            </Link>
            <Link
              href="/lawtools/allbriefs"
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
            >
              All Briefs
            </Link>
          </div>
        </div>

        {/* Add Analysis Card */}
        <div className="w-full max-w-3xl backdrop-blur-md bg-white/70 dark:bg-slate-700/70 text-black dark:text-white p-6 rounded-2xl shadow-2xl mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Add a New Analysis</h2>
          <input
            type="text"
            className="w-full mb-3 p-3 rounded-md shadow-inner text-sm focus:outline-none border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 dark:text-white"
            placeholder="Analysis Title"
            value={analysisTitle}
            onChange={(e) => setAnalysisTitle(e.target.value)}
          />
          <textarea
            rows="5"
            className="w-full mb-3 p-3 rounded-md shadow-inner text-sm focus:outline-none border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 dark:text-white"
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

        {/* Analysis List Card */}
        <div className="w-full max-w-3xl p-4 rounded-2xl shadow-2xl backdrop-blur-md bg-white/70 dark:bg-slate-700/70 flex-1 overflow-auto">
          <h2 className="text-lg font-bold dark:text-white mb-4">Your Saved Analyses</h2>
          {analysisList.length > 0 ? (
            analysisList.map((analysis, idx) => (
              <div
                key={idx}
                onClick={() => openAnalysis(analysis)}
                className="p-4 mb-4 bg-white dark:bg-slate-800/70 dark:text-white rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow"
              >
                <h3 className="text-md font-semibold mb-1">{analysis.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {analysis.details}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              No analyses added. Create your first analysis above!
            </p>
          )}
        </div>
      </main>

      {/* Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            className="w-11/12 max-w-2xl rounded-2xl p-6 bg-white dark:bg-slate-800 text-black dark:text-white shadow-2xl relative"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4">{selectedAnalysis.title}</h2>
            <p className="mb-6 leading-relaxed">{selectedAnalysis.details}</p>
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
