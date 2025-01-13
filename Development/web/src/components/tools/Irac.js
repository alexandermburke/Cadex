'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSave, FaSyncAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import {
  doc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Irac() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const router = useRouter();

  // Sidebar toggle
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // IRAC fields
  const [irac, setIrac] = useState({
    issue: '',
    subIssues: '',
    rule: '',
    sources: '',
    analysis: '',
    counterAnalysis: '',
    conclusion: '',
  });

  // AI Generation (Stub)
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  // Configuration Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [examConfig, setExamConfig] = useState({
    templateType: 'Standard', // Standard or Expanded
    legalArea: 'General Law',
    detailLevel: 'Intermediate', // Basic, Intermediate, Advanced
    includeCounterAnalysis: true,
    numberOfIrac: 1,
  });

  // Progress Management
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);

  // Handlers for IRAC Fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIrac((prev) => ({ ...prev, [name]: value }));
  };

  // AI Generation Handler (Stub)
  const generateIracAI = async () => {
    setIsLoadingAI(true);
    setAiError('');

    try {
      // Mock AI generation with a timeout
      setTimeout(() => {
        setIrac({
          issue: 'Whether a valid contract was formed given the disputed acceptance timeframe.',
          subIssues:
            '1) Was there a clear offer?\n2) Did the offeree timely communicate acceptance under relevant contract law?\n3) Was consideration present?',
          rule: 'For a valid contract: offer + acceptance + consideration + no defenses to formation.',
          sources:
            'Case law: "Carlill v. Carbolic Smoke Ball Co." for offer/acceptance;\n"Lucy v. Zehmer" for serious intent;\nCommon law mailbox rule; UCC if goods are involved.',
          analysis:
            'Alice receives an offer from Bob on Jan 1. By Jan 2, she emails acceptance. Under the mailbox rule, acceptance is effective upon dispatch if that method is reasonable. Alice’s acceptance was sent prior to any revocation by Bob, so it is likely binding. Consideration exists if each party gives something of value...',
          counterAnalysis:
            'Bob might argue that email was not an approved method of acceptance or that acceptance occurred too late. However, unless the offer explicitly restricted the method or timing of acceptance, the mailbox rule typically applies. Bob might also claim the offer lapsed, but no evidence suggests a time limit passed.',
          conclusion:
            'A legally enforceable contract was formed when Alice dispatched her email acceptance, assuming no explicit restrictions on email as a method of acceptance.',
        });
        setIsLoadingAI(false);
      }, 1500);
    } catch (error) {
      setAiError('AI generation failed. Please try again later.');
      setIsLoadingAI(false);
    }
  };

  // Configuration Modal Handlers
  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamConfig((prevConfig) => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save Progress Handler
  const handleSaveProgress = async () => {
    if (!currentUser) {
      alert('You need to be logged in to save your progress.');
      return;
    }

    try {
      const progressData = {
        userId: currentUser.uid,
        examConfig: { ...examConfig },
        iracEntries: { ...irac },
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, 'iracProgress'), progressData);
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('An error occurred while saving your progress.');
    }
  };

  // Load Progress Modal Handlers
  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);

  const fetchSavedProgresses = async () => {
    if (!currentUser) {
      alert('You need to be logged in to load your progress.');
      return;
    }

    try {
      const q = query(collection(db, 'iracProgress'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      const loaded = [];
      querySnapshot.forEach((doc) => {
        loaded.push({ id: doc.id, ...doc.data() });
      });

      setSavedProgresses(loaded);
    } catch (error) {
      console.error('Error fetching saved progresses:', error);
      alert('An error occurred while fetching saved progresses.');
    }
  };

  const handleLoadProgress = (progress) => {
    setExamConfig(progress.examConfig);
    setIrac(progress.iracEntries);
    closeLoadProgressModal();
  };

  const handleDeleteProgress = async (id) => {
    if (!currentUser) {
      alert('You need to be logged in to delete your progress.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'iracProgress', id));
      fetchSavedProgresses();
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('An error occurred while deleting the progress.');
    }
  };

  // Initial Setup based on Configuration
  useEffect(() => {
    // You can add any initialization logic here based on examConfig
  }, [examConfig]);

  // If user is not logged in, show login prompt
  if (!currentUser) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
        <div className={`text-center p-6 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'} rounded shadow-md`}>
          <p className="mb-4">Please log in to use the IRAC tool.</p>
          <button
            onClick={() => router.push('/login')}
            className={`px-4 py-2 rounded ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-900 hover:bg-blue-700'
            } text-white`}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-800' : 'bg-transparent'} rounded shadow-md`}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/irac" // Adjusted to the correct link
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

      <main className="flex-1 flex flex-col p-6 overflow-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={toggleSidebar}
            className={`text-gray-600 hover:text-gray-400`}
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
                  <FaTimes size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu-icon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaBars size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Configuration and Progress Buttons */}
          <div className="flex space-x-4">
          
            <button
              onClick={openLoadProgressModal}
              className={`group relative h-10 sm:h-12 w-28 sm:w-40 overflow-hidden rounded ${
                isDarkMode ? 'bg-blue-700' : 'bg-blue-950'
              } text-white duration-200 before:absolute before:right-0 before:top-0 before:h-full before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 text-sm sm:text-base shadow-md`}
              aria-label="Load Progress"
            >
              Load Progress
            </button>
            <button
              onClick={handleSaveProgress}
              className={`group relative h-10 sm:h-12 w-28 sm:w-40 overflow-hidden rounded ${
                isDarkMode ? 'bg-blue-700' : 'bg-blue-950'
              } text-white duration-200 before:absolute before:right-0 before:top-0 before:h-full before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 text-sm sm:text-base shadow-md`}
              aria-label="Configure Flashcards"
            >
              Save Progress
            </button>
            <button
              onClick={openConfigModal}
              className={`group relative h-10 sm:h-12 w-28 sm:w-40 overflow-hidden rounded ${
                isDarkMode ? 'bg-blue-700' : 'bg-blue-950'
              } text-white duration-200 before:absolute before:right-0 before:top-0 before:h-full before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 text-sm sm:text-base shadow-md`}
              aria-label="Configure Flashcards"
            >
              Configure
            </button>
          </div>
        </div>

        {/* In-Depth IRAC Section */}
        <div className="w-full max-w-6xl mx-auto flex flex-col">
          <h2 className="text-5xl font-extrabold mb-4 text-center text-blue-950">Construct Your IRAC Analysis</h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8 text-center`}>
            Fill each section carefully. Use sub-issues, sources, and counter-analysis to add depth.
          </p>

          {/* AI Generation Button */}
          <div className="flex flex-col items-center mb-8">
            <button
              type="button"
              onClick={generateIracAI}
              className={`relative h-12 w-full sm:w-56 overflow-hidden rounded bg-blue-950 text-white goldBackground shadow-lg transition-colors duration-200 before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56`}
              aria-label="Generate IRAC"
              disabled={isLoadingAI}
            >
              Generate IRAC
              <motion.span
                className="absolute right-4 top-3"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {/* Optional: Add an icon here */}
              </motion.span>
            </button>
            {isLoadingAI && <p className="text-blue-400 mt-2">Generating...</p>}
            {aiError && <p className="text-red-400 mt-2">{aiError}</p>}
          </div>

          {/* IRAC Fields */}
          <form className="grid grid-cols-1 gap-6">
            {/* ISSUE */}
            <div>
              <label htmlFor="issue" className="block text-lg font-semibold mb-1">
                Issue
              </label>
              <textarea
                id="issue"
                name="issue"
                value={irac.issue}
                onChange={handleChange}
                rows={3}
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-slate-700 text-white border-gray-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                placeholder="State the primary legal issue(s) in question..."
              />
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Example: &quot;Does the mailbox rule apply to Alice&apos;s acceptance email?&quot;
              </p>
            </div>

            {/* SUB-ISSUES */}
            <div>
              <label htmlFor="subIssues" className="block text-lg font-semibold mb-1">
                Sub-Issues or Additional Concerns
              </label>
              <textarea
                id="subIssues"
                name="subIssues"
                value={irac.subIssues}
                onChange={handleChange}
                rows={3}
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-slate-700 text-white border-gray-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                placeholder="List any sub-issues, defenses, or special considerations..."
              />
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Example: &quot;1) Is the acceptance valid if there was no explicit method stated in the offer?&quot;
              </p>
            </div>

            {/* RULE */}
            <div>
              <label htmlFor="rule" className="block text-lg font-semibold mb-1">
                Rule
              </label>
              <textarea
                id="rule"
                name="rule"
                value={irac.rule}
                onChange={handleChange}
                rows={3}
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-slate-700 text-white border-gray-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                placeholder="Outline the governing legal rules or principles..."
              />
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Example: &quot;Formation requires offer, acceptance, and consideration; acceptance is usually effective upon dispatch.&quot;
              </p>
            </div>

            {/* SOURCES */}
            <div>
              <label htmlFor="sources" className="block text-lg font-semibold mb-1">
                Key Sources / Authority
              </label>
              <textarea
                id="sources"
                name="sources"
                value={irac.sources}
                onChange={handleChange}
                rows={3}
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-slate-700 text-white border-gray-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                placeholder="Mention relevant cases, statutes, or regulations..."
              />
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Example: &quot;R2d. Contracts § 63 (Mailbox Rule), UCC 2-206, &apos;Lucy v. Zehmer,&apos; etc.&quot;
              </p>
            </div>

            {/* ANALYSIS */}
            <div>
              <label htmlFor="analysis" className="block text-lg font-semibold mb-1">
                Analysis
              </label>
              <textarea
                id="analysis"
                name="analysis"
                value={irac.analysis}
                onChange={handleChange}
                rows={6}
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-slate-700 text-white border-gray-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                placeholder="Apply the rule to the facts. Discuss each party's arguments and relevant details..."
              />
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Example: &quot;Alice emailed acceptance on Jan 2, arguably fulfilling the mailbox rule. Bob might argue that email isn&apos;t an acceptable method...&quot;
              </p>
            </div>

            {/* COUNTER-ANALYSIS */}
            {examConfig.includeCounterAnalysis && (
              <div>
                <label htmlFor="counterAnalysis" className="block text-lg font-semibold mb-1">
                  Counter-Analysis or Opposing Arguments
                </label>
                <textarea
                  id="counterAnalysis"
                  name="counterAnalysis"
                  value={irac.counterAnalysis}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-slate-700 text-white border-gray-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  placeholder="Explore potential arguments the opposing side might raise..."
                />
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Example: &quot;Bob might assert the time for acceptance lapsed, or that email wasn&apos;t a permitted method.&quot;
                </p>
              </div>
            )}

            {/* CONCLUSION */}
            <div>
              <label htmlFor="conclusion" className="block text-lg font-semibold mb-1">
                Conclusion
              </label>
              <textarea
                id="conclusion"
                name="conclusion"
                value={irac.conclusion}
                onChange={handleChange}
                rows={3}
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-slate-700 text-white border-gray-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                placeholder="Summarize the final outcome or result based on your analysis..."
              />
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Example: &quot;A valid contract was formed, since acceptance was effective upon emailing.&quot;
              </p>
            </div>
          </form>
        </div>

        {/* Configuration Modal */}
        <AnimatePresence>
          {isConfigModalOpen && (
            <motion.div
              className={`fixed inset-0 flex items-center justify-center ${
                isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
              } z-50`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto max-h-screen ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className={`text-2xl font-semibold mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Configure IRAC Tool
                </h2>
                <form>
                  {/* IRAC Template Type */}
                  <div className="mb-4">
                    <label
                      className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      IRAC Template Type:
                    </label>
                    <select
                      name="templateType"
                      value={examConfig.templateType}
                      onChange={handleConfigChange}
                      className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Expanded">Expanded</option>
                    </select>
                  </div>

                  {/* Legal Area */}
                  <div className="mb-4">
                    <label
                      className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Legal Area:
                    </label>
                    <select
                      name="legalArea"
                      value={examConfig.legalArea}
                      onChange={handleConfigChange}
                      className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      <option value="General Law">General Law</option>
                      <option value="Contract Law">Contract Law</option>
                      <option value="Torts">Torts</option>
                      <option value="Criminal Law">Criminal Law</option>
                      <option value="Property Law">Property Law</option>
                      <option value="Family Law">Family Law</option>
                      <option value="Corporate Law">Corporate Law</option>
                      {/* Add more legal areas as needed */}
                    </select>
                  </div>

                  {/* Detail Level */}
                  <div className="mb-4">
                    <label
                      className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Detail Level:
                    </label>
                    <select
                      name="detailLevel"
                      value={examConfig.detailLevel}
                      onChange={handleConfigChange}
                      className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
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
                      className={`h-5 w-5 ${
                        isDarkMode
                          ? 'text-blue-900 bg-gray-600 border-gray-500'
                          : 'text-blue-900 bg-white border-gray-300'
                      } focus:ring-blue-500 rounded`}
                    />
                    <label
                      htmlFor="includeCounterAnalysis"
                      className={`ml-3 block ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
                    >
                      Include Counter-Analysis
                    </label>
                  </div>

                  {/* Number of IRAC Entries */}
                  <div className="mb-6">
                    <label
                      className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
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
                      className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        // You can implement a reset or apply logic here
                        closeConfigModal();
                      }}
                      className={`h-10 sm:h-12 px-6 py-2 rounded ${
                        isDarkMode
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      } transition-colors duration-200 text-sm sm:text-base`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Implement any apply logic if needed
                        closeConfigModal();
                      }}
                      className={`h-10 sm:h-12 px-6 py-2 rounded ${
                        isDarkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-900 hover:bg-blue-950 text-white'
                      } transition-colors duration-200 text-sm sm:text-base`}
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load Progress Modal */}
        <AnimatePresence>
          {isLoadProgressModalOpen && (
            <motion.div
              className={`fixed inset-0 flex items-center justify-center ${
                isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
              } z-50`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-screen ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className={`text-2xl font-semibold mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Load Saved Progress
                </h2>
                {savedProgresses.length === 0 ? (
                  <p
                    className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    No saved progresses found.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {savedProgresses.map((progress) => (
                      <li
                        key={progress.id}
                        className={`p-4 border ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        } rounded`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p
                              className={`font-semibold ${
                                isDarkMode ? 'text-blue-400' : 'text-blue-900'
                              }`}
                            >
                              IRAC Template: {progress.examConfig.templateType}
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              Legal Area: {progress.examConfig.legalArea}
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              Detail Level: {progress.examConfig.detailLevel}
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              Include Counter-Analysis:{' '}
                              {progress.examConfig.includeCounterAnalysis ? 'Yes' : 'No'}
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              Number of IRAC Entries: {progress.examConfig.numberOfIrac}
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              Saved on: {new Date(progress.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleLoadProgress(progress)}
                              className={`h-10 w-20 sm:w-24 overflow-hidden rounded ${
                                isDarkMode
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              } transition-colors duration-200 text-sm sm:text-base`}
                              aria-label="Load Progress"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDeleteProgress(progress.id)}
                              className={`h-10 w-20 sm:w-24 overflow-hidden rounded ${
                                isDarkMode
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              } transition-colors duration-200 text-sm sm:text-base`}
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
                    className={`h-10 sm:h-12 px-6 py-2 rounded ${
                      isDarkMode
                        ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                    } transition-colors duration-200 text-sm sm:text-base`}
                    aria-label="Close Load Progress Modal"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Success Alert */}
        {/* You can implement a toast notification system here for better UX */}
      </main>
    </div>
  );
}
