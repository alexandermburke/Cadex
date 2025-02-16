'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

export default function CaseAnalysis() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Favorites are stored in Firebase under userDataObj.favorites.
  // We load each favorite case's details into favoriteCases.
  const [favoriteCases, setFavoriteCases] = useState([]);
  // Analysis form state
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisDetails, setAnalysisDetails] = useState('');
  // Saved analyses (from Firebase user document)
  const [savedAnalyses, setSavedAnalyses] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchFavorites = async () => {
      if (userDataObj && Array.isArray(userDataObj.favorites)) {
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
      if (userDataObj && userDataObj.analyses) {
        setSavedAnalyses(userDataObj.analyses);
      }
    };
    fetchFavorites();
  }, [currentUser, userDataObj]);

  const handleAddAnalysis = async () => {
    if (!selectedFavorite) {
      alert('Please select a favorite case.');
      return;
    }
    if (!analysisTitle.trim() || !analysisDetails.trim()) {
      alert('Please provide both an analysis title and details.');
      return;
    }
    const newAnalysis = {
      caseId: selectedFavorite.id,
      caseTitle: selectedFavorite.title,
      title: analysisTitle.trim(),
      details: analysisDetails.trim(),
      timestamp: Date.now(),
    };
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedAnalyses = [...(userDataObj.analyses || []), newAnalysis];
      await updateDoc(userDocRef, { analyses: updatedAnalyses });
      setSavedAnalyses(updatedAnalyses);
      setAnalysisTitle('');
      setAnalysisDetails('');
      alert('Analysis saved successfully!');
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Error saving analysis.');
    }
  };

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
    <div className={`relative flex h-screen transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
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
        {/* Body Container (same style as your other pages) */}
        <div
          className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-gray-800'
          } flex flex-col items-center`}
        >
          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Left Column: Add New Analysis */}
            <div className="md:w-1/2">
              <div
                className={`rounded-xl p-6 mb-6 ${
                  isDarkMode
                    ? 'bg-slate-800 border border-slate-700 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">Add New Analysis</h2>
                <div className="mb-4">
                  <label className="block font-medium mb-1">Select a Favorite Case</label>
                  <select
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedFavorite ? selectedFavorite.id : ''}
                    onChange={(e) => {
                      const fav = favoriteCases.find((c) => c.id === e.target.value);
                      setSelectedFavorite(fav);
                    }}
                  >
                    <option value="">-- Select a Case --</option>
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
                    className={`w-full p-3 rounded-md shadow-sm text-sm focus:outline-none ${
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
                    className={`w-full p-3 rounded-md shadow-sm text-sm focus:outline-none ${
                      isDarkMode
                        ? 'bg-slate-700 border border-slate-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-800'
                    }`}
                    placeholder="Enter analysis details"
                    value={analysisDetails}
                    onChange={(e) => setAnalysisDetails(e.target.value)}
                  ></textarea>
                </div>
                <button
                  onClick={handleAddAnalysis}
                  className={`w-full px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-950 hover:bg-blue-800 text-white'
                  }`}
                >
                  Save Analysis
                </button>
              </div>
            </div>
            {/* Right Column: List of Saved Analyses */}
            <div className="md:w-1/2">
              <div
                className={`rounded-xl p-6 h-full ${
                  isDarkMode
                    ? 'bg-slate-800 border border-slate-700 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">Your Saved Analyses</h2>
                {savedAnalyses.length > 0 ? (
                  <div className="space-y-4 overflow-auto max-h-[400px] pr-2">
                    {savedAnalyses.map((analysis, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          // For now, simply alert the analysis details; you could open a modal instead.
                          alert(`Title: ${analysis.title}\nCase: ${analysis.caseTitle}\n\n${analysis.details}`);
                        }}
                        className={`p-4 rounded-lg shadow transition-shadow cursor-pointer ${
                          isDarkMode
                            ? 'bg-slate-700 border border-slate-600'
                            : 'bg-white border border-gray-300'
                        }`}
                      >
                        <h3 className="text-md font-semibold mb-1">{analysis.title}</h3>
                        <p className="text-sm">{analysis.details}</p>
                        <p className="text-xs text-gray-500 mt-1">Case: {analysis.caseTitle}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    No analyses saved yet. Add an analysis for one of your favorite cases.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
