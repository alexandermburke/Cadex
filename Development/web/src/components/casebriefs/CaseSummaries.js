'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '../Sidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaBars, FaTimes, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CaseSummaries() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Store the case from Firestore
  const [capCase, setCapCase] = useState(null);

  // The AI-generated brief
  const [caseBrief, setCaseBrief] = useState(null);

  // For loading state
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Bullet-point or paragraph view
  const [bulletpointView, setBulletpointView] = useState(false);

  // Verification state
  const [isVerified, setIsVerified] = useState(false);

  // For re-running summary if it fails
  const [reRunCount, setReRunCount] = useState(0);

  // The case ID from the query params
  const capCaseId = searchParams.get('caseId');

  // A ref to capture the entire page for PDF
  const pdfRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
  }, [currentUser]);

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

        // If we already have a "detailedSummary"
        if (fetchedCase.detailedSummary) {
          setCaseBrief(fetchedCase.detailedSummary);
          if (fetchedCase.detailedSummary.verified === true) {
            setIsVerified(true);
          } else {
            await verifyDetailedSummary(fetchedCase.detailedSummary, fetchedCase);
          }
        } else {
          // Otherwise, fetch a new "detailed" summary
          await getCapCaseSummary(fetchedCase);
        }
      } catch (error) {
        console.error('Error fetching the capCase:', error);
      }
    };

    fetchCapCaseAndSummary();
  }, [capCaseId, currentUser]);

  // Fetch a new "detailed" summary
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

      // Store in Firestore
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
        prev
          ? { ...prev, detailedSummary: { ...data, verified: false } }
          : null
      );

      // Now verify
      await verifyDetailedSummary(data, capCaseObj);
    } catch (err) {
      console.error('Error fetching summary for full view:', err);
      setCaseBrief({ error: 'Error fetching summary.' });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Verify
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

        // Try re-run once if unverified
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

  // Toggle bullet points
  const handleBulletpointToggle = (e) => {
    setBulletpointView(e.target.checked);
  };

  // PDF export
  const saveAsPDF = async () => {
    if (!pdfRef.current) return;

    try {
      const originalFontSize = pdfRef.current.style.fontSize;
      // Increase temporarily for PDF clarity
      pdfRef.current.style.fontSize = '24px';

      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${capCase?.title || 'case-brief'}.pdf`);

      // Revert
      pdfRef.current.style.fontSize = originalFontSize;
    } catch (error) {
      console.error('Error generating PDF:', error);
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
          <h1 className="text-2xl font-bold mb-4">Full Case Brief (Detailed)</h1>

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
              <span className="text-gray-400">Verified by LExAPI 3.0 (Detailed Mode)</span>
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

          {/* Toggle bullet points */}
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

          {/* Detailed Summary / Loading / Error */}
          <div className="w-full">
            {isSummaryLoading ? (
              // REPLACED: "We are verifying..." with a circular progress
              <div className="flex flex-col items-center justify-center space-y-3">
                {/* Circular Progress Container */}
                <div className="relative w-16 h-16">
                  {/* Outer SVG (gray track) */}
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
                    {/* Animated colored arc */}
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
                    Detailed Case Brief
                  </h3>
                  {/* Rule of Law */}
                  <div className="mb-4">
                    <strong className="block text-lg">Rule of Law:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.ruleOfLaw || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">
                        {caseBrief.ruleOfLaw || 'Not provided.'}
                      </p>
                    )}
                  </div>
                  {/* Facts */}
                  <div className="mb-4">
                    <strong className="block text-lg">Facts:</strong>
                    {(() => {
                      if (!caseBrief.facts) {
                        return <p className="text-base mt-2">Not provided.</p>;
                      }
                      const factsArray = caseBrief.facts.match(/(?:\d\.\s*[^0-9]+)/g);
                      if (factsArray && factsArray.length > 0) {
                        return (
                          <ul className="list-disc list-inside text-base mt-2">
                            {factsArray.map((fact, index) => (
                              <li key={index}>{fact.trim()}</li>
                            ))}
                          </ul>
                        );
                      } else {
                        return <p className="text-base mt-2">{caseBrief.facts}</p>;
                      }
                    })()}
                  </div>
                  {/* Issue */}
                  <div className="mb-4">
                    <strong className="block text-lg">Issue:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.issue || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">
                        {caseBrief.issue || 'Not provided.'}
                      </p>
                    )}
                  </div>
                  {/* Holding */}
                  <div className="mb-4">
                    <strong className="block text-lg">Holding:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.holding || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">
                        {caseBrief.holding || 'Not provided.'}
                      </p>
                    )}
                  </div>
                  {/* Reasoning */}
                  <div className="mb-4">
                    <strong className="block text-lg">Reasoning:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.reasoning || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">
                        {caseBrief.reasoning || 'Not provided.'}
                      </p>
                    )}
                  </div>
                  {/* Dissent */}
                  <div className="mb-4">
                    <strong className="block text-lg">Dissent:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.dissent || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">
                        {caseBrief.dissent || 'Not provided.'}
                      </p>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="text-sm text-gray-400">No summary available.</div>
            )}
          </div>

          {/* PDF Save button */}
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
