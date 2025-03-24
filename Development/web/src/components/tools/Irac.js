'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSave, FaSyncAlt, FaFilePdf } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Firebase
import { db } from '@/firebase';
import {
  doc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';

// We'll dynamically import jsPDF in handleSaveAsPDF

export default function Irac() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const router = useRouter();

  // Sidebar
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // IRAC fields (populated by AI or user input)
  const [irac, setIrac] = useState({
    issue: '',
    rule: '',
    analysis: '',
    conclusion: '',
  });

  // Additional user-provided fields
  const [subIssues, setSubIssues] = useState('');
  const [sources, setSources] = useState('');
  const [counterAnalysis, setCounterAnalysis] = useState('');

  // Scenario is chosen from dropdown in the config modal
  const [scenario, setScenario] = useState('');

  // AI generation
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  // IRAC config modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [examConfig, setExamConfig] = useState({
    templateType: 'Standard',
    legalArea: 'General Law',
    detailLevel: 'Intermediate',
    includeCounterAnalysis: true,
    numberOfIrac: 1,
    scenario: '',
  });

  // Pre-defined scenario options
  const scenarioOptions = [
    'Contract Formation Dispute',
    'Tort: Car Accident Negligence',
    'Criminal Law: Burglary Scenario',
    'Property: Adverse Possession',
    'Family Law: Child Custody Dispute',
  ];

  // Load/Save progress
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);

  // -----------------------
  // NEW: IMPORT CASE BRIEF
  // -----------------------
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [favoriteBriefs, setFavoriteBriefs] = useState([]);

  // -------------
  // AUTH CHECK
  // -------------
  if (!currentUser) {
    return (
      <div
        className={clsx(
          'flex flex-col items-center justify-center h-screen',
          isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700'
        )}
      >
        <div
          className={clsx(
            'text-center p-6 rounded shadow-md',
            isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-700'
          )}
        >
          <p className="mb-4">Please log in to use the IRAC tool.</p>
          <button
            onClick={() => router.push('/login')}
            className={clsx(
              'px-4 py-2 rounded text-white',
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-blue-900 hover:bg-blue-700'
            )}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // -------------
  // FIELD HANDLERS
  // -------------
  const handleChangeIrac = (e) => {
    const { name, value } = e.target;
    setIrac((prev) => ({ ...prev, [name]: value }));
  };

  // -------------
  // SAVE/LOAD PROGRESS
  // -------------
  const handleSaveProgress = async () => {
    if (!currentUser) {
      alert('You must be logged in to save your IRAC.');
      return;
    }
    try {
      const progressData = {
        userId: currentUser.uid,
        examConfig: { ...examConfig },
        iracEntries: {
          ...irac,
          subIssues,
          sources,
          counterAnalysis,
        },
        scenario,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, 'iracProgress'), progressData);
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving IRAC progress:', error);
      alert('An error occurred while saving your IRAC progress.');
    }
  };

  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);

  const fetchSavedProgresses = async () => {
    try {
      const q = query(
        collection(db, 'iracProgress'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const loaded = [];
      querySnapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSavedProgresses(loaded);
    } catch (error) {
      console.error('Error fetching IRAC progress:', error);
      alert('Error fetching progress.');
    }
  };

  const handleLoadProgress = (progress) => {
    setExamConfig(progress.examConfig || {});
    if (progress.iracEntries) {
      setIrac({
        issue: progress.iracEntries.issue || '',
        rule: progress.iracEntries.rule || '',
        analysis: progress.iracEntries.analysis || '',
        conclusion: progress.iracEntries.conclusion || '',
      });
      setSubIssues(progress.iracEntries.subIssues || '');
      setSources(progress.iracEntries.sources || '');
      setCounterAnalysis(progress.iracEntries.counterAnalysis || '');
    }
    setScenario(progress.scenario || '');
    closeLoadProgressModal();
  };

  const handleDeleteProgress = async (id) => {
    try {
      await deleteDoc(doc(db, 'iracProgress', id));
      fetchSavedProgresses();
    } catch (error) {
      console.error('Error deleting IRAC progress:', error);
      alert('An error occurred while deleting the progress.');
    }
  };

  // -------------
  // AI GENERATION
  // -------------
  const generateIracAI = async () => {
    setIsLoadingAI(true);
    setAiError('');

    if (!examConfig.scenario.trim()) {
      setAiError('Please select a scenario before generating an IRAC.');
      setIsLoadingAI(false);
      return;
    }

    try {
      const response = await fetch('/api/irac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: examConfig.scenario }),
      });
      const data = await response.json();

      if (!response.ok) {
        setAiError(data.error || 'An error occurred while generating the IRAC.');
      } else {
        // The server now returns: issue, rule, analysis, conclusion, subIssues, sources, counterAnalysis
        setIrac({
          issue: data.issue || '',
          rule: data.rule || '',
          analysis: data.analysis || '',
          conclusion: data.conclusion || '',
        });
        setSubIssues(data.subIssues || '');
        setSources(data.sources || '');
        setCounterAnalysis(data.counterAnalysis || '');
      }
    } catch (error) {
      console.error('Error calling AI IRAC API:', error);
      setAiError('Error calling AI IRAC API. Please try again later.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // -------------
  // CONFIG MODAL
  // -------------
  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleScenarioSelect = (e) => {
    setExamConfig((prev) => ({
      ...prev,
      scenario: e.target.value,
    }));
  };

  // -------------
  // SAVE AS PDF
  // -------------
  const handleSaveAsPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');

      const docPdf = new jsPDF('p', 'pt', 'letter');
      docPdf.setFontSize(14);

      let x = 40;
      let y = 60;

      docPdf.text('IRAC Analysis', x, y);
      y += 30;

      docPdf.setFontSize(12);

      const addSection = (label, content) => {
        if (!content || !content.trim()) return;
        const lines = docPdf.splitTextToSize(`${label}: ${content}`, 500);
        lines.forEach((line) => {
          docPdf.text(line, x, y);
          y += 14;
        });
        y += 10;
      };

      addSection('Issue', irac.issue);
      addSection('Rule', irac.rule);
      addSection('Analysis', irac.analysis);
      addSection('Counter-Analysis', counterAnalysis);
      addSection('Sub-Issues', subIssues);
      addSection('Sources', sources);
      addSection('Conclusion', irac.conclusion);

      docPdf.save('irac.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('There was an error generating the PDF.');
    }
  };

  // -------------
  // IMPORT CASE BRIEF FROM FAVORITES
  // -------------
  const openImportModal = async () => {
    if (!currentUser) return;
    try {
      // Get user's favorites from userDataObj
      const favIds = userDataObj?.favorites || [];
      if (!favIds.length) {
        // No favorites found
        setFavoriteBriefs([]);
        setIsImportModalOpen(true);
        return;
      }
      // Fetch capCases from Firestore and filter by favorites
      const snapshot = await getDocs(collection(db, 'capCases'));
      const loaded = [];
      snapshot.forEach((docSnap) => {
        if (favIds.includes(docSnap.id)) {
          loaded.push({ id: docSnap.id, ...docSnap.data() });
        }
      });
      setFavoriteBriefs(loaded);
    } catch (error) {
      console.error('Error fetching favorite briefs:', error);
    } finally {
      setIsImportModalOpen(true);
    }
  };

  const handleImportBrief = (brief) => {
    // Map the fields from the favorite brief to the IRAC fields.
    setIrac({
      issue: brief.issue || '',
      rule: brief.ruleOfLaw || '',
      analysis: brief.reasoning || '',
      conclusion: brief.holding || '',
    });
    setSubIssues(brief.facts || '');
    setSources(''); // Adjust if you want a different mapping
    setCounterAnalysis(brief.dissent || '');

    // Close the modal
    setIsImportModalOpen(false);
  };

  // -------------
  // FRAMER MOTION
  // -------------
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  };

  return (
    <div
      className={clsx(
        'relative flex h-screen transition-colors duration-500',
        isDarkMode ? 'text-white' : 'text-gray-800'
      )}
    >
      {/* SIDEBAR + OVERLAY (Mobile) */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/irac"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
              isDarkMode={isDarkMode}
            />
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col px-6 relative z-200 h-screen">
        {/* Top Bar: Sidebar Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className={clsx(
              'text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden'
            )}
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

        {/* IRAC Container */}
        <motion.div
          className={clsx(
            'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
            isDarkMode
              ? 'bg-slate-800 bg-opacity-50 text-white'
              : 'bg-white text-gray-800'
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top row: Right-side Icon Buttons */}
          <div className="w-full flex items-center justify-end mb-4 gap-4">
            {/* Load Progress */}
            <button
              onClick={openLoadProgressModal}
              className={clsx(
                'flex items-center justify-center w-10 h-10 rounded-full bg-transparent',
                'hover:text-slate-200 transition-colors duration-200',
                isDarkMode ? 'text-gray-200' : 'text-blue-950'
              )}
              aria-label="Load IRAC Progress"
            >
              <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }}>
                <FaSyncAlt size={20} />
              </motion.div>
            </button>

            {/* Save Progress */}
            <button
              onClick={handleSaveProgress}
              className={clsx(
                'flex items-center justify-center w-10 h-10 rounded-full bg-transparent',
                'hover:text-slate-200 transition-colors duration-200',
                isDarkMode ? 'text-gray-200' : 'text-blue-950'
              )}
              aria-label="Save IRAC Progress"
            >
              <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }}>
                <FaSave size={20} />
              </motion.div>
            </button>

            {/* Import Case Brief Button – Updated to Flashcards UI style */}
            <button
              onClick={openImportModal}
              className="group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center gradientShadowHoverBlue"
              aria-label="Import Case Brief"
            >
              Import Case Brief
            </button>

            {/* Configure Button – Updated to Flashcards UI style */}
            <button
              onClick={openConfigModal}
              className="group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center gradientShadowHoverBlue"
              aria-label="Configure IRAC"
            >
              Configure
            </button>
          </div>

          {/* IRAC Form or "Click Configure/Import" Message */}
          {(!irac.issue.trim() &&
            !irac.rule.trim() &&
            !irac.analysis.trim() &&
            !irac.conclusion.trim() &&
            !subIssues.trim() &&
            !sources.trim() &&
            !counterAnalysis.trim()) ? (
            <div
              className={clsx(
                'w-full max-w-5xl p-6 rounded-lg shadow-md text-center mx-auto',
                isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-black'
              )}
            >
              <p className={clsx('mb-4', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                Click <span className="font-semibold">Configure</span> or{' '}
                <span className="font-semibold">Import Case Brief</span> to generate your IRAC.
              </p>
              <p className={clsx('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                <strong>Note:</strong> This is intended for law students to practice drafting IRAC analyses.
              </p>
            </div>
          ) : (
            <>
              {/* IRAC Form */}
              <form className="grid grid-cols-1 gap-6 w-full max-w-4xl mx-auto">
                {/* ISSUE */}
                <div>
                  <label
                    htmlFor="issue"
                    className={clsx('block text-lg font-semibold mb-1', isDarkMode ? 'text-gray-100' : 'text-gray-700')}
                  >
                    Issue
                  </label>
                  <textarea
                    id="issue"
                    name="issue"
                    value={irac.issue}
                    onChange={handleChangeIrac}
                    rows={3}
                    className={clsx(
                      'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isDarkMode ? 'bg-slate-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'
                    )}
                    placeholder="State the primary legal issue(s) in question..."
                  />
                </div>

                {/* SUB-ISSUES */}
                <div>
                  <label
                    htmlFor="subIssues"
                    className={clsx('block text-lg font-semibold mb-1', isDarkMode ? 'text-gray-100' : 'text-gray-700')}
                  >
                    Sub-Issues or Additional Concerns
                  </label>
                  <textarea
                    id="subIssues"
                    name="subIssues"
                    value={subIssues}
                    onChange={(e) => setSubIssues(e.target.value)}
                    rows={3}
                    className={clsx(
                      'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isDarkMode ? 'bg-slate-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'
                    )}
                    placeholder="List any sub-issues, defenses, or special considerations..."
                  />
                </div>

                {/* RULE */}
                <div>
                  <label
                    htmlFor="rule"
                    className={clsx('block text-lg font-semibold mb-1', isDarkMode ? 'text-gray-100' : 'text-gray-700')}
                  >
                    Rule
                  </label>
                  <textarea
                    id="rule"
                    name="rule"
                    value={irac.rule}
                    onChange={handleChangeIrac}
                    rows={3}
                    className={clsx(
                      'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isDarkMode ? 'bg-slate-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'
                    )}
                    placeholder="Outline the governing legal rules or principles..."
                  />
                </div>

                {/* SOURCES */}
                <div>
                  <label
                    htmlFor="sources"
                    className={clsx('block text-lg font-semibold mb-1', isDarkMode ? 'text-gray-100' : 'text-gray-700')}
                  >
                    Key Sources / Authority
                  </label>
                  <textarea
                    id="sources"
                    name="sources"
                    value={sources}
                    onChange={(e) => setSources(e.target.value)}
                    rows={3}
                    className={clsx(
                      'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isDarkMode ? 'bg-slate-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'
                    )}
                    placeholder="Mention relevant cases, statutes, or regulations..."
                  />
                </div>

                {/* ANALYSIS */}
                <div>
                  <label
                    htmlFor="analysis"
                    className={clsx('block text-lg font-semibold mb-1', isDarkMode ? 'text-gray-100' : 'text-gray-700')}
                  >
                    Analysis
                  </label>
                  <textarea
                    id="analysis"
                    name="analysis"
                    value={irac.analysis}
                    onChange={handleChangeIrac}
                    rows={6}
                    className={clsx(
                      'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isDarkMode ? 'bg-slate-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'
                    )}
                    placeholder="Apply the rule to the facts..."
                  />
                </div>

                {/* COUNTER-ANALYSIS */}
                {examConfig.includeCounterAnalysis && (
                  <div>
                    <label
                      htmlFor="counterAnalysis"
                      className={clsx('block text-lg font-semibold mb-1', isDarkMode ? 'text-gray-100' : 'text-gray-700')}
                    >
                      Counter-Analysis or Opposing Arguments
                    </label>
                    <textarea
                      id="counterAnalysis"
                      name="counterAnalysis"
                      value={counterAnalysis}
                      onChange={(e) => setCounterAnalysis(e.target.value)}
                      rows={4}
                      className={clsx(
                        'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                        isDarkMode ? 'bg-slate-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'
                      )}
                      placeholder="Explore potential arguments the opposing side might raise..."
                    />
                  </div>
                )}

                {/* CONCLUSION */}
                <div>
                  <label
                    htmlFor="conclusion"
                    className={clsx('block text-lg font-semibold mb-1', isDarkMode ? 'text-gray-100' : 'text-gray-700')}
                  >
                    Conclusion
                  </label>
                  <textarea
                    id="conclusion"
                    name="conclusion"
                    value={irac.conclusion}
                    onChange={handleChangeIrac}
                    rows={3}
                    className={clsx(
                      'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isDarkMode ? 'bg-slate-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'
                    )}
                    placeholder="Summarize the final outcome or result..."
                  />
                </div>
              </form>

              {/* Save as PDF Button */}
              <div className="w-full max-w-4xl mx-auto mt-6 flex justify-end">
                <button
                  onClick={handleSaveAsPDF}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors duration-200 shadow-md',
                    isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-950 hover:bg-blue-800'
                  )}
                  aria-label="Save as PDF"
                >
                  <FaFilePdf />
                  Save as PDF
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* CONFIGURATION MODAL */}
        <AnimatePresence>
          {isConfigModalOpen && (
            <motion.div
              className={clsx(
                'fixed inset-0 flex items-center justify-center z-50',
                isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={clsx(
                  'p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto max-h-screen',
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className={clsx(
                    'text-2xl font-semibold mb-6',
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  )}
                >
                  Configure IRAC
                </h2>
                <form>
                  {/* IRAC Template Type */}
                  <div className="mb-4">
                    <label
                      className={clsx(
                        'block mb-2',
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      )}
                    >
                      IRAC Template Type:
                    </label>
                    <select
                      name="templateType"
                      value={examConfig.templateType}
                      onChange={handleConfigChange}
                      className={clsx(
                        'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      )}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Expanded">Expanded</option>
                    </select>
                  </div>

                  {/* Legal Area */}
                  <div className="mb-4">
                    <label
                      className={clsx(
                        'block mb-2',
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      )}
                    >
                      Legal Area:
                    </label>
                    <select
                      name="legalArea"
                      value={examConfig.legalArea}
                      onChange={handleConfigChange}
                      className={clsx(
                        'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      )}
                    >
                      <option value="General Law">General Law</option>
                      <option value="Contract Law">Contract Law</option>
                      <option value="Torts">Torts</option>
                      <option value="Criminal Law">Criminal Law</option>
                      <option value="Property Law">Property Law</option>
                      <option value="Family Law">Family Law</option>
                      <option value="Corporate Law">Corporate Law</option>
                    </select>
                  </div>

                  {/* Detail Level */}
                  <div className="mb-4">
                    <label
                      className={clsx(
                        'block mb-2',
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      )}
                    >
                      Detail Level:
                    </label>
                    <select
                      name="detailLevel"
                      value={examConfig.detailLevel}
                      onChange={handleConfigChange}
                      className={clsx(
                        'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      )}
                    >
                      <option value="Basic">Basic</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Include Counter-Analysis */}
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="includeCounterAnalysis"
                      name="includeCounterAnalysis"
                      checked={examConfig.includeCounterAnalysis}
                      onChange={handleConfigChange}
                      className={clsx(
                        'h-5 w-5 focus:ring-blue-500 rounded',
                        isDarkMode
                          ? 'text-blue-900 bg-gray-600 border-gray-500'
                          : 'text-blue-900 bg-white border-gray-300'
                      )}
                    />
                    <label
                      htmlFor="includeCounterAnalysis"
                      className={clsx('ml-3', isDarkMode ? 'text-white' : 'text-gray-700')}
                    >
                      Include Counter-Analysis
                    </label>
                  </div>

                  {/* Number of IRAC Entries */}
                  <div className="mb-4">
                    <label
                      className={clsx(
                        'block mb-2',
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      )}
                    >
                      Number of IRAC Entries:
                    </label>
                    <input
                      type="number"
                      name="numberOfIrac"
                      value={examConfig.numberOfIrac}
                      onChange={handleConfigChange}
                      min="1"
                      max="10"
                      className={clsx(
                        'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      )}
                    />
                  </div>

                  {/* Scenario (Dropdown) */}
                  <div className="mb-6">
                    <label
                      className={clsx(
                        'block mb-2',
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      )}
                    >
                      Scenario (for AI Generation):
                    </label>
                    <select
                      name="scenario"
                      value={examConfig.scenario}
                      onChange={handleScenarioSelect}
                      className={clsx(
                        'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
                        isDarkMode
                          ? 'bg-slate-600 text-white border-gray-500'
                          : 'bg-white text-gray-700 border-gray-300'
                      )}
                    >
                      <option value="">Select a Scenario</option>
                      {scenarioOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons – Both buttons are now in the same row without extra top margin */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        closeConfigModal();
                        generateIracAI();
                      }}
                      className="group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center gradientShadowHoverBlue"
                      aria-label="Generate IRAC"
                    >
                      Generate IRAC
                    </button>
                    <button
                      type="button"
                      onClick={closeConfigModal}
                      className={clsx(
                                            'h-10 sm:h-12 px-6 py-2 rounded text-sm sm:text-base transition-colors duration-200 gradientShadowHoverWhite',
                                            isDarkMode
                                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                              : 'bg-gray-300 text-blue-950 hover:bg-gray-400'
                                          )}
                      aria-label="Cancel Configuration"
                    >
                      Cancel
                    </button>
                  </div>
                  {isLoadingAI && (
                    <p className="text-blue-300 mt-4 text-sm">
                      Generating IRAC...
                    </p>
                  )}
                  {aiError && (
                    <p className="text-red-400 mt-4 text-sm">{aiError}</p>
                  )}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOAD PROGRESS MODAL */}
        <AnimatePresence>
          {isLoadProgressModalOpen && (
            <motion.div
              className={clsx(
                'fixed inset-0 flex items-center justify-center z-50',
                isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={clsx(
                  'p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-screen',
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className={clsx(
                    'text-2xl font-semibold mb-6',
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  )}
                >
                  Load Saved Progress
                </h2>
                {savedProgresses.length === 0 ? (
                  <p className={clsx(isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                    No saved progresses found.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {savedProgresses.map((progress) => (
                      <li
                        key={progress.id}
                        className={clsx(
                          'p-4 border rounded',
                          isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={clsx('font-semibold', isDarkMode ? 'text-blue-300' : 'text-blue-900')}>
                              IRAC Template: {progress.examConfig.templateType}
                            </p>
                            <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                              Legal Area: {progress.examConfig.legalArea}
                            </p>
                            <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                              Detail Level: {progress.examConfig.detailLevel}
                            </p>
                            <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                              Include Counter-Analysis: {progress.examConfig.includeCounterAnalysis ? 'Yes' : 'No'}
                            </p>
                            <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                              Number of IRAC Entries: {progress.examConfig.numberOfIrac}
                            </p>
                            <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                              Scenario: {progress.scenario || '(None)'}
                            </p>
                            <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                              Saved on: {new Date(progress.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleLoadProgress(progress)}
                              className={clsx(
                                'group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center'
                              )}
                              aria-label="Load Progress"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDeleteProgress(progress.id)}
                              className={clsx(
                                'group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-red-600 to-red-700 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center'
                              )}
                              aria-label="Delete Progress"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={closeLoadProgressModal}
                    className={clsx(
                      'group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center'
                    )}
                    aria-label="Close Load Progress Modal"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* IMPORT CASE BRIEF MODAL */}
        <AnimatePresence>
          {isImportModalOpen && (
            <motion.div
              className={clsx(
                'fixed inset-0 flex items-center justify-center z-50',
                isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={clsx(
                  'p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto max-h-screen',
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold mb-6">
                  Import a Favorite Case Brief
                </h2>
                {favoriteBriefs.length === 0 ? (
                  <p>No favorite case briefs found.</p>
                ) : (
                  <ul className="space-y-4">
                    {favoriteBriefs.map((fav) => (
                      <li
                        key={fav.id}
                        className={clsx(
                          'p-4 border rounded cursor-pointer hover:bg-blue-100',
                          isDarkMode ? 'border-gray-600 hover:bg-white/10' : 'border-gray-300'
                        )}
                        onClick={() => handleImportBrief(fav.briefSummary || {})}
                      >
                        <p className="font-semibold text-sm mb-1">
                          {fav.title || 'Untitled Case'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {fav.jurisdiction} | {fav.decisionDate}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className={clsx(
                      'group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center gradientShadowHoverBlue'
                    )}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
