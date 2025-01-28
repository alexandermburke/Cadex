/********************************************************************************************
 * ResumeReviewer.jsx
 * - A single-page resume reviewer catering to law students.
 * - Displays a PDF preview (defaulting to "default.pdf") and offers AI-based feedback.
 * - Maintains similar layout, color scheme, and styling as the original component.
 * - Includes a new section at the bottom showcasing potential job matches (UI only).
 ********************************************************************************************/

'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaUpload, FaRobot, FaBriefcase } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ResumeReviewer() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Resume file & AI Analysis
  const [resumeFile, setResumeFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  // PDF preview (use default.pdf if no file uploaded)
  const [pdfSrc, setPdfSrc] = useState('/default.pdf');

  // If not logged in, show prompt to log in
  if (!currentUser) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center h-full transition-colors',
          isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-800'
        )}
      >
        <div
          className={clsx(
            'p-6 rounded-2xl shadow-xl text-center',
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          )}
        >
          <p className="mb-4 text-lg font-semibold">
            Please log in to access the Resume Reviewer.
          </p>
          <button
            onClick={() => router.push('/login')}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300',
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-950 hover:bg-blue-800 text-white'
            )}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Handle resume file selection
  const handleResumeFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setAnalysisResult('');
      setUploadStatus('File selected. Ready for AI feedback.');

      // Generate a local preview URL
      const fileUrl = URL.createObjectURL(file);
      setPdfSrc(fileUrl);
    }
  };

  // Simulated AI analysis (replace with your own API call if desired)
  const handleAnalyzeResume = async () => {
    if (!resumeFile) {
      setUploadStatus('Please select a PDF resume file first.');
      return;
    }
    setUploadStatus('Analyzing your resume with AI...');
    try {
      // Simulate a delay for "analysis"
      setTimeout(() => {
        setAnalysisResult(
          'Your resume effectively highlights your legal writing skills, but consider emphasizing real-world litigation or advocacy experience. Expand on your law school honors and include relevant coursework aligned with your career goals.'
        );
        setUploadStatus('Analysis complete!');
      }, 2000);
    } catch (error) {
      setUploadStatus('There was an error analyzing your resume.');
    }
  };

  // Framer Motion variants for the main container
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeInOut' }
    }
  };

  return (
    <div
      className={clsx(
        'relative flex h-screen transition-colors duration-500',
        isDarkMode ? 'text-white' : 'text-gray-800'
      )}
    >
      {/* Sidebar + overlay (mobile) */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/lawtools/careerresources"
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-6 relative z-50 h-screen">
        {/* Mobile Sidebar Toggle Button */}
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

        {/* Container for Resume Reviewer */}
        <motion.div
          className={clsx(
            'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-gray-800'
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section: File Upload and AI Feedback (improved UI) */}
            <div
              className={clsx(
                'p-6 rounded-lg shadow-md flex flex-col space-y-4',
                isDarkMode
                  ? 'bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700'
                  : 'bg-gradient-to-tr from-blue-50 to-blue-100 border border-blue-200'
              )}
            >
              <div className="flex flex-col space-y-2">
                <h2
                  className={clsx(
                    'text-xl font-bold',
                    isDarkMode ? 'text-blue-400' : 'text-blue-900'
                  )}
                >
                  Upload Your Resume
                </h2>
                <p className="text-sm">
                  Upload your PDF resume to get instant AI-based feedback on how to
                  improve it for the legal job market.
                </p>
              </div>

              {/* Custom File Upload Button */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <label
                  htmlFor="resume-upload"
                  className={clsx(
                    'cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded hover:bg-blue-800 focus:outline-none'
                  )}
                >
                  <FaUpload className="mr-2" />
                  <span>Select PDF</span>
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleResumeFileChange}
                />

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyzeResume}
                  className={clsx(
                    'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded text-white',
                    'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  <FaRobot />
                  <span>Analyze Resume</span>
                </button>
              </div>

              {/* Status / Feedback Display */}
              {uploadStatus && (
                <p
                  className={clsx(
                    'text-sm italic mt-1',
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  )}
                >
                  {uploadStatus}
                </p>
              )}
              {analysisResult && (
                <div
                  className={clsx(
                    'mt-4 p-4 rounded text-sm',
                    isDarkMode
                      ? 'bg-slate-800 text-gray-100'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <h4 className="font-semibold mb-2">AI Feedback:</h4>
                  <p>{analysisResult}</p>
                </div>
              )}
            </div>

            {/* Right Section: PDF Preview */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-sm">Resume Preview</h4>
              </div>
              <div className="relative w-full h-[600px] rounded overflow-hidden">
                <embed
                  src={`${pdfSrc}#toolbar=0&navpanes=0&scrollbar=0`}
                  type="application/pdf"
                  className="w-full h-full"
                />
              </div>
              <p className="text-xs mt-2 italic">
                {resumeFile
                  ? 'Previewing your uploaded PDF.'
                  : 'Currently showing default.pdf'}
              </p>
            </div>
          </div>

          {/* Potential Jobs Section (UI Only) */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FaBriefcase className="text-blue-500" />
              Potential Job Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Job Card 1 */}
              <div
                className={clsx(
                  'p-4 rounded-md shadow-md transition-colors',
                  isDarkMode
                    ? 'bg-slate-800 text-gray-100 border border-slate-700'
                    : 'bg-gray-50 text-gray-800 border border-gray-200'
                )}
              >
                <h3 className="text-lg font-bold mb-1">
                  Junior Associate (Litigation)
                </h3>
                <p className="text-sm mb-2">Location: New York, NY</p>
                <p className="text-sm">
                  A mid-sized litigation firm seeking law graduates with strong
                  research and writing skills. Focus on commercial disputes.
                </p>
                <button
                  className={clsx(
                    'mt-3 inline-block px-3 py-1 text-sm rounded bg-blue-700 text-white hover:bg-blue-800'
                  )}
                >
                  Learn More
                </button>
              </div>

              {/* Job Card 2 */}
              <div
                className={clsx(
                  'p-4 rounded-md shadow-md transition-colors',
                  isDarkMode
                    ? 'bg-slate-800 text-gray-100 border border-slate-700'
                    : 'bg-gray-50 text-gray-800 border border-gray-200'
                )}
              >
                <h3 className="text-lg font-bold mb-1">
                  Public Defender Fellowship
                </h3>
                <p className="text-sm mb-2">Location: Boston, MA</p>
                <p className="text-sm">
                  A year-long fellowship for graduates passionate about criminal
                  defense and advocacy for underrepresented communities.
                </p>
                <button
                  className={clsx(
                    'mt-3 inline-block px-3 py-1 text-sm rounded bg-blue-700 text-white hover:bg-blue-800'
                  )}
                >
                  Learn More
                </button>
              </div>

              {/* Job Card 3 */}
              <div
                className={clsx(
                  'p-4 rounded-md shadow-md transition-colors',
                  isDarkMode
                    ? 'bg-slate-800 text-gray-100 border border-slate-700'
                    : 'bg-gray-50 text-gray-800 border border-gray-200'
                )}
              >
                <h3 className="text-lg font-bold mb-1">
                  In-House Counsel Intern
                </h3>
                <p className="text-sm mb-2">Location: San Francisco, CA</p>
                <p className="text-sm">
                  Tech startup seeking law student interns for corporate, IP, and
                  contract work in a fast-paced environment.
                </p>
                <button
                  className={clsx(
                    'mt-3 inline-block px-3 py-1 text-sm rounded bg-blue-700 text-white hover:bg-blue-800'
                  )}
                >
                  Learn More
                </button>
              </div>

              {/* Job Card 4 */}
              <div
                className={clsx(
                  'p-4 rounded-md shadow-md transition-colors',
                  isDarkMode
                    ? 'bg-slate-800 text-gray-100 border border-slate-700'
                    : 'bg-gray-50 text-gray-800 border border-gray-200'
                )}
              >
                <h3 className="text-lg font-bold mb-1">
                  Government Policy Analyst
                </h3>
                <p className="text-sm mb-2">Location: Washington, D.C.</p>
                <p className="text-sm">
                  Entry-level legal/policy position focusing on legislative
                  analysis, research, and regulatory compliance at a federal agency.
                </p>
                <button
                  className={clsx(
                    'mt-3 inline-block px-3 py-1 text-sm rounded bg-blue-700 text-white hover:bg-blue-800'
                  )}
                >
                  Learn More
                </button>
              </div>

              {/* Job Card 5 */}
              <div
                className={clsx(
                  'p-4 rounded-md shadow-md transition-colors',
                  isDarkMode
                    ? 'bg-slate-800 text-gray-100 border border-slate-700'
                    : 'bg-gray-50 text-gray-800 border border-gray-200'
                )}
              >
                <h3 className="text-lg font-bold mb-1">
                  Environmental Law Fellowship
                </h3>
                <p className="text-sm mb-2">Location: Denver, CO</p>
                <p className="text-sm">
                  Non-profit organization seeking fellows to focus on environmental
                  litigation and policy in the Rocky Mountain region.
                </p>
                <button
                  className={clsx(
                    'mt-3 inline-block px-3 py-1 text-sm rounded bg-blue-700 text-white hover:bg-blue-800'
                  )}
                >
                  Learn More
                </button>
              </div>

              {/* Job Card 6 */}
              <div
                className={clsx(
                  'p-4 rounded-md shadow-md transition-colors',
                  isDarkMode
                    ? 'bg-slate-800 text-gray-100 border border-slate-700'
                    : 'bg-gray-50 text-gray-800 border border-gray-200'
                )}
              >
                <h3 className="text-lg font-bold mb-1">
                  Corporate M&A Associate
                </h3>
                <p className="text-sm mb-2">Location: Chicago, IL</p>
                <p className="text-sm">
                  Top-tier law firm seeking recent grads for mergers & acquisitions
                  team. Opportunity for cross-border deal exposure.
                </p>
                <button
                  className={clsx(
                    'mt-3 inline-block px-3 py-1 text-sm rounded bg-blue-700 text-white hover:bg-blue-800'
                  )}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
