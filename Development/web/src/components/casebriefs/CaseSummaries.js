'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '../Sidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaBars, FaTimes, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const simplifyText = (text = '', maxLength = 400) => {
  if (!text) return 'Not provided.';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default function CaseSummaries() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const [capCase, setCapCase] = useState(null);
  // caseBrief will hold either the detailedSummary or the briefSummary depending on viewMode
  const [caseBrief, setCaseBrief] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [reRunCount, setReRunCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const capCaseId = searchParams.get('caseId');
  const pdfRef = useRef(null);

  // --- View Modes: 'classic', 'bulletpoint', 'simplified' ---
  // When in simplified mode, we will show the briefSummary from Firebase.
  const [viewMode, setViewMode] = useState('classic');
  const viewModes = [
    { label: 'Classic', value: 'classic' },
    { label: 'Bullets', value: 'bulletpoint' },
    { label: 'Simple', value: 'simplified' },
  ];
  const selectedIndex = viewModes.findIndex((m) => m.value === viewMode);

  const [relatedCases, setRelatedCases] = useState([]);

  // Helper functions for rendering fields according to view mode.
  const renderFieldContent = (fieldText) => {
    if (!fieldText) return 'Not provided.';
    if (viewMode === 'bulletpoint') {
      return (
        <ul className="list-disc list-inside text-base mt-2">
          <li>{fieldText}</li>
        </ul>
      );
    } else if (viewMode === 'simplified') {
      return <p className="text-base mt-2">{simplifyText(fieldText)}</p>;
    }
    return <p className="text-base mt-2">{fieldText}</p>;
  };

  const renderFactsContent = (factsText) => {
    if (!factsText) return <p className="text-base mt-2">Not provided.</p>;

    // Attempt to parse enumerated facts "1. fact", "2. fact", etc.
    const enumeratedFacts = factsText.match(/(?:\d\.\s*[^0-9]+)/g);

    if (viewMode === 'simplified') {
      return <p className="text-base mt-2">{simplifyText(factsText)}</p>;
    }

    if (enumeratedFacts && enumeratedFacts.length > 0) {
      if (viewMode === 'bulletpoint') {
        return (
          <ul className="list-disc list-inside text-base mt-2">
            {enumeratedFacts.map((fact, index) => {
              const strippedFact = fact.replace(/^\d+\.\s*/, '');
              return <li key={index}>{strippedFact.trim()}</li>;
            })}
          </ul>
        );
      }
      return (
        <>
          {enumeratedFacts.map((fact, index) => {
            const strippedFact = fact.replace(/^\d+\.\s*/, '');
            return (
              <p key={index} className="text-base mt-2">
                {strippedFact.trim()}
              </p>
            );
          })}
        </>
      );
    }
    return <p className="text-base mt-2">{factsText}</p>;
  };

  useEffect(() => {
    if (!currentUser) return;
  }, [currentUser]);

  // Fetch the main case and its summary.
  // If viewMode is 'simplified', use briefSummary; otherwise, use detailedSummary.
  useEffect(() => {
    if (!currentUser || !capCaseId) return;

    const fetchCapCaseAndSummary = async () => {
      try {
        const docRef = doc(db, 'capCases', capCaseId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.error(`Case with ID ${capCaseId} not found.`);
          return;
        }
        const fetchedCase = { id: docSnap.id, ...docSnap.data() };
        setCapCase(fetchedCase);

        if (viewMode === 'simplified') {
          if (fetchedCase.briefSummary) {
            setCaseBrief(fetchedCase.briefSummary);
            if (fetchedCase.briefSummary.verified === true) {
              setIsVerified(true);
            } else {
              await verifyBriefSummary(fetchedCase.briefSummary, fetchedCase);
            }
          } else {
            await getCapCaseBriefSummary(fetchedCase);
          }
        } else {
          if (fetchedCase.detailedSummary) {
            setCaseBrief(fetchedCase.detailedSummary);
            if (fetchedCase.detailedSummary.verified === true) {
              setIsVerified(true);
            } else {
              await verifyDetailedSummary(fetchedCase.detailedSummary, fetchedCase);
            }
          } else {
            await getCapCaseSummary(fetchedCase);
          }
        }
      } catch (error) {
        console.error('Error fetching the capCase:', error);
      }
    };

    fetchCapCaseAndSummary();
  }, [capCaseId, currentUser, viewMode]);

  // Fetch related cases (e.g., by matching jurisdiction)
  useEffect(() => {
    if (!capCase) return;

    const fetchRelatedCases = async () => {
      try {
        const q = query(
          collection(db, 'capCases'),
          where('jurisdiction', '==', capCase.jurisdiction || ''),
          where('__name__', '!=', capCase.id),
          limit(3)
        );
        const querySnap = await getDocs(q);
        const results = [];
        querySnap.forEach((docItem) => {
          results.push({ id: docItem.id, ...docItem.data() });
        });
        setRelatedCases(results);
      } catch (e) {
        console.error('Error fetching related cases:', e);
      }
    };

    fetchRelatedCases();
  }, [capCase]);

  // Fetch a new detailed summary (for classic and bulletpoint view modes)
  const getCapCaseSummary = async (capCaseObj) => {
    setIsSummaryLoading(true);
    setCaseBrief(null);
    try {
      const payload = {
        title: capCaseObj.title,
        date: capCaseObj.decisionDate || '',
        detailed: true,
      };

      const res = await fetch('/api/casebrief-detailed', {
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

      await updateDoc(doc(db, 'capCases', capCaseObj.id), {
        detailedSummary: {
          ruleOfLaw: data.ruleOfLaw || '',
          facts: data.facts || '',
          issue: data.issue || '',
          holding: data.holding || '',
          reasoning: data.reasoning || '',
          dissent: data.dissent || '',
          verified: false,
        },
      });

      setCapCase((prev) =>
        prev ? { ...prev, detailedSummary: { ...data, verified: false } } : null
      );

      await verifyDetailedSummary(data, capCaseObj);
    } catch (err) {
      console.error('Error fetching summary for full view:', err);
      setCaseBrief({ error: 'Error fetching summary.' });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Fetch a new brief summary (for simplified view mode)
  const getCapCaseBriefSummary = async (capCaseObj) => {
    setIsSummaryLoading(true);
    setCaseBrief(null);
    try {
      const payload = {
        title: capCaseObj.title,
        date: capCaseObj.decisionDate || '',
      };

      const res = await fetch('/api/casebrief-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to get brief summary:', errorData.error);
        setCaseBrief({ error: errorData.error || 'No summary available.' });
        return;
      }

      const data = await res.json();
      setCaseBrief(data);

      await updateDoc(doc(db, 'capCases', capCaseObj.id), {
        briefSummary: {
          ruleOfLaw: data.ruleOfLaw || '',
          facts: data.facts || '',
          issue: data.issue || '',
          holding: data.holding || '',
          reasoning: data.reasoning || '',
          dissent: data.dissent || '',
          verified: false,
        },
      });

      setCapCase((prev) =>
        prev ? { ...prev, briefSummary: { ...data, verified: false } } : null
      );

      await verifyBriefSummary(data, capCaseObj);
    } catch (err) {
      console.error('Error fetching brief summary for simple view:', err);
      setCaseBrief({ error: 'Error fetching summary.' });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Verify the detailed summary
  const verifyDetailedSummary = async (summaryData, capCaseObj) => {
    try {
      const verifyRes = await fetch('/api/casebrief-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefSummary: summaryData,
          caseTitle: capCaseObj.title,
          decisionDate: capCaseObj.decisionDate,
          jurisdiction: capCaseObj.jurisdiction,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.verified === true) {
        await updateDoc(doc(db, 'capCases', capCaseObj.id), {
          'detailedSummary.verified': true,
        });
        setIsVerified(true);
      } else {
        console.log('Verification explanation:', verifyData.explanation);
        setIsVerified(false);
        if (reRunCount < 1) {
          setReRunCount(reRunCount + 1);
          await getCapCaseSummary(capCaseObj);
        }
      }
    } catch (verifyError) {
      console.error('Error verifying summary:', verifyError);
      setIsVerified(false);
    }
  };

  // Verify the brief summary (for simplified view)
  const verifyBriefSummary = async (summaryData, capCaseObj) => {
    try {
      const verifyRes = await fetch('/api/casebrief-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefSummary: summaryData,
          caseTitle: capCaseObj.title,
          decisionDate: capCaseObj.decisionDate,
          jurisdiction: capCaseObj.jurisdiction,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.verified === true) {
        await updateDoc(doc(db, 'capCases', capCaseObj.id), {
          'briefSummary.verified': true,
        });
        setIsVerified(true);
      } else {
        console.log('Verification explanation:', verifyData.explanation);
        setIsVerified(false);
        if (reRunCount < 1) {
          setReRunCount(reRunCount + 1);
          await getCapCaseBriefSummary(capCaseObj);
        }
      }
    } catch (verifyError) {
      console.error('Error verifying brief summary:', verifyError);
      setIsVerified(false);
    }
  };

  // PDF export functionality
  const saveAsPDF = async () => {
    if (!pdfRef.current) return;

    try {
      const originalFontSize = pdfRef.current.style.fontSize;
      pdfRef.current.style.fontSize = '24px';

      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${capCase?.title || 'case-brief'}.pdf`);

      pdfRef.current.style.fontSize = originalFontSize;
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Citation generators
  const generateCitation = (caseObj, reporter = 'U.S.', page = '___') => {
    let year = '____';
    if (caseObj.decisionDate) {
      const parsedDate = new Date(caseObj.decisionDate);
      if (!isNaN(parsedDate)) {
        year = parsedDate.getFullYear();
      }
    }
    return `${caseObj.title || 'N/A'}, ${caseObj.volume || '___'} ${reporter} ${page} (${year})`;
  };

  const generateBluebookCitation = (caseObj, page = '___') => {
    const baseCitation = generateCitation(caseObj, 'U.S.', page);
    return `Bluebook: ${baseCitation}`;
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

  return (
    <div
      ref={pdfRef}
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

        <div
          className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-gray-800'
          } flex flex-col items-center`}
        >
          <h1 className="text-2xl font-bold mb-4">
            {viewMode === 'simplified' ? 'Case Brief (Simple)' : 'Full Case Brief (Detailed)'}
          </h1>

          {/* Case Info */}
          <div
            className={`p-6 rounded-xl mb-6 ${
              isDarkMode
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-gray-100 text-gray-800 border border-gray-300'
            }`}
          >
            <h2 className="text-xl font-semibold">{capCase?.title}</h2>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {capCase?.jurisdiction || 'Unknown'} | Volume: {capCase?.volume || 'N/A'} | Date:{' '}
              {capCase?.decisionDate || 'N/A'}
            </p>
            <div className="flex items-center text-xs mt-1">
              <span className="text-gray-400">
                Verified by LExAPI 3.0 ({viewMode === 'simplified' ? 'Simple Mode' : 'Detailed Mode'})
              </span>
              {isVerified ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="ml-2 flex items-center justify-center w-6 h-6 border-2 border-emerald-500 rounded-full"
                >
                  <span className="text-emerald-500 font-bold text-lg">✓</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="ml-2 flex items-center justify-center w-6 h-6 border-2 border-red-500 rounded-full"
                >
                  <span className="text-red-500 font-bold text-lg">✕</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* 3-Way Animated Toggle for viewMode */}
          <div className="relative flex items-center justify-center mb-6">
            <div
              className={`relative flex items-center rounded-full p-1 ${
                isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
              }`}
              style={{ width: '240px' }}
            >
              <motion.div
                className={`absolute top-0 left-0 h-full rounded-full ${
                  isDarkMode ? 'bg-slate-600' : 'bg-white'
                } shadow`}
                style={{ width: '33.33%' }}
                initial={false}
                animate={{ x: `${selectedIndex * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              {viewModes.map((mode, i) => (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value)}
                  className={`relative z-10 flex-1 text-xs sm:text-sm font-semibold py-1 transition-colors ${
                    selectedIndex === i
                      ? isDarkMode
                        ? 'text-blue-300'
                        : 'text-blue-600'
                      : isDarkMode
                      ? 'text-gray-200'
                      : 'text-gray-700'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="w-full">
            {isSummaryLoading ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative w-16 h-16">
                  <svg className="transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-300"
                      strokeWidth="4"
                      fill="none"
                      d="
                        M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831
                      "
                    />
                    <path
                      className="text-blue-500 animate-progress"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray="25, 100"
                      d="
                        M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831
                      "
                    />
                  </svg>
                </div>
                <div className="text-sm text-gray-400">
                  We are verifying the Case Brief, please wait...
                </div>
              </div>
            ) : caseBrief ? (
              caseBrief.error ? (
                <div className="text-sm text-red-500">
                  {caseBrief.error || 'No summary available.'}
                </div>
              ) : (
                <div
                  className={`p-6 rounded-xl ${
                    isDarkMode
                      ? 'bg-slate-800 text-white border border-blue-600'
                      : 'bg-white text-gray-800 border border-blue-200'
                  }`}
                >
                  <h3
                    className={`font-bold mb-4 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    } text-lg`}
                  >
                    {viewMode === 'simplified'
                      ? 'Brief Case Summary'
                      : 'Detailed Case Brief'}
                  </h3>

                  <div className="mb-4">
                    <strong className="block text-lg">Rule of Law:</strong>
                    {renderFieldContent(caseBrief.ruleOfLaw)}
                  </div>

                  <div className="mb-4">
                    <strong className="block text-lg">Facts:</strong>
                    {renderFactsContent(caseBrief.facts)}
                  </div>

                  <div className="mb-4">
                    <strong className="block text-lg">Issue:</strong>
                    {renderFieldContent(caseBrief.issue)}
                  </div>

                  <div className="mb-4">
                    <strong className="block text-lg">Holding:</strong>
                    {renderFieldContent(caseBrief.holding)}
                  </div>

                  <div className="mb-4">
                    <strong className="block text-lg">Reasoning:</strong>
                    {renderFieldContent(caseBrief.reasoning)}
                  </div>

                  <div className="mb-4">
                    <strong className="block text-lg">Dissent:</strong>
                    {renderFieldContent(caseBrief.dissent)}
                  </div>
                </div>
              )
            ) : (
              <div className="text-sm text-gray-400">No summary available.</div>
            )}
          </div>

          {/* Related Cases */}
          <div className="w-full mt-8">
            <h2 className="text-lg font-bold mb-2">Related Cases</h2>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
              layout
            >
              <AnimatePresence>
                {relatedCases && relatedCases.length > 0 ? (
                  relatedCases.map((rcase) => (
                    <motion.div
                      key={rcase.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 rounded-xl shadow-lg cursor-pointer ${
                        isDarkMode
                          ? 'bg-slate-800 border border-slate-700 text-white'
                          : 'bg-white border border-gray-300 text-gray-800'
                      } hover:shadow-xl transition-shadow`}
                      onClick={() => router.push(`/casebriefs/summaries?caseId=${rcase.id}`)}
                    >
                      <h3 className="text-lg font-semibold mb-2 truncate">
                        {rcase.title}
                      </h3>
                      <p className="text-sm">
                        {rcase.jurisdiction || 'Unknown'}
                      </p>
                      <p className="text-xs mt-1 text-gray-400">
                        Volume: {rcase.volume || 'N/A'} | Date: {rcase.decisionDate || 'N/A'}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 col-span-full">
                    No related cases found.
                  </p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Citation Generator */}
          {capCase && (
            <div className="w-full mt-8">
              <h2 className="text-lg font-bold mb-2">Citation Generator</h2>
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode
                    ? 'bg-slate-800 border border-slate-700'
                    : 'bg-gray-100 border border-gray-300'
                }`}
              >
                <p className="text-base italic">
                  {generateCitation(capCase, 'U.S.', '113')}
                </p>
                <p className="text-base italic mt-2">
                  {generateBluebookCitation(capCase, '113')}
                </p>
              </div>
            </div>
          )}

          {/* PDF Save Button */}
          <motion.button
            onClick={saveAsPDF}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
            className="mt-6 p-3 rounded-full bg-blue-600 text-white shadow-lg"
            aria-label="Save as PDF"
          >
            <FaDownload size={24} />
          </motion.button>
        </div>
      </main>
    </div>
  );
}
