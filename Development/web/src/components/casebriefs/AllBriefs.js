'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight,
} from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';

// Firebase
import { db } from '@/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

// Auth
import { useAuth } from '@/context/AuthContext';

// Next.js Link
import Link from 'next/link';

export default function AllBriefs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, userDataObj } = useAuth();

  // Dark mode preference
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar state
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Collection data
  const [capCases, setCapCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Selected case and AI-generated brief
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseBrief, setCaseBrief] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Bullet-point or paragraph view
  const [bulletpointView, setBulletpointView] = useState(false);

  // Pagination
  const ITEMS_PER_PAGE = 21;
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------------------------------
  // Fetch all capCases from Firestore (if logged in)
  // -------------------------------------------------
  useEffect(() => {
    if (!currentUser) return;

    const fetchCapCases = async () => {
      setIsLoading(true);
      try {
        const snap = await getDocs(collection(db, 'capCases'));
        const loaded = [];
        snap.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() });
        });
        setCapCases(loaded);
        console.log(`Fetched ${loaded.length} cases from Firestore.`);
      } catch (err) {
        console.error('Error fetching capCases:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCapCases();
  }, [currentUser]);

  // If there's a ?caseId= param, open that case automatically once we have the data
  useEffect(() => {
    const caseIdParam = searchParams.get('caseId');
    if (caseIdParam && capCases.length > 0) {
      const found = capCases.find((c) => c.id === caseIdParam);
      if (found) {
        console.log(`Opening case with ID: ${caseIdParam}`);
        openCase(found);
      } else {
        console.warn(`Case with ID ${caseIdParam} not found.`);
      }
    }
  }, [searchParams, capCases]);

  // Redirect if not logged in
  if (!currentUser) {
    return (
      <div
        className={`flex items-center justify-center h-full transition-colors ${
          isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-800'
        }`}
      >
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
          <p className="mb-4 text-lg font-semibold">
            Please log in to access the case database.
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

  // -----------------------------
  // Search & Pagination
  // -----------------------------
  const filteredCases = capCases.filter((item) => {
    const s = searchTerm.toLowerCase();
    const title = item.title?.toLowerCase() || '';
    const jurisdiction = item.jurisdiction?.toLowerCase() || '';
    const volume = item.volume?.toLowerCase() || '';
    const decisionDate = item.decisionDate?.toLowerCase() || '';
    const content = item.content?.toLowerCase() || '';

    return (
      title.includes(s) ||
      jurisdiction.includes(s) ||
      volume.includes(s) ||
      decisionDate.includes(s) ||
      content.includes(s)
    );
  });

  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = currentPage * ITEMS_PER_PAGE;
  const paginatedCases = filteredCases.slice(startIndex, endIndex);

  const goToPage = (num) => setCurrentPage(num);
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // -----------------------------
  // Log recent activity in "users" doc
  // -----------------------------
  const logCaseView = async (c) => {
    console.log(`Logging view for case ID: ${c.id}`);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        console.warn(
          `User document for UID ${currentUser.uid} does not exist.`
        );
        return;
      }

      const userData = userSnap.data() || {};
      let recentActivity = userData.recentActivity || [];

      // Prepend new item
      const now = new Date();
      const activityItem = {
        type: 'brief',
        name: c.title,
        itemId: c.id,
        date: now.toISOString(),
      };
      recentActivity.unshift(activityItem);

      // Keep only the latest 3 activities
      recentActivity = recentActivity.slice(0, 3);

      await updateDoc(userDocRef, { recentActivity });
      console.log('Recent activity updated:', recentActivity);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // -----------------------------
  // Modal open/close + fetch summary
  // -----------------------------
  const openCase = async (c) => {
    console.log(`Opening case: ${c.title} (ID: ${c.id})`);
    setSelectedCase(c);
    setCaseBrief(null);

    // Log user view
    await logCaseView(c);

    // If a summary is already stored, just use it
    if (c.briefSummary) {
      console.log('Using existing briefSummary from Firestore.');
      setCaseBrief(c.briefSummary);
      return;
    }

    // Otherwise, fetch the summary from the API
    setIsSummaryLoading(true);

    try {
      const payload = {
        title: c.title,
        date: c.decisionDate || '', // Add date for more context
      };

      console.log('Fetching summary from /api/casebrief-summary with:', payload);
      const res = await fetch('/api/casebrief-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to get summary from server:', errorData.error);
        setCaseBrief({ error: errorData.error || 'No summary available.' });
        return;
      }

      const data = await res.json();
      console.log('Summary data received:', data);

      // Save the generated summary into Firestore
      await updateDoc(doc(db, 'capCases', c.id), {
        briefSummary: {
          ruleOfLaw: data.ruleOfLaw || '',
          facts: data.facts || '',
          issue: data.issue || '',
          holding: data.holding || '',
          reasoning: data.reasoning || '',
          dissent: data.dissent || '',
        },
      });

      // Update local state so we can display it
      setCaseBrief(data);

      // Also update our local capCases array with the new data
      setCapCases((prev) =>
        prev.map((cc) =>
          cc.id === c.id
            ? {
                ...cc,
                briefSummary: {
                  ruleOfLaw: data.ruleOfLaw || '',
                  facts: data.facts || '',
                  issue: data.issue || '',
                  holding: data.holding || '',
                  reasoning: data.reasoning || '',
                  dissent: data.dissent || '',
                },
              }
            : cc
        )
      );
    } catch (error) {
      console.error('Error fetching summary:', error);
      setCaseBrief({ error: 'Error fetching summary.' });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const closeCase = () => {
    console.log('Closing case modal.');
    setSelectedCase(null);
    setCaseBrief(null);
  };

  // -----------------------------
  // Toggle bullet points vs. normal
  // -----------------------------
  const handleBulletpointToggle = (e) => {
    setBulletpointView(e.target.checked);
    console.log(`Bulletpoint view set to: ${e.target.checked}`);
  };

  return (
    <div
      className={`relative flex h-screen transition-colors duration-500 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}
    >
      {/* Sidebar + overlay */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/casebriefs/allbriefs"
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

      {/* Main content */}
      <main className="flex-1 flex flex-col px-6 relative z-200 h-screen">
        {/* Header area */}
        <div className="flex items-center justify-between">
          {/* Toggle (Mobile) */}
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

        {/* Body */}
        <div
          className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-gray-800'
          } flex flex-col items-center`}
        >
          {/* Search bar */}
          <div className="mb-6 w-full flex justify-center">
            <div className="relative flex items-center bg-gray-50 dark:bg-white/10 rounded-full px-3 py-2 w-full max-w-md">
              <FaSearch className="text-gray-700 dark:text-white/70 mr-2" />
              <input
                type="text"
                placeholder="Search Cases..."
                className="bg-transparent placeholder-gray-500 dark:placeholder-white/70 focus:outline-none text-sm flex-1"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                  console.log(`Search term updated: ${e.target.value}`);
                }}
              />
            </div>
          </div>

          {/* Cases Grid or loading */}
          {isLoading ? (
            <div className="w-full h-1 bg-blue-500 animate-pulse" />
          ) : paginatedCases.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {paginatedCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => openCase(c)}
                    className={`p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow ${
                      isDarkMode
                        ? 'bg-slate-700 text-white'
                        : 'bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-semibold line-clamp-1">
                        {c.title}
                      </h3>
                      <span
                        className={`text-xs py-1 px-2 rounded-full ${
                          isDarkMode
                            ? 'bg-blue-200 text-blue-900'
                            : 'bg-blue-900 text-white'
                        }`}
                      >
                        {c.jurisdiction || 'Unknown'}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Volume: {c.volume || 'N/A'}
                    </p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Date: {c.decisionDate || 'N/A'}
                    </p>
                    <p
                      className={`text-xs mt-2 line-clamp-2 italic ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-600'
                      }`}
                    >
                  {c.briefSummary?.facts?.slice(0, 100) || 'No content generated'}...
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                    currentPage === 1
                      ? 'bg-gray-300 cursor-not-allowed opacity-70'
                      : isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-950 hover:bg-blue-800 text-white'
                  }`}
                >
                  <FaChevronLeft /> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`px-3 py-1 rounded-full font-semibold ${
                        num === currentPage
                          ? isDarkMode
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-800 text-white'
                          : isDarkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                    currentPage === totalPages || totalPages === 0
                      ? 'bg-gray-300 cursor-not-allowed opacity-70'
                      : isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-950 hover:bg-blue-800 text-white'
                  }`}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            </>
          ) : (
            <p
              className={`text-base mt-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {searchTerm
                ? 'No matching cases found.'
                : 'No cases available at the moment.'}
            </p>
          )}
        </div>
      </main>

      {/* View Brief Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            className={`relative w-11/12 max-w-5xl p-6 rounded-2xl shadow-2xl ${
              isDarkMode
                ? 'bg-slate-800 text-gray-100'
                : 'bg-white text-gray-900'
            }`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedCase.title}</h2>
                <p
                  className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {selectedCase.jurisdiction || 'Unknown'} | Volume:{' '}
                  {selectedCase.volume || 'N/A'} | Date:{' '}
                  {selectedCase.decisionDate || 'N/A'}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Summarized by LExAPI 3.0 AI assistant (Beta)
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={closeCase}
                className={`inline-block px-3 py-1 rounded-full font-semibold text-sm transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-950 hover:bg-blue-800 text-white'
                }`}
                aria-label="Close Brief Modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Case Full Text */}
            <div
              className={`max-h-60 overflow-auto border-b pb-3 mb-4 ${
                isDarkMode
                  ? 'border-gray-600 text-gray-200'
                  : 'border-gray-300 text-gray-800'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap text-sm">
                {selectedCase.content ||
                  'No detailed content available for this case.'}
              </p>
            </div>

            {/* Toggle bullet points vs. normal */}
            <div className="flex items-center gap-3 mb-4">
              <label className="font-semibold text-sm">
                {bulletpointView ? 'Bullet Points' : 'Classic View'}
              </label>
              <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  id="bulletPointsToggle"
                  checked={bulletpointView}
                  onChange={handleBulletpointToggle}
                  className="toggle-checkbox absolute h-0 w-0 opacity-0"
                />
                <label
                  htmlFor="bulletPointsToggle"
                  className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
            </div>

            {/* Structured Case Brief */}
            {isSummaryLoading ? (
              <div className="text-sm text-gray-400">Loading summary...</div>
            ) : caseBrief ? (
              caseBrief.error ? (
                <div className="text-sm text-red-500">
                  {caseBrief.error || 'No summary available.'}
                </div>
              ) : (
                <div
                  className={`p-3 rounded-md ${
                    isDarkMode
                      ? 'bg-slate-700 border border-blue-600'
                      : 'bg-white border border-blue-200'
                  }`}
                >
                  <h3
                    className={`font-bold mb-2 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}
                  >
                    Case Brief
                  </h3>

                  {/* Rule of Law */}
                  <div className="mb-3">
                    <strong>Rule of Law:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-sm mt-1">
                        <li>{caseBrief.ruleOfLaw || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-sm mt-1">
                        {caseBrief.ruleOfLaw || 'Not provided.'}
                      </p>
                    )}
                  </div>

                  {/* Facts */}
                  <div className="mb-3">
                    <strong>Facts:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-sm mt-1">
                        <li>{caseBrief.facts || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-sm mt-1">
                        {caseBrief.facts || 'Not provided.'}
                      </p>
                    )}
                  </div>

                  {/* Issue */}
                  <div className="mb-3">
                    <strong>Issue:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-sm mt-1">
                        <li>{caseBrief.issue || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-sm mt-1">
                        {caseBrief.issue || 'Not provided.'}
                      </p>
                    )}
                  </div>

                  {/* Holding */}
                  <div className="mb-3">
                    <strong>Holding:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-sm mt-1">
                        <li>{caseBrief.holding || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-sm mt-1">
                        {caseBrief.holding || 'Not provided.'}
                      </p>
                    )}
                  </div>

                  {/* Reasoning */}
                  <div className="mb-3">
                    <strong>Reasoning:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-sm mt-1">
                        <li>{caseBrief.reasoning || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-sm mt-1">
                        {caseBrief.reasoning || 'Not provided.'}
                      </p>
                    )}
                  </div>

                  {/* Dissent */}
                  <div>
                    <strong>Dissent:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-sm mt-1">
                        <li>{caseBrief.dissent || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-sm mt-1">
                        {caseBrief.dissent || 'Not provided.'}
                      </p>
                    )}
                  </div>
                  <div className="text-xs italic text-gray-400">
                    Verified by LExAPI 3.0
                  </div>

                  {/* "See full Case Brief ->" -> Link to /casebriefs/summaries */}
                  <Link
                    href={`/casebriefs/summaries?caseId=${selectedCase.id}`}
                    className="mt-3 text-blue-600 hover:underline cursor-pointer flex items-center gap-1 text-sm font-semibold"
                  >
                    See full Case Brief
                    <FaArrowRight />
                  </Link>
                </div>
              )
            ) : (
              <div className="text-sm text-gray-400">No summary available.</div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
