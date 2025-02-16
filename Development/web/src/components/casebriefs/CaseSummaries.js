'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '../Sidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaBars, FaTimes, FaHeart, FaRegHeart, FaDownload } from 'react-icons/fa';
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

  const [capCase, setCapCase] = useState(null);
  const [caseBrief, setCaseBrief] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [bulletpointView, setBulletpointView] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [reRunCount, setReRunCount] = useState(0);

  const capCaseId = searchParams.get('caseId');

  // Ref for PDF export
  const pdfRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !capCaseId) return;
    (async () => {
      try {
        const docRef = doc(db, 'capCases', capCaseId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.error(`Case with ID ${capCaseId} not found.`);
          return;
        }
        const fetchedCase = { id: docSnap.id, ...docSnap.data() };
        setCapCase(fetchedCase);
        if (fetchedCase.detailedSummary) {
          console.log('Using existing detailedSummary.');
          setCaseBrief(fetchedCase.detailedSummary);
          if (fetchedCase.detailedSummary.verified === true) {
            setIsVerified(true);
          } else {
            await verifyDetailedSummary(fetchedCase.detailedSummary, fetchedCase);
          }
        } else {
          await getCapCaseSummary(fetchedCase);
        }
      } catch (error) {
        console.error('Error fetching case:', error);
      }
    })();
  }, [capCaseId, currentUser]);

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
        console.error('Failed to get detailed summary:', errorData.error);
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
      setCapCase(prev =>
        prev ? { ...prev, detailedSummary: { ...data, verified: false } } : null
      );
      await verifyDetailedSummary(data, capCaseObj);
    } catch (err) {
      console.error('Error fetching detailed summary:', err);
      setCaseBrief({ error: 'Error fetching summary.' });
    } finally {
      setIsSummaryLoading(false);
    }
  };

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
        console.log("Verification explanation:", verifyData.explanation);
        setIsVerified(false);
        if (reRunCount < 1) {
          setReRunCount(reRunCount + 1);
          await getCapCaseSummary(capCaseObj);
        }
      }
    } catch (verifyError) {
      console.error('Error verifying detailed summary:', verifyError);
      setIsVerified(false);
    }
  };

  const handleBulletpointToggle = (e) => {
    setBulletpointView(e.target.checked);
  };

  const saveAsPDF = async () => {
    if (!pdfRef.current) return;
    try {
      const originalFontSize = pdfRef.current.style.fontSize;
      pdfRef.current.style.fontSize = '18px';
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

  if (!currentUser) {
    return (
      <div className={`flex items-center justify-center h-screen transition-colors ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' : 'bg-gradient-to-br from-gray-100 to-white text-gray-800'}`}>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
          <p className="mb-4 text-lg font-semibold">Please log in to access your Case Summaries.</p>
          <button onClick={() => router.push('/login')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-950 hover:bg-blue-800 text-white'}`}>
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
        <div className={`flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto overflow-x-auto ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white' : 'bg-white text-gray-800'} flex flex-col items-center`}>
          <h1 className="text-2xl font-bold mb-4">Full Case Brief (Detailed)</h1>
          <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
            <h2 className="text-xl font-semibold">{capCase?.title}</h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {capCase?.jurisdiction || 'Unknown'} | Volume: {capCase?.volume || 'N/A'} | Date: {capCase?.decisionDate || 'N/A'}
            </p>
            <div className="flex items-center text-xs mt-1">
              <span className="text-gray-400">Verified by LExAPI 3.0 (Detailed Mode)</span>
              {isVerified ? (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="ml-2 flex items-center justify-center w-6 h-6 border-2 border-emerald-500 rounded-full">
                  <span className="text-emerald-500 font-bold text-lg">✓</span>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="ml-2 flex items-center justify-center w-6 h-6 border-2 border-red-500 rounded-full">
                  <span className="text-red-500 font-bold text-lg">✕</span>
                </motion.div>
              )}
            </div>
          </div>
          <div className={`max-h-60 overflow-auto rounded-xl mb-6 p-6 ${isDarkMode ? 'bg-slate-700 border border-slate-600 text-gray-100' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
            <p className="text-base whitespace-pre-wrap leading-relaxed">
              {capCase?.content || 'No detailed content available.'}
            </p>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <label className="font-semibold text-sm">{bulletpointView ? 'Bullet Points' : 'Classic View'}</label>
            <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                id="bulletPointsToggle"
                checked={bulletpointView}
                onChange={handleBulletpointToggle}
                className="toggle-checkbox absolute h-0 w-0 opacity-0"
              />
              <label htmlFor="bulletPointsToggle" className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          <div ref={pdfRef} className="w-full">
            {isSummaryLoading ? (
              <div className="text-sm text-gray-400">Loading detailed summary...</div>
            ) : caseBrief ? (
              caseBrief.error ? (
                <div className="text-sm text-red-500">{caseBrief.error || 'No summary available.'}</div>
              ) : (
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border border-blue-600' : 'bg-white text-gray-800 border border-blue-200'}`}>
                  <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} text-lg`}>Detailed Case Brief</h3>
                  <div className="mb-4">
                    <strong className="block text-lg">Rule of Law:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.ruleOfLaw || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">{caseBrief.ruleOfLaw || 'Not provided.'}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <strong className="block text-lg">Facts:</strong>
                    {(() => {
                      if (!caseBrief.facts) return <p className="text-base mt-2">Not provided.</p>;
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
                  <div className="mb-4">
                    <strong className="block text-lg">Issue:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.issue || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">{caseBrief.issue || 'Not provided.'}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <strong className="block text-lg">Holding:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.holding || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">{caseBrief.holding || 'Not provided.'}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <strong className="block text-lg">Reasoning:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.reasoning || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">{caseBrief.reasoning || 'Not provided.'}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <strong className="block text-lg">Dissent:</strong>
                    {bulletpointView ? (
                      <ul className="list-disc list-inside text-base mt-2">
                        <li>{caseBrief.dissent || 'Not provided.'}</li>
                      </ul>
                    ) : (
                      <p className="text-base mt-2">{caseBrief.dissent || 'Not provided.'}</p>
                    )}
                  </div>
                  <div className="text-xs italic text-gray-400">Verified by LExAPI 3.0 (Detailed Mode)</div>
                </div>
              )
            ) : (
              <div className="text-sm text-gray-400">No summary available.</div>
            )}
          </div>
          <motion.button
            onClick={saveAsPDF}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
            className="mt-6 p-3 rounded-full bg-blue-600 text-white shadow-lg"
          >
            <FaDownload size={24} />
          </motion.button>
        </div>
      </main>
    </div>
  );
}
