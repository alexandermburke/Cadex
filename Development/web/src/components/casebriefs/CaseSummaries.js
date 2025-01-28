'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../Sidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Auth
import { useAuth } from '@/context/AuthContext';

export default function CaseSummaries() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // For "capCase" if we have ?caseId=
  const [capCase, setCapCase] = useState(null);
  const [caseBrief, setCaseBrief] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [bulletpointView, setBulletpointView] = useState(false);

  // Read ?caseId= from URL
  const capCaseId = searchParams.get('caseId');

  // If not logged in, bounce
  useEffect(() => {
    if (!currentUser) {
      return;
    }
  }, [currentUser]);

  // If we have a ?caseId=, fetch that case from Firestore + check for stored "detailedSummary"
  useEffect(() => {
    if (!currentUser || !capCaseId) return;

    const fetchCapCaseAndSummary = async () => {
      try {
        const docRef = doc(db, 'capCases', capCaseId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.error(`Case with ID ${capCaseId} not found in capCases.`);
          return;
        }

        const fetchedCase = { id: docSnap.id, ...docSnap.data() };
        setCapCase(fetchedCase);

        // Check if we already have a "detailedSummary" in Firestore
        if (fetchedCase.detailedSummary) {
          console.log('Using existing detailedSummary from Firestore.');
          setCaseBrief(fetchedCase.detailedSummary);
        } else {
          // Otherwise, fetch a new "detailed" version from the API
          await getCapCaseSummary(fetchedCase);
        }
      } catch (error) {
        console.error('Error fetching the capCase:', error);
      }
    };

    fetchCapCaseAndSummary();
  }, [capCaseId, currentUser]);

  // Ask the AI API for a "detailed" summary
  const getCapCaseSummary = async (capCaseObj) => {
    setIsSummaryLoading(true);
    setCaseBrief(null);

    try {
      const payload = {
        title: capCaseObj.title,
        date: capCaseObj.decisionDate || '',
        detailed: true, // Indicate to your /api/casebrief-summary that we want an extended version
      };

      const res = await fetch('/api/casebrief-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to get summary:', errorData.error);
        setCaseBrief({ error: errorData.error || 'No summary available.' });
        return;
      }

      const data = await res.json();
      setCaseBrief(data);

      // Store the "detailed" summary in Firestore
      await updateDoc(doc(db, 'capCases', capCaseObj.id), {
        detailedSummary: {
          ruleOfLaw: data.ruleOfLaw || '',
          facts: data.facts || '',
          issue: data.issue || '',
          holding: data.holding || '',
          reasoning: data.reasoning || '',
          dissent: data.dissent || '',
        },
      });

      // Also update local capCase so we don’t re-fetch
      setCapCase((prev) =>
        prev
          ? {
              ...prev,
              detailedSummary: {
                ruleOfLaw: data.ruleOfLaw || '',
                facts: data.facts || '',
                issue: data.issue || '',
                holding: data.holding || '',
                reasoning: data.reasoning || '',
                dissent: data.dissent || '',
              },
            }
          : null
      );
    } catch (err) {
      console.error('Error fetching summary for full view:', err);
      setCaseBrief({ error: 'Error fetching summary.' });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // If the user isn’t logged in, simple message
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
            Please log in to access your Case Summaries.
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

  // If we DO have a caseId and we've fetched that case => Show the FULL PAGE DETAILED
  if (capCaseId && capCase) {
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
                activeLink="/casebriefs/summaries"
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
          {/* Mobile Sidebar Toggle Button */}
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

          <div
            className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
                : 'bg-white text-gray-800'
            } flex flex-col`}
          >
            <h1 className="text-2xl font-bold mb-4">
              Full Case Brief (Detailed)
            </h1>

            <div
              className={`p-6 rounded-xl mb-6 ${
                isDarkMode
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              }`}
            >
              <h2 className="text-xl font-semibold">{capCase.title}</h2>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {capCase.jurisdiction || 'Unknown'} | Volume:{' '}
                {capCase.volume || 'N/A'} | Date: {capCase.decisionDate || 'N/A'}
              </p>
            </div>

            {/* Full text */}
            <div
              className={`max-h-60 overflow-auto rounded-xl mb-6 p-4 ${
                isDarkMode
                  ? 'bg-slate-700 border border-slate-600 text-gray-100'
                  : 'bg-gray-50 border border-gray-200 text-gray-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {capCase.content || 'No detailed content available.'}
              </p>
            </div>

            {/* Bulletpoints vs. Normal */}
            <div className="flex items-center gap-3 mb-4">
              <label className="font-semibold text-sm">
                {bulletpointView ? 'Bullet Points' : 'Classic View'}
              </label>
              <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  id="bulletPointsToggle"
                  checked={bulletpointView}
                  onChange={(e) => setBulletpointView(e.target.checked)}
                  className="toggle-checkbox absolute h-0 w-0 opacity-0"
                />
                <label
                  htmlFor="bulletPointsToggle"
                  className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
            </div>

            {/* AI Summary (detailed) */}
            {isSummaryLoading ? (
              <div className="text-sm text-gray-400">
                Loading detailed summary...
              </div>
            ) : caseBrief ? (
              caseBrief.error ? (
                <div className="text-sm text-red-500">
                  {caseBrief.error || 'No summary available.'}
                </div>
              ) : (
                <div
                  className={`p-4 rounded-xl ${
                    isDarkMode
                      ? 'bg-slate-800 text-white border border-blue-600'
                      : 'bg-white text-gray-800 border border-blue-200'
                  }`}
                >
                  <h3
                    className={`font-bold mb-2 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}
                  >
                    Detailed Case Brief
                  </h3>

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

                  <div className="mb-3">
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
                    Summarized by LExAPI 3.0 (Detailed Mode)
                  </div>
                </div>
              )
            ) : (
              <div className="text-sm text-gray-400">No summary available.</div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // No ?caseId => Show a simple centered message
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
              activeLink="/casebriefs/summaries"
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
        {/* Mobile Sidebar Toggle Button */}
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

        <div
          className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto ${
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-gray-800'
          } flex flex-col items-center justify-center`}
        >
          <h2 className="text-xl font-semibold mb-4">No Case Selected</h2>
          <p className="text-base max-w-lg text-center">
            Please open <strong>All Briefs</strong> and select a case if you’d
            like to view its full summary here.
          </p>
        </div>
      </main>
    </div>
  );
}
