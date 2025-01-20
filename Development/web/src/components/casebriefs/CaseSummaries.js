'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaSearch, FaHighlighter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { db } from '@/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  doc,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { useAuth } from '@/context/AuthContext';

/** Utility to highlight text */
function applyHighlightsToText(text, highlights = []) {
  let result = text;
  const sortedHighlights = [...highlights].sort((a, b) => b.length - a.length);
  sortedHighlights.forEach((highlight) => {
    if (!highlight.trim()) return;
    const regex = new RegExp(
      highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'gi'
    );
    result = result.replace(regex, (match) => `<mark>${match}</mark>`);
  });
  return result;
}

export default function CaseSummaries() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Form inputs
  const [caseTitle, setCaseTitle] = useState('');
  const [caseContent, setCaseContent] = useState('');
  const [caseCourse, setCaseCourse] = useState('');
  const [caseKeyTakeaways, setCaseKeyTakeaways] = useState('');

  // Summaries
  const [caseList, setCaseList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Detail
  const [selectedCase, setSelectedCase] = useState(null);
  const [rawRenderedHTML, setRawRenderedHTML] = useState('');
  const [highlightMode, setHighlightMode] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchCaseSummaries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  async function fetchCaseSummaries() {
    if (!currentUser) return;
    try {
      const qRef = query(
        collection(db, 'caseSummaries'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(qRef);
      const loaded = [];
      querySnapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCaseList(loaded);
    } catch (error) {
      console.error('Error fetching case summaries:', error);
    }
  }

  const handleAddCase = async () => {
    if (!caseTitle.trim() || !caseContent.trim()) return;
    if (!currentUser) {
      alert('You must be logged in to save your case summaries.');
      return;
    }

    const newCase = {
      userId: currentUser.uid,
      title: caseTitle.trim(),
      content: caseContent.trim(),
      course: caseCourse.trim() || 'General',
      keyTakeaways: caseKeyTakeaways.trim(),
      highlights: [],
      timestamp: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'caseSummaries'), newCase);
      setCaseList([...caseList, { ...newCase, id: docRef.id }]);

      setCaseTitle('');
      setCaseContent('');
      setCaseCourse('');
      setCaseKeyTakeaways('');
    } catch (error) {
      console.error('Error saving new case summary:', error);
    }
  };

  const openCase = (caseItem) => {
    setSelectedCase(caseItem);
    setRawRenderedHTML(applyHighlightsToText(caseItem.content, caseItem.highlights || []));
    setHighlightMode(false);
  };

  const closeCase = () => {
    setSelectedCase(null);
    setHighlightMode(false);
    setRawRenderedHTML('');
  };

  const toggleHighlightMode = () => {
    setHighlightMode((prev) => !prev);
  };

  const handleAddHighlight = async () => {
    if (!selectedCase) return;
    const selection = window.getSelection().toString().trim();
    if (!selection) {
      alert('No text selected.');
      return;
    }

    try {
      const updatedHighlights = [...(selectedCase.highlights || []), selection];
      const caseRef = doc(db, 'caseSummaries', selectedCase.id);
      await updateDoc(caseRef, { highlights: updatedHighlights });

      const updatedCase = {
        ...selectedCase,
        highlights: updatedHighlights,
      };
      setSelectedCase(updatedCase);
      setRawRenderedHTML(applyHighlightsToText(updatedCase.content, updatedCase.highlights));

      setCaseList((prev) =>
        prev.map((c) => (c.id === selectedCase.id ? updatedCase : c))
      );
    } catch (error) {
      console.error('Error updating highlights:', error);
      alert('Error saving highlight to Firestore.');
    }
  };

  const handleDeleteCase = async (caseId) => {
    try {
      await deleteDoc(doc(db, 'caseSummaries', caseId));
      setCaseList((prev) => prev.filter((c) => c.id !== caseId));
      if (selectedCase && selectedCase.id === caseId) closeCase();
    } catch (err) {
      console.error('Error deleting case summary:', err);
      alert('Error deleting case summary.');
    }
  };

  const filteredCases = caseList.filter((c) => {
    const s = searchTerm.toLowerCase();
    if (!s.trim()) return true;
    return (
      c.title.toLowerCase().includes(s) ||
      c.content.toLowerCase().includes(s) ||
      c.course.toLowerCase().includes(s) ||
      c.keyTakeaways.toLowerCase().includes(s)
    );
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
          <p className="mb-4 text-lg font-semibold">Please log in to access your Case Summaries.</p>
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
      {/* Sidebar + overlay */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/lawtools/casesummaries"
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-4 overflow-auto">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-6">
          {/* Toggle Button */}
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
                  key="menu-icon"
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

          {/* Search */}
          <div className="flex items-center bg-white/20 dark:bg-white/10 rounded-full px-3 py-2">
            <FaSearch className="text-white/70 mr-2" />
            <input
              type="text"
              placeholder="Search Summaries..."
              className="bg-transparent placeholder-white/70 focus:outline-none text-sm text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Cross-links */}
          <div className="flex gap-3">
            <Link
              href="/lawtools/caseanalysis"
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
            >
              Case Analysis
            </Link>
            <Link
              href="/lawtools/allbriefs"
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
            >
              All Briefs
            </Link>
          </div>
        </div>

        {/* Input Form */}
        <div className="w-full max-w-4xl mx-auto bg-white/50 dark:bg-slate-700/50 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8">
          <h2 className="text-xl font-bold mb-4">Add a Case Summary</h2>
          <input
            type="text"
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
            placeholder="Case Title..."
            className="w-full mb-3 p-3 rounded-md shadow-inner text-sm focus:outline-none border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 dark:text-white"
          />
          <textarea
            value={caseContent}
            onChange={(e) => setCaseContent(e.target.value)}
            placeholder="Case Notes..."
            rows={5}
            className="w-full mb-3 p-3 rounded-md shadow-inner text-sm focus:outline-none border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 dark:text-white"
          />
          <input
            type="text"
            value={caseCourse}
            onChange={(e) => setCaseCourse(e.target.value)}
            placeholder="Subject/Topic (e.g. 'Contracts')"
            className="w-full mb-3 p-3 rounded-md shadow-inner text-sm focus:outline-none border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 dark:text-white"
          />
          <textarea
            value={caseKeyTakeaways}
            onChange={(e) => setCaseKeyTakeaways(e.target.value)}
            placeholder="Key Takeaways..."
            rows={2}
            className="w-full mb-3 p-3 rounded-md shadow-inner text-sm focus:outline-none border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={handleAddCase}
            className={`px-4 py-2 mt-2 rounded-md text-sm font-semibold tracking-wide transition-colors duration-300 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-950 hover:bg-blue-800 text-white'
            }`}
          >
            Add Summary
          </button>
        </div>

        {/* Case List */}
        <div className="w-full max-w-4xl mx-auto flex-1 overflow-y-auto p-4 rounded-2xl backdrop-blur-md bg-white/30 dark:bg-slate-700/30 shadow-2xl">
          <h3 className="text-lg font-bold mb-4">Your Case Summaries</h3>
          {filteredCases.length > 0 ? (
            filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="mb-4 p-4 border border-transparent bg-white/70 dark:bg-slate-800/70 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openCase(caseItem)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-semibold text-blue-700 dark:text-blue-300 line-clamp-1">
                    {caseItem.title}
                  </h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-900 text-white dark:bg-blue-200 dark:text-blue-900">
                    {caseItem.course || 'General'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                  {caseItem.content}
                </p>
                {caseItem.keyTakeaways && (
                  <p className="mt-1 text-xs italic text-blue-600 dark:text-blue-400 line-clamp-1">
                    Takeaways: {caseItem.keyTakeaways}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-white/80 text-sm">
              No matching case summaries found.
            </p>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            className="relative w-11/12 max-w-3xl p-6 rounded-2xl shadow-2xl bg-white dark:bg-slate-800 text-black dark:text-white"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-2">{selectedCase.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Subject: {selectedCase.course || 'General'}
            </p>
            <div className="max-h-64 overflow-auto border-b border-gray-300 pb-3 mb-4">
              <div
                dangerouslySetInnerHTML={{ __html: rawRenderedHTML }}
                className="whitespace-pre-wrap text-sm leading-relaxed"
              />
            </div>
            {selectedCase.keyTakeaways && (
              <div className="p-3 rounded-md border border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-slate-700 mb-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-300 mb-1 text-sm">
                  Key Takeaways
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-100 whitespace-pre-wrap">
                  {selectedCase.keyTakeaways}
                </p>
              </div>
            )}

            {/* Highlight Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleHighlightMode}
                  className={`px-3 py-2 rounded-md flex items-center space-x-2 transition-colors duration-300 ${
                    highlightMode
                      ? 'bg-yellow-300 text-yellow-900'
                      : 'bg-gray-200 dark:bg-slate-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
                  }`}
                >
                  <FaHighlighter />
                  <span className="text-sm">
                    {highlightMode ? 'Highlight ON' : 'Highlight OFF'}
                  </span>
                </button>
                {highlightMode && (
                  <button
                    onClick={handleAddHighlight}
                    className="px-3 py-2 rounded-md bg-yellow-400 text-yellow-900 hover:bg-yellow-500 text-sm font-semibold"
                  >
                    Highlight Selection
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDeleteCase(selectedCase.id)}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
                >
                  Delete
                </button>
                <button
                  onClick={closeCase}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-950 hover:bg-blue-800 text-white'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
