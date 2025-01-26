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
          'bg-blue-800': active,
          'hover:bg-blue-800 hover:bg-opacity-75': !active,
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
        className="mt-2 ml-6 border-l-2 border-white pl-4"
      >
        {children}
      </div>
    )}
  </section>
);

export default function Sidebar({ activeLink, isSidebarVisible, toggleSidebar, isAiTutor }) {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const plan = userDataObj?.billing?.plan?.toLowerCase() || 'free';
  const isFree = plan === 'free';
  const isBasic = plan === 'basic';
  const isPro = plan === 'pro';
  const isExpert = plan === 'free';
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
  }, []);

  const toggleCaseBriefBank = () => {
    setIsCaseBriefBankOpen(prev => {
      localStorage.setItem('isCaseBriefBankOpen', !prev);
      return !prev;
    });
  };

  const toggleStudyTools = () => {
    setIsStudyToolsOpen(prev => {
      localStorage.setItem('isStudyToolsOpen', !prev);
      return !prev;
    });
  };

  const toggleExamPrep = () => {
    setIsExamPrepOpen(prev => {
      localStorage.setItem('isExamPrepOpen', !prev);
      return !prev;
    });
  };

  const toggleSubjectGuides = () => {
    setIsSubjectGuidesOpen(prev => {
      localStorage.setItem('isSubjectGuidesOpen', !prev);
      return !prev;
    });
  };

  const toggleVideoLessons = () => {
    setIsVideoLessonsOpen(prev => {
      localStorage.setItem('isVideoLessonsOpen', !prev);
      return !prev;
    });
  };

  const toggleQuimbee = () => {
    setIsQuimbeeOpen(prev => {
      localStorage.setItem('isQuimbeeOpen', !prev);
      return !prev;
    });
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
    'bg-gradient-to-br from-blue-900 to-purple-900': isDarkMode,
    'bg-gradient-to-br from-blue-950 to-slate-950': !isDarkMode,
  });

  const planBadgeStyle = (() => {
    if (isPro) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    if (isBasic) return 'bg-gradient-to-r from-teal-400 to-teal-600 text-white';
    if (isExpert) return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
    return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
  })();

  return (
    <motion.aside
      className={`z-[100] fixed top-0 left-0 w-96 h-full ${sidebarBackground} text-white flex flex-col md:relative md:translate-x-0 overflow-y-auto transition-colors duration-500 shadow-xl rounded-md`}
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

      <section className="flex items-center justify-center gap-4 my-4 px-6">
        <span className="font-semibold">My Apps</span>
        <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
          <input
            type="checkbox"
            name="appsToggle"
            id="appsToggle"
            checked={showAllApps}
            onChange={() => setShowAllApps(!showAllApps)}
            className="toggle-checkbox absolute h-0 w-0 opacity-0"
          />
          <label
            htmlFor="appsToggle"
            className={`toggle-label block overflow-hidden h-8 rounded-full cursor-pointer transition-colors duration-200 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute left-1 top-1 bg-transparent w-6 h-6 rounded-full transition-transform duration-200 ${
                showAllApps ? 'translate-x-0' : 'translate-x-6'
              }`}
            ></span>
          </label>
        </div>
        <span className="font-semibold">All Apps</span>
      </section>

      <nav className="flex-1 px-6 py-4 space-y-6">
        <ToggleSection
          isOpen={isCaseBriefBankOpen}
          toggle={toggleCaseBriefBank}
          title="Case Brief Bank"
          icon={<FaFolderOpen className="text-lg" />}
        >
          <NavLink
            href="/casebriefs/summaries"
            icon={<FaBookOpen className="text-sm" />}
            label="Case Summaries"
            active={activeLink === '/casebriefs/summaries'}
          />
          <NavLink
            href="/casebriefs/analysis"
            icon={<FaRobot className="text-sm" />} // Changed from FaBrain to FaRobot for uniqueness
            label="Case Analysis"
            active={activeLink === '/casebriefs/analysis'}
          />
          <NavLink
            href="/casebriefs/allbriefs"
            icon={<FaListAlt className="text-sm" />}
            label="All Briefs"
            active={activeLink === '/casebriefs/allbriefs'}
          />
        </ToggleSection>

        <ToggleSection
          isOpen={isStudyToolsOpen}
          toggle={toggleStudyTools}
          title="Study Tools"
          icon={<FaTools className="text-lg" />}
        >
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
          {isBasic || isPro || isExpert ? (
            <NavLink
              href="/ailawtools/flashcards"
              icon={<FaStickyNote className="text-sm" />}
              label="Flashcards & Outlines"
              active={activeLink === '/ailawtools/flashcards'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaStickyNote className="text-sm" />}
              label="Flashcards & Outlines"
            />
          ) : null}
          {isBasic || isPro || isExpert ? (
            <NavLink
              href="/ailawtools/irac"
              icon={<FaBookReader className="text-sm" />} // Changed from FaFileInvoice to FaBookReader for uniqueness
              label="IRAC Generator"
              active={activeLink === '/ailawtools/irac'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaBookReader className="text-sm" />}
              label="IRAC Generator"
            />
          ) : null}
        </ToggleSection>

        <ToggleSection
          isOpen={isExamPrepOpen}
          toggle={toggleExamPrep}
          title="Exam Prep"
          icon={<FaClipboardList className="text-lg" />}
        >
          {isBasic || isPro || isExpert ? (
            <NavLink
              href="/ailawtools/examprep"
              icon={<FaClipboardCheck className="text-sm" />}
              label="Practice Exams"
              active={activeLink === '/ailawtools/examprep'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaClipboardCheck className="text-sm" />}
              label="Practice Exams"
            />
          ) : null}
          {isBasic || isPro || isExpert ? (
            <NavLink
              href="/ailawtools/examprep/timemanagement"
              icon={<FaClock className="text-sm" />}
              label="Time Management"
              active={activeLink === '/ailawtools/examprep/timemanagement'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaClock className="text-sm" />}
              label="Time Management"
            />
          ) : null}
          {isPro || isExpert ? (
            <NavLink
              href="/ailawtools/insights"
              icon={<FaChartBar className="text-sm" />}
              label="Exam Insights"
              active={activeLink === '/ailawtools/insights'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaChartBar className="text-sm" />}
              label="Exam Insights"
            />
          ) : null}
          {isBasic || isPro || isExpert ? (
            <NavLink
              href="/ailawtools/examprep/mbe"
              icon={<FaListOl className="text-sm" />}
              label="MBE Practice"
              active={activeLink === '/ailawtools/examprep/mbe'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaListOl className="text-sm" />}
              label="MBE Practice"
            />
          ) : null}
          {isPro || isExpert ? (
            <NavLink
              href="/ailawtools/lexapi"
              icon={<FaBrain className="text-sm" />} 
              label="LExAPI Tutor"
              active={activeLink === '/ailawtools/lexapi'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaBrain className="text-sm" />}
              label="LExAPI Tutor"
            />
          ) : null}
        </ToggleSection>

        <ToggleSection
          isOpen={isSubjectGuidesOpen}
          toggle={toggleSubjectGuides}
          title="Subject Guides"
          icon={<FaBookReader className="text-lg" />}
        >
          {isFree || isBasic || isPro || isExpert ? (
            <NavLink
              href="/subjects/contracts"
              icon={<FaBookReader className="text-sm" />} // Changed from FaFileInvoice to FaBookReader for uniqueness
              label="Contracts"
              active={activeLink === '/subjects/contracts'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaBookReader className="text-sm" />}
              label="Contracts"
            />
          ) : null}
          {isFree || isBasic || isPro || isExpert ? (
            <NavLink
              href="/subjects/torts"
              icon={<FaExclamationTriangle className="text-sm" />}
              label="Torts"
              active={activeLink === '/subjects/torts'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaExclamationTriangle className="text-sm" />}
              label="Torts"
            />
          ) : null}
          {isBasic || isPro || isExpert ? (
            <NavLink
              href="/subjects/crimlaw"
              icon={<FaGavel className="text-sm" />}
              label="Criminal Law"
              active={activeLink === '/subjects/crimlaw'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaGavel className="text-sm" />}
              label="Criminal Law"
            />
          ) : null}
          {isPro || isExpert ? (
            <NavLink
              href="/subjects/property"
              icon={<FaHome className="text-sm" />}
              label="Property"
              active={activeLink === '/subjects/property'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaHome className="text-sm" />}
              label="Property"
            />
          ) : null}
          {isPro || isExpert ? (
            <NavLink
              href="/subjects/constitutional-law"
              icon={<FaUniversity className="text-sm" />}
              label="Constitutional Law"
              active={activeLink === '/subjects/constitutional-law'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaUniversity className="text-sm" />}
              label="Constitutional Law"
            />
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
            <NavLink
              href="/lawtools/careerresources"
              icon={<FaLightbulb className="text-sm" />}
              label="Resume Review"
              active={activeLink === '/lawtools/careerresources'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaLightbulb className="text-sm" />}
              label="Resume Review"
            />
          ) : null}
          {isExpert ? (
            <NavLink
              href="/lawtools/interviewprep"
              icon={<FaComment className="text-sm" />} // Changed from FaLightbulb to FaComment for uniqueness
              label="Interview Preparation"
              active={activeLink === '/lawtools/interviewprep'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaComment className="text-sm" />}
              label="Interview Preparation"
            />
          ) : null}
          {isExpert ? (
            <NavLink
              href="/lawtools/networking"
              icon={<FaChalkboardTeacher className="text-sm" />} // Changed from FaLightbulb to FaChalkboardTeacher for uniqueness
              label="Networking Opportunities"
              active={activeLink === '/lawtools/networking'}
            />
          ) : showAllApps ? (
            <LockedNavLink
              icon={<FaChalkboardTeacher className="text-sm" />}
              label="Networking Opportunities"
            />
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

      <footer className="px-6 py-4 bg-transparent">
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
