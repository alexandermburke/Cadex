'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FaLock,
  FaBookOpen,
  FaFolderOpen,
  FaBrain,
  FaListAlt,
  FaTools,
  FaBook,
  FaGraduationCap,
  FaStickyNote,
  FaFileInvoice,
  FaClipboardList,
  FaClipboardCheck,
  FaClock,
  FaChartBar,
  FaRobot,
  FaListOl,
  FaBookReader,
  FaExclamationTriangle,
  FaGavel,
  FaHome,
  FaUniversity,
  FaComment,
  FaChevronDown,
  FaChevronUp,
  FaVideo,
  FaPlayCircle,
  FaChalkboardTeacher,
  FaLightbulb
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const NavLink = ({ href, icon, label, active }) => (
  <div>
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 p-3 rounded transition-colors duration-200',
        {
          'bg-blue-600': active,
          'hover:bg-blue-600 hover:bg-opacity-75': !active,
        }
      )}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  </div>
);

const LockedNavLink = ({ icon, label }) => (
  <div>
    <div className="flex items-center justify-between gap-2 p-3 text-gray-400 cursor-not-allowed">
      <div className="flex items-center gap-3">
        {icon}
        <span className="relative">{label}</span>
      </div>
      <FaLock className="text-gray-400" size={14} />
    </div>
  </div>
);

const ToggleSection = ({ isOpen, toggle, title, icon, children }) => (
  <section>
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-600 hover:bg-opacity-75 transition-colors duration-200"
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
        className="mt-2 ml-6 border-l-2 border-white pl-4"
      >
        {children}
      </div>
    )}
  </section>
);

export default function Sidebar({
  activeLink,
  isSidebarVisible,
  toggleSidebar,
  isAiTutor,
}) {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const plan = userDataObj?.billing?.plan?.toLowerCase() || 'free';
  const isFree = plan === 'free';
  const isBasic = plan === 'basic'; // Changed to free for testing purposes; testing enviornment
  const isPro = plan === 'pro';
  const isExpert = plan === 'expert'; 
  const isDarkMode = userDataObj?.darkMode || false;

  const [isCaseBriefBankOpen, setIsCaseBriefBankOpen] = useState(false);
  const [isStudyToolsOpen, setIsStudyToolsOpen] = useState(false);
  const [isExamPrepOpen, setIsExamPrepOpen] = useState(false);
  const [isSubjectGuidesOpen, setIsSubjectGuidesOpen] = useState(false);
  const [showAllApps, setShowAllApps] = useState(true);
  const [isVideoLessonsOpen, setIsVideoLessonsOpen] = useState(false);
  const [isQuimbeeOpen, setIsQuimbeeOpen] = useState(false);

  useEffect(() => {
    const storedCaseBriefBankOpen = localStorage.getItem('isCaseBriefBankOpen');
    if (storedCaseBriefBankOpen) {
      setIsCaseBriefBankOpen(storedCaseBriefBankOpen === 'true');
    }
    const storedStudyToolsOpen = localStorage.getItem('isStudyToolsOpen');
    if (storedStudyToolsOpen) {
      setIsStudyToolsOpen(storedStudyToolsOpen === 'true');
    }
    const storedExamPrepOpen = localStorage.getItem('isExamPrepOpen');
    if (storedExamPrepOpen) {
      setIsExamPrepOpen(storedExamPrepOpen === 'true');
    }
    const storedSubjectGuidesOpen = localStorage.getItem('isSubjectGuidesOpen');
    if (storedSubjectGuidesOpen) {
      setIsSubjectGuidesOpen(storedSubjectGuidesOpen === 'true');
    }
    const storedVideoLessonsOpen = localStorage.getItem('isVideoLessonsOpen');
    if (storedVideoLessonsOpen) {
      setIsVideoLessonsOpen(storedVideoLessonsOpen === 'true');
    }
    const storedQuimbeeOpen = localStorage.getItem('isQuimbeeOpen');
    if (storedQuimbeeOpen) {
      setIsQuimbeeOpen(storedQuimbeeOpen === 'true');
    }

    // Restore showAllApps toggle
    const storedShowAllApps = localStorage.getItem('showAllApps');
    if (storedShowAllApps) {
      setShowAllApps(storedShowAllApps === 'true');
    }
  }, []);

  const toggleCaseBriefBank = () => {
    setIsCaseBriefBankOpen((prev) => {
      localStorage.setItem('isCaseBriefBankOpen', !prev);
      return !prev;
    });
  };

  const toggleStudyTools = () => {
    setIsStudyToolsOpen((prev) => {
      localStorage.setItem('isStudyToolsOpen', !prev);
      return !prev;
    });
  };

  const toggleExamPrep = () => {
    setIsExamPrepOpen((prev) => {
      localStorage.setItem('isExamPrepOpen', !prev);
      return !prev;
    });
  };

  const toggleSubjectGuides = () => {
    setIsSubjectGuidesOpen((prev) => {
      localStorage.setItem('isSubjectGuidesOpen', !prev);
      return !prev;
    });
  };

  const toggleVideoLessons = () => {
    setIsVideoLessonsOpen((prev) => {
      localStorage.setItem('isVideoLessonsOpen', !prev);
      return !prev;
    });
  };

  const toggleQuimbee = () => {
    setIsQuimbeeOpen((prev) => {
      localStorage.setItem('isQuimbeeOpen', !prev);
      return !prev;
    });
  };

  // Save showAllApps toggle to localStorage
  const handleToggleShowAllApps = (value) => {
    setShowAllApps(value);
    localStorage.setItem('showAllApps', value);
  };

  const sidebarVariants = {
    hidden: {
      x: '-100%',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    visible: {
      x: '0%',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const sidebarBackground = clsx({
    'bg-gradient-to-br from-blue-700 to-purple-700': !isDarkMode,
    'bg-gradient-to-tr from-slate-900 to-blue-950': isDarkMode,
  });

  const planBadgeStyle = (() => {
    if (isPro) {
      return 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white';
    }
    if (isBasic) {
      return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    }
    if (isExpert) {
      return 'bg-gradient-to-r from-teal-400 to-teal-500 text-white';
    }
    return 'bg-gradient-to-r from-gray-400 to-gray-400 text-white';
  })();

  const appModes = [
    { label: 'My Apps', value: false },
    { label: 'All Apps', value: true },
  ];
  const selectedIndex = showAllApps ? 1 : 0;

  return (
    <motion.aside
      className={`z-[150] fixed top-0 left-0 w-96 h-full ${sidebarBackground} text-white flex flex-col md:relative md:translate-x-0 overflow-y-auto transition-colors duration-500 shadow-xl rounded-lg`}
      initial="hidden"
      animate={isSidebarVisible ? 'visible' : 'hidden'}
      variants={sidebarVariants}
      exit="hidden"
      aria-label="Sidebar Navigation"
    >
      <div className="p-6 flex items-center justify-center bg-opacity-20">
        <h1 className="text-4xl font-normal relative overflow-hidden">
          Dashboard
        </h1>
      </div>

      {/* Two-way toggle switch (My Apps / All Apps) */}
      <section className="my-4 px-6">
        <div className="relative flex items-center justify-center">
          <div
            className={clsx(
              'relative flex items-center rounded-full p-1 transition-colors duration-200',
              isDarkMode ? 'bg-gray-200' : 'bg-gray-200'
            )}
            style={{ width: '160px' }}
          >
            <motion.div
              className={clsx(
                'absolute top-0 left-0 h-full rounded-full shadow',
                isDarkMode ? 'bg-white' : 'bg-white'
              )}
              style={{ width: '50%' }}
              initial={false}
              animate={{ x: `${selectedIndex * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            {appModes.map((mode, i) => (
              <button
                key={mode.value.toString()}
                onClick={() => handleToggleShowAllApps(mode.value)}
                className={clsx(
                  'relative z-10 flex-1 text-xs sm:text-sm font-semibold py-1 transition-colors',
                  selectedIndex === i
                    ? isDarkMode
                      ? 'text-blue-600'
                      : 'text-blue-600'
                    : isDarkMode
                    ? 'text-gray-700'
                    : 'text-gray-700'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <nav className="flex-1 px-6 py-4 space-y-6">
        <ToggleSection
          isOpen={isCaseBriefBankOpen}
          toggle={toggleCaseBriefBank}
          title="Case Brief Bank"
          icon={<FaFolderOpen className="text-lg" />}
        >
          {isBasic || isPro || isExpert ? (
            <>
              <NavLink
                href="/casebriefs/summaries"
                icon={<FaBookOpen className="text-sm" />}
                label="Case Summaries"
                active={activeLink === '/casebriefs/summaries'}
              />
              <NavLink
                href="/casebriefs/analysis"
                icon={<FaRobot className="text-sm" />}
                label="Case Analysis"
                active={activeLink === '/casebriefs/analysis'}
              />
              <NavLink
                href="/casebriefs/allbriefs"
                icon={<FaListAlt className="text-sm" />}
                label="All Briefs"
                active={activeLink === '/casebriefs/allbriefs'}
              />
            </>
          ) : showAllApps ? (
            <>
              <LockedNavLink
                icon={<FaBookOpen className="text-sm" />}
                label="Case Summaries"
              />
              <LockedNavLink
                icon={<FaRobot className="text-sm" />}
                label="Case Analysis"
              />
              <LockedNavLink
                icon={<FaListAlt className="text-sm" />}
                label="All Briefs"
              />
            </>
          ) : null}
        </ToggleSection>

        <ToggleSection
          isOpen={isStudyToolsOpen}
          toggle={toggleStudyTools}
          title="Study Tools"
          icon={<FaTools className="text-lg" />}
        >
          {isBasic || isPro || isExpert ? (
            <>
              <NavLink
                href="/lawtools/dictionary"
                icon={<FaBook className="text-sm" />}
                label="Legal Dictionary"
                active={activeLink === '/lawtools/dictionary'}
              />
              <NavLink
                href="/lawtools/lecturesummaries"
                icon={<FaGraduationCap className="text-sm" />}
                label="Lecture Summaries"
                active={activeLink === '/lawtools/lecturesummaries'}
              />
              <NavLink
                href="/ailawtools/flashcards"
                icon={<FaStickyNote className="text-sm" />}
                label="Flashcards & Outlines"
                active={activeLink === '/ailawtools/flashcards'}
              />
              <NavLink
                href="/ailawtools/irac"
                icon={<FaBookReader className="text-sm" />}
                label="IRAC Drafting"
                active={activeLink === '/ailawtools/irac'}
              />
            </>
          ) : showAllApps ? (
            <>
              <LockedNavLink
                icon={<FaBook className="text-sm" />}
                label="Legal Dictionary"
              />
              <LockedNavLink
                icon={<FaGraduationCap className="text-sm" />}
                label="Lecture Summaries"
              />
              <LockedNavLink
                icon={<FaStickyNote className="text-sm" />}
                label="Flashcards & Outlines"
              />
              <LockedNavLink
                icon={<FaBookReader className="text-sm" />}
                label="IRAC Drafting"
              />
            </>
          ) : null}
        </ToggleSection>

        <ToggleSection
          isOpen={isExamPrepOpen}
          toggle={toggleExamPrep}
          title="Exam Prep"
          icon={<FaClipboardList className="text-lg" />}
        >
          {isPro || isExpert ? (
            <>
              <NavLink
                href="/ailawtools/examprep"
                icon={<FaClipboardCheck className="text-sm" />}
                label="Practice Exams"
                active={activeLink === '/ailawtools/examprep'}
              />
              <NavLink
                href="/ailawtools/examprep/timemanagement"
                icon={<FaClock className="text-sm" />}
                label="Time Management"
                active={activeLink === '/ailawtools/examprep/timemanagement'}
              />
              <NavLink
                href="/ailawtools/insights"
                icon={<FaChartBar className="text-sm" />}
                label="Exam Insights"
                active={activeLink === '/ailawtools/insights'}
              />
              <NavLink
                href="/ailawtools/examprep/mbe"
                icon={<FaListOl className="text-sm" />}
                label="MBE Practice"
                active={activeLink === '/ailawtools/examprep/mbe'}
              />
              <NavLink
                href="/ailawtools/lexapi"
                icon={<FaBrain className="text-sm" />}
                label="LExAPI Tutor"
                active={activeLink === '/ailawtools/lexapi'}
              />
            </>
          ) : showAllApps ? (
            <>
              <LockedNavLink
                icon={<FaClipboardCheck className="text-sm" />}
                label="Practice Exams"
              />
              <LockedNavLink
                icon={<FaClock className="text-sm" />}
                label="Time Management"
              />
              <LockedNavLink
                icon={<FaChartBar className="text-sm" />}
                label="Exam Insights"
              />
              <LockedNavLink
                icon={<FaListOl className="text-sm" />}
                label="MBE Practice"
              />
              <LockedNavLink
                icon={<FaBrain className="text-sm" />}
                label="LExAPI Tutor"
              />
            </>
          ) : null}
        </ToggleSection>

        <ToggleSection
          isOpen={isSubjectGuidesOpen}
          toggle={toggleSubjectGuides}
          title="Subject Guides"
          icon={<FaBookReader className="text-lg" />}
        >
          {isPro || isExpert ? (
            <>
              <NavLink
                href="/subjects/contracts"
                icon={<FaBookReader className="text-sm" />}
                label="Contracts"
                active={activeLink === '/subjects/contracts'}
              />
              <NavLink
                href="/subjects/torts"
                icon={<FaExclamationTriangle className="text-sm" />}
                label="Torts"
                active={activeLink === '/subjects/torts'}
              />
              <NavLink
                href="/subjects/crimlaw"
                icon={<FaGavel className="text-sm" />}
                label="Criminal Law"
                active={activeLink === '/subjects/crimlaw'}
              />
              <NavLink
                href="/subjects/property"
                icon={<FaHome className="text-sm" />}
                label="Property"
                active={activeLink === '/subjects/property'}
              />
              <NavLink
                href="/subjects/constitutional-law"
                icon={<FaUniversity className="text-sm" />}
                label="Constitutional Law"
                active={activeLink === '/subjects/constitutional-law'}
              />
            </>
          ) : showAllApps ? (
            <>
              <LockedNavLink
                icon={<FaBookReader className="text-sm" />}
                label="Contracts"
              />
              <LockedNavLink
                icon={<FaExclamationTriangle className="text-sm" />}
                label="Torts"
              />
              <LockedNavLink
                icon={<FaGavel className="text-sm" />}
                label="Criminal Law"
              />
              <LockedNavLink
                icon={<FaHome className="text-sm" />}
                label="Property"
              />
              <LockedNavLink
                icon={<FaUniversity className="text-sm" />}
                label="Constitutional Law"
              />
            </>
          ) : null}
        </ToggleSection>

        <ToggleSection
          isOpen={isVideoLessonsOpen}
          toggle={toggleVideoLessons}
          title="Video Lessons"
          icon={<FaVideo className="text-lg" />}
        >
          {isExpert ? (
            <NavLink
              href="/videos/directory"
              icon={<FaPlayCircle className="text-sm" />}
              label="Directory (Coming Soon)"
              active={activeLink === '/videos/directory'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaPlayCircle className="text-sm" />}
              label="Directory (Coming Soon)"
            />
          ) : null}
        </ToggleSection>

        <ToggleSection
          isOpen={isQuimbeeOpen}
          toggle={toggleQuimbee}
          title="Career & Internship Resources"
          icon={<FaChalkboardTeacher className="text-lg" />}
        >
          {isExpert ? (
            <>
              <NavLink
                href="/lawtools/careerresources"
                icon={<FaLightbulb className="text-sm" />}
                label="Resume Review"
                active={activeLink === '/lawtools/careerresources'}
              />
              <NavLink
                href="/lawtools/interviewprep"
                icon={<FaComment className="text-sm" />}
                label="Interview Preparation"
                active={activeLink === '/lawtools/interviewprep'}
              />
              <NavLink
                href="/lawtools/networking"
                icon={<FaChalkboardTeacher className="text-sm" />}
                label="Networking Opportunities"
                active={activeLink === '/lawtools/networking'}
              />
            </>
          ) : showAllApps ? (
            <>
              <LockedNavLink
                icon={<FaLightbulb className="text-sm" />}
                label="Resume Review"
              />
              <LockedNavLink
                icon={<FaComment className="text-sm" />}
                label="Interview Preparation"
              />
              <LockedNavLink
                icon={<FaChalkboardTeacher className="text-sm" />}
                label="Networking Opportunities"
              />
            </>
          ) : null}
        </ToggleSection>

        <section>
          <Link
            href="https://discord.gg/wKgH9ussWc"
            className="flex items-center gap-3 p-3 rounded transition-colors duration-200 hover:bg-blue-800 hover:bg-opacity-75 mt-6"
          >
            <FaComment className="text-lg" />
            <span>Requests/Suggestions</span>
          </Link>
        </section>
      </nav>

      <footer className="px-6 py-14 bg-transparent">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {currentUser?.displayName || 'User'}
            </p>
            <p className="text-sm text-blue-200 truncate">
              {currentUser?.email || 'user@example.com'}
            </p>
          </div>
          <span
            className={clsx(
              'px-3 py-1 rounded text-xs font-semibold uppercase whitespace-nowrap',
              planBadgeStyle
            )}
          >
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </span>
        </div>
      </footer>
    </motion.aside>
  );
}
