'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
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

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Favorites are stored in Firebase under userDataObj.favorites
  const [favoriteCases, setFavoriteCases] = useState([]);
  // Analysis form state
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisDetails, setAnalysisDetails] = useState('');
  const [analysisTags, setAnalysisTags] = useState('');
  const [analysisDueDate, setAnalysisDueDate] = useState('');

  // For storing new or updated versions (and previously AI guidance if needed)
  const [savedAnalyses, setSavedAnalyses] = useState([]);

  // For expanding/collapsing individual analysis items
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);

  // For searching among saved analyses
  const [searchQuery, setSearchQuery] = useState('');

  // Whether we automatically cite recognized "v." text
  const [autoCitationsOn, setAutoCitationsOn] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchFavoritesAndAnalyses = async () => {
      if (!userDataObj) return;

      // Fetch list of favorites
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

      // Fetch list of existing analyses
      if (userDataObj.analyses) {
        setSavedAnalyses(userDataObj.analyses);
      }
    };
    fetchFavoritesAndAnalyses();
  }, [currentUser, userDataObj]);

  // Helper: parse tags into an array
  const parseTags = (tagsString) =>
    tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

  // Simple “Generate Citations” function (placeholder)
  const generateCitationsInText = (text) => {
    if (!autoCitationsOn) return text;
    // Finds patterns like "Roe v. Wade" and appends "(Auto-Cited)"
    return text.replace(
      /\b([A-Z][a-z]+ v\. [A-Z][a-z]+)/g,
      (match) => `${match} (Auto-Cited)`
    );
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

    // "versions" array for version history
    const newVersion = {
      timestamp: Date.now(),
      details: analysisDetails,
    };

    // Build analysis object
    const newAnalysis = {
      caseId: selectedFavorite.id,
      caseTitle: selectedFavorite.title,
      title: analysisTitle.trim(),
      versions: [newVersion],
      tags: tagsArray,
      dueDate: analysisDueDate,
      details: analysisDetails.trim(),
      createdAt: Date.now(),
    };

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedAnalyses = [...(userDataObj.analyses || []), newAnalysis];
      await updateDoc(userDocRef, { analyses: updatedAnalyses });
      setSavedAnalyses(updatedAnalyses);

      // Reset form
      setAnalysisTitle('');
      setAnalysisDetails('');
      setAnalysisTags('');
      setAnalysisDueDate('');

      alert('Analysis saved successfully!');
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Error saving analysis.');
    }
  };

  // "Update" analysis: add new version with optional auto-citations
  const handleUpdateAnalysis = async (index) => {
    try {
      const analysisToUpdate = { ...savedAnalyses[index] };
      const newVersion = {
        timestamp: Date.now(),
        details: analysisToUpdate.details,
      };
      analysisToUpdate.versions.push(newVersion);

      // If auto-citations are toggled on, update the details accordingly
      analysisToUpdate.details = generateCitationsInText(analysisToUpdate.details);

      const updatedList = [...savedAnalyses];
      updatedList[index] = analysisToUpdate;

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { analyses: updatedList });
      setSavedAnalyses(updatedList);

      alert('Analysis updated, new version added!');
    } catch (error) {
      console.error('Error updating analysis:', error);
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
    } catch (error) {
      console.error('Error deleting analysis:', error);
      alert('Error deleting analysis.');
    }
  };

  // Toggle expand/collapse
  const toggleExpand = (analysisIndex) => {
    if (expandedAnalysis === analysisIndex) {
      setExpandedAnalysis(null);
    } else {
      setExpandedAnalysis(analysisIndex);
    }
  };

  // Simple share function
  const handleShareAnalysis = (analysis) => {
    const shareUrl = `https://yourapp.com/analysis/${analysis.title.replace(/\s+/g, '-')}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => alert(`Link copied to clipboard: ${shareUrl}`))
      .catch(() => alert(`Link is: ${shareUrl}`));
  };

  // Filter the saved analyses by search query
  const filteredAnalyses = savedAnalyses.filter((analysis) => {
    const query = searchQuery.toLowerCase();
    const inTitle = analysis.title.toLowerCase().includes(query);
    const inCaseTitle = analysis.caseTitle.toLowerCase().includes(query);
    const inTags = analysis.tags?.some((tag) => tag.toLowerCase().includes(query));
    return inTitle || inCaseTitle || inTags;
  });

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

      <main className="flex-1 flex flex-col px-6 relative z-50 h-screen">
        {/* Top Bar with Sidebar Toggle */}
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

        {/* Main Container */}
        <div
          className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-gray-800'
          } flex flex-col items-center`}
        >
          <h1 className="text-2xl font-bold mb-4">Case Analysis</h1>

          {/* Two-column layout: form + saved analyses */}
          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Left Column: Add New Analysis */}
            <div className="md:w-1/2">
              <motion.div
                className={`rounded-xl p-6 mb-6 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-transparent border-gray-200 text-gray-800'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4">Add New Analysis</h2>

                <div className="mb-4">
                  <label className="block font-medium mb-1">
                    Select a Favorite Case
                  </label>
                  <select
                    className={`w-full p-2 rounded-md focus:outline-none shadow-sm text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border border-slate-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-800'
                    }`}
                    value={selectedFavorite ? selectedFavorite.id : ''}
                    onChange={(e) => {
                      const fav = favoriteCases.find((c) => c.id === e.target.value);
                      setSelectedFavorite(fav);
                    }}
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

                <div className="mb-4">
                  <label className="block font-medium mb-1">Analysis Details</label>
                  <textarea
                    rows="5"
                    className={`w-full p-3 rounded-md shadow-sm text-sm focus:outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border border-slate-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-800'
                    }`}
                    placeholder="Enter analysis details"
                    value={analysisDetails}
                    onChange={(e) => setAnalysisDetails(e.target.value)}
                  ></textarea>
                </div>

                {/* Tagging / Categorization */}
                <div className="mb-4">
                  <label className="block font-medium mb-1">
                    Tags (comma-separated)
                  </label>
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

                {/* Due Date */}
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

                {/* Automatic Citations Toggle */}
                <div className="mb-4">
                  <label className="block font-medium mb-1">Auto-Citations</label>
                  <div className="relative inline-block w-14 h-8 select-none">
                    <input
                      type="checkbox"
                      id="citationsToggle"
                      checked={autoCitationsOn}
                      onChange={(e) => setAutoCitationsOn(e.target.checked)}
                      className="sr-only peer"
                    />
                    {/* Background element */}
                    <div
                      className={`block w-14 h-8 rounded-full ${
                        isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
                      } peer-checked:bg-blue-600`}
                    />
                    {/* Knob, animated with Framer Motion */}
                    <motion.div
                      className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md"
                      animate={{ x: autoCitationsOn ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                    />
                  </div>
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
            </div>

            {/* Right Column: List of Saved Analyses */}
            <div className="md:w-1/2">
              <motion.div
                className={`rounded-xl p-6 h-full ${
                  isDarkMode
                    ? 'bg-slate-800 text-white'
                    : 'bg-transparent text-gray-800'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4">Your Saved Analyses</h2>

                {/* Search / Filter */}
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
                    <div className="space-y-4 overflow-auto max-h-[400px] pr-2">
                      {filteredAnalyses.map((analysis, idx) => {
                        const isExpanded = expandedAnalysis === idx;
                        return (
                          <motion.div
                            key={idx}
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
                                <h3 className="text-md font-semibold mb-1">
                                  {analysis.title}
                                </h3>
                                <p className="text-xs text-gray-500 mb-2">
                                  Case: {analysis.caseTitle}
                                  {analysis.dueDate && (
                                    <span className="ml-2 italic">
                                      | Due: {analysis.dueDate}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {/* Share Button */}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleShareAnalysis(analysis)}
                                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors duration-300 ${
                                    isDarkMode
                                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                      : 'bg-blue-950 hover:bg-blue-800 text-white'
                                  }`}
                                >
                                  Share
                                </motion.button>

                                {/* Delete Button */}
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

                                {/* Expand/Collapse Toggle */}
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

                            {/* Tags */}
                            {analysis.tags && analysis.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 text-xs mb-2">
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
                                {/* Details (latest version) */}
                                <p className="text-sm mb-2">{analysis.details}</p>

                                {/* Version History */}
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

                                {/* "Update" button to add version */}
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
                      No analyses match your search query. Add a new one or try a different search.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
