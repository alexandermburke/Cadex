'use client';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '../Sidebar';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function simplifyText(text = '', maxLength = 100) {
  if (!text) return 'Not provided.';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export default function CaseAnalysis() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);
  const [favoriteCases, setFavoriteCases] = useState([]);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisDetails, setAnalysisDetails] = useState('');
  const [analysisTags, setAnalysisTags] = useState('');
  const [analysisDueDate, setAnalysisDueDate] = useState('');
  const [selectedCaseForSummary, setSelectedCaseForSummary] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoCitationsOn, setAutoCitationsOn] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (!currentUser) return;
    if (userDataObj && Array.isArray(userDataObj.favorites) && userDataObj.favorites.length > 0) {
      const fetchFavCases = async () => {
        try {
          const arr = [];
          for (const favId of userDataObj.favorites) {
            const docSnap = await getDoc(doc(db, 'capCases', favId));
            if (docSnap.exists()) {
              arr.push({ id: docSnap.id, ...docSnap.data() });
            }
          }
          setFavoriteCases(arr);
        } catch (error) {
          console.error('Error fetching favorite cases:', error);
        }
      };
      fetchFavCases();
    }
    if (userDataObj && userDataObj.analyses) {
      setSavedAnalyses(userDataObj.analyses);
    }
  }, [currentUser, userDataObj]);

  function parseTags(tagsString) {
    return tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  function generateCitationsInText(text) {
    if (!autoCitationsOn) return text;
    return text.replace(/\b([A-Z][a-z]+ v\. [A-Z][a-z]+)/g, (match) => `${match} (Auto-Cited)`);
  }

  function handleCaseSelection(caseId) {
    const selected = favoriteCases.find((c) => c.id === caseId) || null;
    setSelectedFavorite(selected);
    setSelectedCaseForSummary(selected);
  }

  // Modified function: now also redirects to the 'new' tab when opening a saved analysis.
  function handleOpenAnalysis(analysis) {
    const caseMatch = favoriteCases.find((c) => c.id === analysis.caseId);
    setSelectedFavorite(caseMatch || null);
    setAnalysisTitle(analysis.title);
    setAnalysisDetails(analysis.details);
    setAnalysisTags(analysis.tags?.join(', ') || '');
    setAnalysisDueDate(analysis.dueDate || '');
    setActiveTab('new');
  }

  async function handleAddAnalysis() {
    if (!selectedFavorite) {
      alert('Please select a favorite case.');
      return;
    }
    if (!analysisTitle.trim() || !analysisDetails.trim()) {
      alert('Please provide both an analysis title and details.');
      return;
    }
    const tagsArray = parseTags(analysisTags);
    const finalDetails = generateCitationsInText(analysisDetails);
    const newVersion = {
      timestamp: Date.now(),
      details: finalDetails
    };
    const newAnalysis = {
      caseId: selectedFavorite.id,
      caseTitle: selectedFavorite.title,
      title: analysisTitle.trim(),
      versions: [newVersion],
      tags: tagsArray,
      dueDate: analysisDueDate,
      details: finalDetails.trim(),
      createdAt: Date.now()
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
  }

  async function handleUpdateAnalysis(index) {
    try {
      const analysisToUpdate = { ...savedAnalyses[index] };
      const updatedDetails = generateCitationsInText(analysisToUpdate.details);
      const newVersion = {
        timestamp: Date.now(),
        details: updatedDetails
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
  }

  async function handleDeleteAnalysis(index) {
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
  }

  const filteredAnalyses = savedAnalyses.filter((analysis) => {
    const query = searchQuery.toLowerCase();
    const inTitle = analysis.title.toLowerCase().includes(query);
    const inCaseTitle = analysis.caseTitle.toLowerCase().includes(query);
    const inTags = analysis.tags?.some((tag) => tag.toLowerCase().includes(query));
    return inTitle || inCaseTitle || inTags;
  });

  // New tab toggle using a structure similar to AllBriefs
  function renderTabToggle() {
    return (
      <div className="w-full max-w-md mx-auto mb-4 flex justify-around">
        <motion.button
          className={`px-4 py-2 font-semibold transition-colors duration-300 ${
            activeTab === 'summary'
              ? isDarkMode
                ? 'text-white border-b-2 border-blue-400'
                : 'text-blue-900 border-b-2 border-blue-900'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </motion.button>
        <motion.button
          className={`px-4 py-2 font-semibold transition-colors duration-300 ${
            activeTab === 'new'
              ? isDarkMode
                ? 'text-white border-b-2 border-blue-400'
                : 'text-blue-900 border-b-2 border-blue-900'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('new')}
        >
          New
        </motion.button>
        <motion.button
          className={`px-4 py-2 font-semibold transition-colors duration-300 ${
            activeTab === 'saved'
              ? isDarkMode
                ? 'text-white border-b-2 border-blue-400'
                : 'text-blue-900 border-b-2 border-blue-900'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </motion.button>
      </div>
    );
  }

  const summarySection = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Case Summary</h2>
      {selectedCaseForSummary ? (
        <div
          className={clsx(
            'p-6 rounded-lg shadow-lg',
            isDarkMode
              ? 'bg-slate-800 bg-opacity-50 border border-slate-600 text-white'
              : 'bg-white border border-gray-300 text-gray-800'
          )}
        >
          <h3 className="text-xl font-bold mb-2">{selectedCaseForSummary.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p>
              <strong>Citation:</strong> {selectedCaseForSummary.citation || 'N/A'}
            </p>
            <p>
              <strong>Jurisdiction:</strong> {selectedCaseForSummary.jurisdiction || 'Unknown'}
            </p>
            <p>
              <strong>Date:</strong> {selectedCaseForSummary.decisionDate || 'N/A'}
            </p>
            <p>
              <strong>Volume:</strong> {selectedCaseForSummary.volume || 'N/A'}
            </p>
          </div>
          {selectedCaseForSummary.briefSummary &&
          typeof selectedCaseForSummary.briefSummary === 'object' ? (
            <div className="mt-4 space-y-2 text-sm text-left">
              <p>
                <strong>Rule of Law:</strong> {selectedCaseForSummary.briefSummary.ruleOfLaw || 'Not provided.'}
              </p>
              <p>
                <strong>Facts:</strong> {selectedCaseForSummary.briefSummary.facts || 'Not provided.'}
              </p>
              <p>
                <strong>Issue:</strong> {selectedCaseForSummary.briefSummary.issue || 'Not provided.'}
              </p>
              <p>
                <strong>Holding:</strong> {selectedCaseForSummary.briefSummary.holding || 'Not provided.'}
              </p>
              <p>
                <strong>Reasoning:</strong> {selectedCaseForSummary.briefSummary.reasoning || 'Not provided.'}
              </p>
              <p>
                <strong>Dissent:</strong> {selectedCaseForSummary.briefSummary.dissent || 'Not provided.'}
              </p>
            </div>
          ) : (
            <p className="text-sm mt-4">No summary available.</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-500">
            Select a case from your favorites to view its summary.
          </p>
        </div>
      )}
    </div>
  );

  const newAnalysisSection = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Add New Analysis</h2>
      <div
        className={clsx(
          'p-6 rounded-lg shadow-lg',
          isDarkMode
            ? 'bg-slate-800 bg-opacity-50 border border-slate-600 text-white'
            : 'bg-white border border-gray-300 text-gray-800'
        )}
      >
        <div className="mb-4">
          <label className="block font-medium mb-1">Select a Case Brief</label>
          <select
            className={clsx(
              'w-full p-2 rounded-md focus:outline-none shadow-sm text-sm transition-colors',
              isDarkMode
                ? 'bg-slate-800 bg-opacity-50 border border-slate-600 text-white'
                : 'bg-white border border-gray-300 text-gray-800'
            )}
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
            className={clsx(
              'w-full p-3 rounded-md shadow-sm text-sm focus:outline-none transition-colors',
              isDarkMode
                ? 'bg-slate-800 bg-opacity-50 border border-slate-600 text-white'
                : 'bg-white border border-gray-300 text-gray-800'
            )}
            placeholder="Enter analysis title"
            value={analysisTitle}
            onChange={(e) => setAnalysisTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Analysis Details</label>
          <textarea
            rows="5"
            className={clsx(
              'w-full p-3 rounded-md shadow-sm text-sm focus:outline-none transition-colors',
              isDarkMode
                ? 'bg-slate-800 bg-opacity-50 border border-slate-600 text-white'
                : 'bg-white border border-gray-300 text-gray-800'
            )}
            placeholder="Enter analysis details"
            value={analysisDetails}
            onChange={(e) => setAnalysisDetails(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            className={clsx(
              'w-full p-3 rounded-md shadow-sm text-sm focus:outline-none transition-colors',
              isDarkMode
                ? 'bg-slate-800 bg-opacity-50 border border-slate-600 text-white'
                : 'bg-white border border-gray-300 text-gray-800'
            )}
            placeholder="e.g. Torts, Negligence"
            value={analysisTags}
            onChange={(e) => setAnalysisTags(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Due Date</label>
          <input
            type="date"
            className={clsx(
              'w-full p-3 rounded-md shadow-sm text-sm focus:outline-none transition-colors',
              isDarkMode
                ? 'bg-slate-800 bg-opacity-50 border border-slate-600 text-white'
                : 'bg-white border border-gray-300 text-gray-800'
            )}
            value={analysisDueDate}
            onChange={(e) => setAnalysisDueDate(e.target.value)}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddAnalysis}
          className={clsx(
            'w-full px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300',
            isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-950 hover:bg-blue-800 text-white'
          )}
        >
          Save Analysis
        </motion.button>
      </div>
    </div>
  );

  const savedAnalysesSection = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Saved Analyses</h2>
      <div className="mb-4">
        <input
          type="text"
          className={clsx(
            'w-full p-2 rounded-md shadow-sm text-sm focus:outline-none transition-colors',
            isDarkMode ? 'bg-slate-800 bg-opacity-50 border border-slate-600 text-white' : 'bg-white border border-gray-300 text-gray-800'
          )}
          placeholder="Search by title, case, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <AnimatePresence>
        {filteredAnalyses.length > 0 ? (
          <div className="space-y-4">
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
                  className={clsx(
                    'p-4 rounded-lg shadow transition-shadow cursor-pointer group',
                    isDarkMode ? 'bg-slate-800 bg-opacity-50 border border-slate-600 text-white' : 'bg-white border border-gray-300 text-gray-800',
                    'hover:shadow-xl'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div onClick={() => setExpandedAnalysis(isExpanded ? null : idx)}>
                      <h3 className="text-md font-semibold mb-1">{analysis.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">
                        Case: {analysis.caseTitle}
                        {analysis.dueDate && <span className="ml-2 italic">| Due: {analysis.dueDate}</span>}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenAnalysis(analysis)}
                        className={clsx(
                          'px-2 py-1 rounded-md text-xs font-semibold transition-colors duration-300',
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-blue-950 hover:bg-blue-800 text-white'
                        )}
                      >
                        Open
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteAnalysis(idx)}
                        className={clsx(
                          'px-2 py-1 rounded-md text-xs font-semibold transition-colors duration-300',
                          isDarkMode
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-red-700 hover:bg-red-600 text-white'
                        )}
                      >
                        Delete
                      </motion.button>
                      <span
                        onClick={() => setExpandedAnalysis(isExpanded ? null : idx)}
                        className={clsx(
                          'text-xs font-semibold cursor-pointer transition-colors',
                          isDarkMode
                            ? 'text-blue-400 group-hover:text-blue-200'
                            : 'text-blue-600 group-hover:text-blue-400'
                        )}
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </span>
                    </div>
                  </div>
                  {isExpanded && (
                    <motion.div
                      className="overflow-hidden mt-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-sm mb-2">{analysis.details}</p>
                      <div className="text-xs text-gray-500 mb-2">
                        <strong>Versions:</strong>
                        {analysis.versions?.length > 0 ? (
                          <ul className="list-disc ml-4 mt-1">
                            {analysis.versions.map((v) => (
                              <li key={v.timestamp}>
                                {new Date(v.timestamp).toLocaleString()}: {simplifyText(v.details, 50)}
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
                        className={clsx(
                          'px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-300',
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-blue-950 hover:bg-blue-800 text-white'
                        )}
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
    </div>
  );

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'bg-transparent text-white' : 'bg-transparent text-gray-800')}>
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
        <div className="flex-1 px-6">
          <main className={clsx(
            'w-full rounded-2xl shadow-xl py-6 px-6 overflow-y-auto overflow-x-auto h-screen flex flex-col relative z-50',
            isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
          )}>
            <div className="flex items-center justify-between w-full mb-4">
              <button
                onClick={toggleSidebar}
                className="text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isSidebarVisible ? (
                    <motion.div key="close-icon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <FaTimes size={20} />
                    </motion.div>
                  ) : (
                    <motion.div key="bars-icon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <FaBars size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="flex justify-center mb-6">
              {renderTabToggle()}
            </div>
            {activeTab === 'summary' && summarySection}
            {activeTab === 'new' && newAnalysisSection}
            {activeTab === 'saved' && savedAnalysesSection}
          </main>
        </div>
      </div>
    </div>
  );
}
