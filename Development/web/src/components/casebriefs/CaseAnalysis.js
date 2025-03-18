'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaExchangeAlt, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '../Sidebar';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Utility to simplify text
const simplifyText = (text = '', maxLength = 100) => {
  if (!text) return 'Not provided.';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default function CaseAnalysis() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar toggle
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Favorites (cases) from Firebase
  const [favoriteCases, setFavoriteCases] = useState([]);

  // Analysis Form state
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisDetails, setAnalysisDetails] = useState('');
  const [analysisTags, setAnalysisTags] = useState('');
  const [analysisDueDate, setAnalysisDueDate] = useState('');

  // Saved analyses
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-cite recognized "v." references
  const [autoCitationsOn, setAutoCitationsOn] = useState(false);

  // For summary column
  const [selectedCaseForSummary, setSelectedCaseForSummary] = useState(null);

  // For swapping columns
  const [isSwapped, setIsSwapped] = useState(false);

  // For individual column collapse/expand
  const [showSummary, setShowSummary] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);
  // New state for saved analyses collapse toggle
  const [showSavedAnalyses, setShowSavedAnalyses] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchFavoritesAndAnalyses = async () => {
      if (!userDataObj) return;

      // 1) Favorites
      if (Array.isArray(userDataObj.favorites)) {
        const favCases = [];
        for (const caseId of userDataObj.favorites) {
          try {
            const caseDoc = await getDoc(doc(db, 'capCases', caseId));
            if (caseDoc.exists()) {
              favCases.push({ id: caseDoc.id, ...caseDoc.data() });
            }
          } catch (error) {
            console.error('Error fetching favorite case:', error);
          }
        }
        setFavoriteCases(favCases);
      }

      // 2) Saved analyses
      if (userDataObj.analyses) {
        setSavedAnalyses(userDataObj.analyses);
      }
    };
    fetchFavoritesAndAnalyses();
  }, [currentUser, userDataObj]);

  // Helper: parse CSV tags
  const parseTags = (tagsString) =>
    tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

  // Generate citations if toggle is on
  const generateCitationsInText = (text) => {
    if (!autoCitationsOn) return text;
    return text.replace(
      /\b([A-Z][a-z]+ v\. [A-Z][a-z]+)/g,
      (match) => `${match} (Auto-Cited)`
    );
  };

  // Case selection
  const handleCaseSelection = (caseId) => {
    const selected = favoriteCases.find((c) => c.id === caseId) || null;
    setSelectedFavorite(selected);
    setSelectedCaseForSummary(selected);
  };

  // Add new analysis
  const handleAddAnalysis = async () => {
    if (!selectedFavorite) {
      alert('Please select a favorite case.');
      return;
    }
    if (!analysisTitle.trim() || !analysisDetails.trim()) {
      alert('Please provide both an analysis title and details.');
      return;
    }

    const tagsArray = parseTags(analysisTags);
    let finalDetails = generateCitationsInText(analysisDetails);

    const newVersion = {
      timestamp: Date.now(),
      details: finalDetails,
    };

    const newAnalysis = {
      caseId: selectedFavorite.id,
      caseTitle: selectedFavorite.title,
      title: analysisTitle.trim(),
      versions: [newVersion],
      tags: tagsArray,
      dueDate: analysisDueDate,
      details: finalDetails.trim(),
      createdAt: Date.now(),
    };

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedAnalyses = [...(userDataObj.analyses || []), newAnalysis];
      await updateDoc(userDocRef, { analyses: updatedAnalyses });
      setSavedAnalyses(updatedAnalyses);

      setAnalysisTitle('');
      setAnalysisDetails('');
      setAnalysisTags('');
      setAnalysisDueDate('');
      alert('Analysis saved successfully!');
    } catch (err) {
      console.error('Error saving analysis:', err);
      alert('Error saving analysis.');
    }
  };

  // Open an existing analysis (populate the form)
  const handleOpenAnalysis = (analysis) => {
    const caseMatch = favoriteCases.find((c) => c.id === analysis.caseId);
    setSelectedFavorite(caseMatch || null);
    setAnalysisTitle(analysis.title);
    setAnalysisDetails(analysis.details);
    setAnalysisTags(analysis.tags?.join(', ') || '');
    setAnalysisDueDate(analysis.dueDate || '');
  };

  // Update an existing analysis (new version)
  const handleUpdateAnalysis = async (index) => {
    try {
      const analysisToUpdate = { ...savedAnalyses[index] };
      const updatedDetails = generateCitationsInText(analysisToUpdate.details);
      const newVersion = {
        timestamp: Date.now(),
        details: updatedDetails,
      };
      analysisToUpdate.details = updatedDetails;
      analysisToUpdate.versions.push(newVersion);

      const updatedList = [...savedAnalyses];
      updatedList[index] = analysisToUpdate;
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { analyses: updatedList });
      setSavedAnalyses(updatedList);
      alert('Analysis updated (new version added)!');
    } catch (err) {
      console.error('Error updating analysis:', err);
      alert('Error updating analysis.');
    }
  };

  // Delete analysis
  const handleDeleteAnalysis = async (index) => {
    try {
      const updatedList = [...savedAnalyses];
      updatedList.splice(index, 1);
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { analyses: updatedList });
      setSavedAnalyses(updatedList);
      alert('Analysis deleted.');
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Error deleting analysis.');
    }
  };

  // Filter analyses by search
  const filteredAnalyses = savedAnalyses.filter((analysis) => {
    const query = searchQuery.toLowerCase();
    const inTitle = analysis.title.toLowerCase().includes(query);
    const inCaseTitle = analysis.caseTitle.toLowerCase().includes(query);
    const inTags = analysis.tags?.some((tag) => tag.toLowerCase().includes(query));
    return inTitle || inCaseTitle || inTags;
  });

  // -----------------------------------------
  // SUMMARY COLUMN
  const summaryColumn = (
    <div className="w-full md:w-1/2 flex flex-col flex-1">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4">Case Summary</h2>
        <button onClick={() => setShowSummary((prev) => !prev)} className="p-1">
          {showSummary ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-4 overflow-y-auto rounded-lg p-6 backdrop-blur-sm shadow-lg ${
              isDarkMode
                ? 'bg-slate-800 bg-opacity-50 bg-opacity-50 border border-slate-600 text-white'
                : 'bg-white border border-gray-300 text-gray-800'
            }`}
          >
            {selectedCaseForSummary ? (
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  {selectedCaseForSummary.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                  <p className="text-sm">
                    <strong>Citation:</strong> {selectedCaseForSummary.citation || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <strong>Jurisdiction:</strong> {selectedCaseForSummary.jurisdiction || 'Unknown'}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong> {selectedCaseForSummary.decisionDate || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <strong>Volume:</strong> {selectedCaseForSummary.volume || 'N/A'}
                  </p>
                </div>
                {selectedCaseForSummary.briefSummary &&
                typeof selectedCaseForSummary.briefSummary === 'object' ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Rule of Law:</strong>{' '}
                      {selectedCaseForSummary.briefSummary.ruleOfLaw || 'Not provided.'}
                    </p>
                    <p>
                      <strong>Facts:</strong>{' '}
                      {selectedCaseForSummary.briefSummary.facts || 'Not provided.'}
                    </p>
                    <p>
                      <strong>Issue:</strong>{' '}
                      {selectedCaseForSummary.briefSummary.issue || 'Not provided.'}
                    </p>
                    <p>
                      <strong>Holding:</strong>{' '}
                      {selectedCaseForSummary.briefSummary.holding || 'Not provided.'}
                    </p>
                    <p>
                      <strong>Reasoning:</strong>{' '}
                      {selectedCaseForSummary.briefSummary.reasoning || 'Not provided.'}
                    </p>
                    <p>
                      <strong>Dissent:</strong>{' '}
                      {selectedCaseForSummary.briefSummary.dissent || 'Not provided.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm mt-4">No summary available.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Select a case to view its summary.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // -----------------------------------------
  // ANALYSIS COLUMN
  const analysisColumn = (
    <div className="w-full md:w-1/2 flex flex-col flex-1">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4">Add or Edit Analysis</h2>
        <button onClick={() => setShowAnalysis((prev) => !prev)} className="p-1">
          {showAnalysis ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      <AnimatePresence>
        {showAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1"
          >
            <motion.div
              className={`rounded-xl p-6 mb-6 shadow-lg flex-1 ${
                isDarkMode
                  ? 'bg-slate-800 bg-opacity-50 border border-slate-700 text-white'
                  : 'bg-white border border-gray-300 text-gray-800'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-semibold mb-4">Add New Analysis</h2>

              <div className="mb-4">
                <label className="block font-medium mb-1">Select a Case Brief from Favorites</label>
                <select
                  className={`w-full p-2 rounded-md focus:outline-none shadow-sm text-sm transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  value={selectedFavorite ? selectedFavorite.id : ''}
                  onChange={(e) => handleCaseSelection(e.target.value)}
                >
                  <option value="">Select a Case</option>
                  {favoriteCases.map((fav) => (
                    <option key={fav.id} value={fav.id}>
                      {fav.title} ({fav.jurisdiction || 'Unknown'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Analysis Title</label>
                <input
                  type="text"
                  className={`w-full p-3 rounded-md shadow-sm text-sm focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  placeholder="Enter analysis title"
                  value={analysisTitle}
                  onChange={(e) => setAnalysisTitle(e.target.value)}
                />
              </div>

              <div className="mb-4 flex-1">
                <label className="block font-medium mb-1">Analysis Details</label>
                <textarea
                  rows="5"
                  className={`w-full p-3 rounded-md shadow-sm text-sm focus:outline-none transition-colors h-32 md:h-auto ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  placeholder="Enter analysis details"
                  value={analysisDetails}
                  onChange={(e) => setAnalysisDetails(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  className={`w-full p-3 rounded-md shadow-sm text-sm focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  placeholder="e.g. Torts, Negligence"
                  value={analysisTags}
                  onChange={(e) => setAnalysisTags(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  className={`w-full p-3 rounded-md shadow-sm text-sm focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border border-slate-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800'
                  }`}
                  value={analysisDueDate}
                  onChange={(e) => setAnalysisDueDate(e.target.value)}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddAnalysis}
                className={`w-full px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-950 hover:bg-blue-800 text-white'
                }`}
              >
                Save Analysis
              </motion.button>
            </motion.div>

            <motion.div
              className={`rounded-xl p-6 shadow-lg flex-1 ${
                isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Saved Analyses</h2>
                <button onClick={() => setShowSavedAnalyses((prev) => !prev)} className="p-1">
                  {showSavedAnalyses ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              {showSavedAnalyses && (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      className={`w-full p-2 rounded-md shadow-sm text-sm focus:outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-slate-700 border border-slate-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-800'
                      }`}
                      placeholder="Search by title, case, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <AnimatePresence>
                    {filteredAnalyses.length > 0 ? (
                      <div className="space-y-4 overflow-auto pr-2 max-h-[400px]">
                        {filteredAnalyses.map((analysis, idx) => {
                          const isExpanded = expandedAnalysis === idx;
                          return (
                            <motion.div
                              key={analysis.title + idx}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.3 }}
                              className={`p-4 rounded-lg shadow transition-shadow cursor-pointer group ${
                                isDarkMode
                                  ? 'bg-slate-700 border border-slate-600'
                                  : 'bg-white border border-gray-300'
                              } hover:shadow-xl`}
                            >
                              <div className="flex justify-between items-center">
                                <div onClick={() => setExpandedAnalysis(isExpanded ? null : idx)}>
                                  <h3 className="text-md font-semibold mb-1">{analysis.title}</h3>
                                  <p className="text-xs text-gray-500 mb-2">
                                    Case: {analysis.caseTitle}
                                    {analysis.dueDate && (
                                      <span className="ml-2 italic">| Due: {analysis.dueDate}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleOpenAnalysis(analysis)}
                                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors duration-300 ${
                                      isDarkMode
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                        : 'bg-blue-950 hover:bg-blue-800 text-white'
                                    }`}
                                  >
                                    Open
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDeleteAnalysis(idx)}
                                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors duration-300 ${
                                      isDarkMode
                                        ? 'bg-red-600 hover:bg-red-500 text-white'
                                        : 'bg-red-700 hover:bg-red-600 text-white'
                                    }`}
                                  >
                                    Delete
                                  </motion.button>
                                  <span
                                    onClick={() => setExpandedAnalysis(isExpanded ? null : idx)}
                                    className={`text-xs font-semibold cursor-pointer transition-colors ${
                                      isDarkMode
                                        ? 'text-blue-400 group-hover:text-blue-200'
                                        : 'text-blue-600 group-hover:text-blue-400'
                                    }`}
                                  >
                                    {isExpanded ? 'Hide' : 'View'}
                                  </span>
                                </div>
                              </div>
                              {analysis.tags && analysis.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 text-xs mb-2 mt-1">
                                  {analysis.tags.map((tag) => (
                                    <motion.span
                                      key={tag}
                                      className={`px-2 py-1 rounded-full ${
                                        isDarkMode
                                          ? 'bg-slate-600 text-white'
                                          : 'bg-gray-200 text-gray-800'
                                      }`}
                                    >
                                      {tag}
                                    </motion.span>
                                  ))}
                                </div>
                              )}
                              {isExpanded && (
                                <motion.div
                                  className="overflow-hidden"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <p className="text-sm mb-2">{analysis.details}</p>
                                  <div className="text-xs text-gray-500 mb-2">
                                    <strong>Versions:</strong>
                                    {analysis.versions?.length > 0 ? (
                                      <ul className="list-inside list-disc ml-4 mt-1">
                                        {analysis.versions.map((v) => (
                                          <li key={v.timestamp}>
                                            {new Date(v.timestamp).toLocaleString()}:{' '}
                                            {simplifyText(v.details, 50)}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p>No versions recorded.</p>
                                    )}
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleUpdateAnalysis(idx)}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-300 ${
                                      isDarkMode
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                        : 'bg-blue-950 hover:bg-blue-800 text-white'
                                    }`}
                                  >
                                    Update (New Version)
                                  </motion.button>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-gray-600 dark:text-gray-300"
                      >
                        No analyses match your search. Add a new one or try a different query.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // -----------------------------------------
  // If not logged in
  if (!currentUser) {
    return (
      <div
        className={`flex items-center justify-center h-screen transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white'
            : 'bg-white text-gray-800'
        }`}
      >
        <div
          className={`p-6 rounded-2xl shadow-xl text-center ${
            isDarkMode ? 'bg-slate-800 bg-opacity-50' : 'bg-white'
          }`}
        >
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

  // -----------------------------------------
  // RENDER
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div
        className={`relative flex h-screen transition-colors duration-500 ${
          isDarkMode
            ? 'bg-transparent text-white'
            : 'bg-transparent text-gray-800'
        }`}
      >
        {/* Sidebar kept outside <main> */}
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

        {/* Main container with horizontal padding */}
        <div className="flex-1 px-6">
          <main
            className={`w-full rounded-2xl shadow-xl py-6 px-6 overflow-y-auto overflow-x-auto h-screen flex flex-col relative z-50 ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
                : 'bg-white text-gray-800'
            }`}
          >
            {/* Top Bar with Sidebar Toggle */}
            <div className="flex items-center justify-between w-full mb-4">
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

            {/* Swap Button */}
            <div className="w-full flex items-center justify-center mb-4">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9, rotate: -10 }}
                onClick={() => setIsSwapped((prev) => !prev)}
                className="p-2 rounded-full bg-blue-600 text-white shadow-lg"
                aria-label="Swap Columns"
              >
                <FaExchangeAlt size={24} />
              </motion.button>
            </div>

            {/* Two columns, same height (items-stretch) */}
            <div className="flex flex-col md:flex-row gap-8 w-full items-stretch">
              {isSwapped ? (
                <>
                  {analysisColumn}
                  {summaryColumn}
                </>
              ) : (
                <>
                  {summaryColumn}
                  {analysisColumn}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
