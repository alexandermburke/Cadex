'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChevronDown,
  FaChevronUp,
  FaUpload,
  FaRobot,
  FaComments,
  FaGraduationCap,
  FaBriefcase,
  FaHandshake,
  FaLightbulb,
  FaUserTie,
  FaLock,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function ToggleSection({ isOpen, toggle, title, icon, children }) {
  return (
    <section className="mb-4">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-800 hover:bg-opacity-75 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-controls={`${title}-section`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isOpen && (
        <div
          id={`${title}-section`}
          className="mt-2 ml-6 border-l-2 border-blue-600 pl-4"
        >
          {children}
        </div>
      )}
    </section>
  );
}

export default function CareerResources() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);
  const [isResumeReviewOpen, setIsResumeReviewOpen] = useState(false);
  const [isInterviewPrepOpen, setIsInterviewPrepOpen] = useState(false);
  const [isNetworkingOpen, setIsNetworkingOpen] = useState(false);
  const [isMentorshipOpen, setIsMentorshipOpen] = useState(false);
  const [isClerkshipOpen, setIsClerkshipOpen] = useState(false);
  const [isJobSearchOpen, setIsJobSearchOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

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
            Please log in to access these career resources.
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

  // Resume file selection
  const handleResumeFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setUploadStatus('File selected. Ready for AI analysis.');
      setAnalysisResult('');
    }
  };

  // Simulated AI analysis
  const handleAnalyzeResume = async () => {
    if (!resumeFile) {
      setUploadStatus('Please select a resume file first.');
      return;
    }
    setUploadStatus('Analyzing resume with AI (law-focused)...');
    try {
      // Simulate AI analysis
      setTimeout(() => {
        setAnalysisResult(
          'Your resume demonstrates strong legal research skills. Consider highlighting trial advocacy experience. Add more context on your moot court achievements.'
        );
        setUploadStatus('Analysis complete!');
      }, 2500);
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
              // Adjust this activeLink as needed, or pass a dedicated path for Career Resources
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
      <main className="flex-1 flex flex-col px-6 relative z-200 h-screen">
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

        {/* Container (mirroring AllBriefs styling) */}
        <motion.div
          className={clsx(
            'flex-1 w-full rounded-2xl shadow-xl p-6',
            isDarkMode
              ? 'bg-gradient-to-br from-blue-950 to-slate-950 text-white'
              : 'bg-white text-gray-800'
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl mb-6 font-semibold">Career & Internship Resources</h2>

          {/* Resume Review */}
          <ToggleSection
            isOpen={isResumeReviewOpen}
            toggle={() => setIsResumeReviewOpen(!isResumeReviewOpen)}
            title="Resume Review (LExAPI 3.0)"
            icon={<FaUpload className="text-lg" />}
          >
            <div className="space-y-4 pb-4">
              <p
                className={clsx(
                  'text-sm',
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                )}
              >
                Upload your resume and let our law-focused AI provide suggestions to
                improve your legal expertise presentation.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                  className={clsx(
                    'border border-gray-300 rounded-md text-sm p-2 bg-white text-gray-800',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                />
                <button
                  onClick={handleAnalyzeResume}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 bg-blue-700 rounded hover:bg-blue-800 transition-colors',
                    'text-white'
                  )}
                >
                  <span>Analyze Resume</span>
                </button>
              </div>
              {uploadStatus && (
                <p className="text-xs mt-2">{uploadStatus}</p>
              )}
              {analysisResult && (
                <div
                  className={clsx(
                    'p-4 rounded mt-2 text-sm',
                    isDarkMode
                      ? 'bg-slate-700 text-gray-100'
                      : 'bg-gray-800 text-gray-100'
                  )}
                >
                  <h4 className="font-bold mb-2">AI Feedback:</h4>
                  <p>{analysisResult}</p>
                </div>
              )}
            </div>
          </ToggleSection>

          {/* Interview Preparation */}
          <ToggleSection
            isOpen={isInterviewPrepOpen}
            toggle={() => setIsInterviewPrepOpen(!isInterviewPrepOpen)}
            title="Interview Preparation"
            icon={<FaComments className="text-lg" />}
          >
            <div className="space-y-4 pb-4">
              <p
                className={clsx(
                  'text-sm',
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                )}
              >
                Tips for interviews at law firms, government positions, and judicial
                clerkships.
              </p>
              <p className="text-sm">
                <strong>AI Mock Interview:</strong> Coming Soon! Practice real-time
                Q&A sessions with our law-focused AI for more interactive feedback.
              </p>
              <p className="text-sm">
                <strong>Behavioral Interview Samples:</strong> Understand how to structure
                your STAR method responses for public interest roles.
              </p>
            </div>
          </ToggleSection>

          {/* Networking Opportunities */}
          <ToggleSection
            isOpen={isNetworkingOpen}
            toggle={() => setIsNetworkingOpen(!isNetworkingOpen)}
            title="Networking Opportunities"
            icon={<FaHandshake className="text-lg" />}
          >
            <div className="space-y-4 pb-4">
              <p
                className={clsx(
                  'text-sm',
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                )}
              >
                Discover professional associations, conferences, and meetups tailored to
                law students.
              </p>
              <p className="text-sm">
                <strong>Virtual Events Calendar:</strong> Coming Soon! We’ll feature an
                up-to-date calendar of national and local legal conferences, Zoom mixers,
                and other virtual meetups.
              </p>
            </div>
          </ToggleSection>

          {/* Mentorship & Guidance */}
          <ToggleSection
            isOpen={isMentorshipOpen}
            toggle={() => setIsMentorshipOpen(!isMentorshipOpen)}
            title="Mentorship & Guidance"
            icon={<FaUserTie className="text-lg" />}
          >
            <div className="space-y-4 pb-4">
              <p
                className={clsx(
                  'text-sm',
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                )}
              >
                Connect with experienced attorneys, professors, and professionals offering
                mentorship.
              </p>
              <p className="text-sm">
                <strong>Alumni Mentorship:</strong> Request a match with alumni from top law
                schools or your own institution.
              </p>
              <p className="text-sm">
                <strong>Faculty-Led Guidance Sessions:</strong> Look for weekly or monthly
                Zoom calls where faculty from various specialties offer guidance.
              </p>
            </div>
          </ToggleSection>

          {/* Clerkship & Internship Listings */}
          <ToggleSection
            isOpen={isClerkshipOpen}
            toggle={() => setIsClerkshipOpen(!isClerkshipOpen)}
            title="Clerkship & Internship Listings"
            icon={<FaBriefcase className="text-lg" />}
          >
            <div className="space-y-4 pb-4">
              <p
                className={clsx(
                  'text-sm',
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                )}
              >
                Find up-to-date postings for judicial clerkships, law firm internships, and
                other opportunities.
              </p>
              <p className="text-sm">
                <strong>Federal/State Clerkship Database:</strong> Coming Soon! We’ll host a
                curated list of open clerkships, updated weekly.
              </p>
              <p className="text-sm">
                <strong>Law Firm Summer Associate Roles:</strong> Filter listings by region,
                practice area, or firm size.
              </p>
            </div>
          </ToggleSection>

          {/* AI Job Search Engine */}
          <ToggleSection
            isOpen={isJobSearchOpen}
            toggle={() => setIsJobSearchOpen(!isJobSearchOpen)}
            title="AI Job Search Engine"
            icon={<FaLightbulb className="text-lg" />}
          >
            <div className="space-y-4 pb-4">
              <p
                className={clsx(
                  'text-sm',
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                )}
              >
                Our upcoming AI-powered job search engine will let you filter positions
                based on location, practice area, firm size, and more. Stay tuned!
              </p>
            </div>
          </ToggleSection>

          {/* AI Cover Letter Generator */}
          <ToggleSection
            isOpen={isCoverLetterOpen}
            toggle={() => setIsCoverLetterOpen(!isCoverLetterOpen)}
            title="Cover Letter Generator (AI-Powered)"
            icon={<FaRobot className="text-lg" />}
          >
            <div className="space-y-4 pb-4">
              <p
                className={clsx(
                  'text-sm',
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                )}
              >
                Let our AI help you craft a tailored cover letter for each application,
                highlighting your relevant legal experiences and strengths.
              </p>
              <p className="text-sm">
                <strong>Coming Soon:</strong> You’ll be able to input your job details and
                the AI will generate a draft letter for you to refine.
              </p>
            </div>
          </ToggleSection>
        </motion.div>
      </main>
    </div>
  );
}
